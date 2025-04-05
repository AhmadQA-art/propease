import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../shared/infobip.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';
// Initialize Supabase client
const supabase = createClient(Deno.env.get('API_URL') ?? '', Deno.env.get('SERVICE_ROLE_KEY') ?? '');
// Maximum number of tasks to process in one run
const MAX_TASKS = 5;
serve(async (req)=>{
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }
  console.log("Starting schedule check...");
  try {
    // Process both regular schedules and announcement background tasks
    const [scheduledResults, announcementResults] = await Promise.all([
      processScheduledAnnouncements(),
      processAnnouncementBackgroundTasks()
    ]);
    return new Response(JSON.stringify({
      message: 'Schedule check completed successfully',
      scheduled_announcements: scheduledResults,
      background_tasks: announcementResults
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in schedule check:', error);
    return new Response(JSON.stringify({
      error: 'Error checking schedules',
      details: error.message
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 500
    });
  }
});
// Process scheduled announcements that are due to be sent
async function processScheduledAnnouncements() {
  const now = new Date();
  // Find schedules that are due
  const { data: dueSchedules, error: schedulesError } = await supabase.from('announcement_schedules').select(`
      id,
      announcement_id,
      next_run,
      repeat_frequency,
      announcements!inner(id, status)
    `).lte('next_run', now.toISOString()).eq('announcements.status', 'scheduled').limit(MAX_TASKS);
  if (schedulesError) {
    console.error('Error fetching due schedules:', schedulesError);
    throw new Error('Error fetching due schedules');
  }
  console.log(`Found ${dueSchedules?.length || 0} schedules due for sending`);
  const results = [];
  // Process each due schedule
  for (const schedule of dueSchedules || []){
    try {
      // Call the send-announcement function to send this announcement
      const announcementId = schedule.announcement_id;
      console.log(`Sending scheduled announcement: ${announcementId}`);
      const functionResponse = await fetch(`${Deno.env.get('API_URL')}/functions/v1/send-announcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('ANON_KEY')}`
        },
        body: JSON.stringify({
          announcementId
        })
      });
      if (!functionResponse.ok) {
        const error = await functionResponse.text();
        throw new Error(`Failed to send announcement: ${error}`);
      }
      const result = await functionResponse.json();
      // Update the schedule's next run time based on its frequency
      let nextRun = null;
      if (schedule.repeat_frequency === 'daily') {
        nextRun = new Date(schedule.next_run);
        nextRun.setDate(nextRun.getDate() + 1);
      } else if (schedule.repeat_frequency === 'weekly') {
        nextRun = new Date(schedule.next_run);
        nextRun.setDate(nextRun.getDate() + 7);
      } else if (schedule.repeat_frequency === 'monthly') {
        nextRun = new Date(schedule.next_run);
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      if (nextRun) {
        // Update the schedule with the new next_run time
        await supabase.from('announcement_schedules').update({
          next_run: nextRun.toISOString()
        }).eq('id', schedule.id);
      } else {
      // For one-time schedules, no update needed
      }
      results.push({
        announcement_id: announcementId,
        status: 'sent',
        job_id: result.job_id
      });
    } catch (error) {
      console.error(`Error processing schedule ${schedule.id}:`, error);
      results.push({
        announcement_id: schedule.announcement_id,
        status: 'error',
        error: error.message
      });
    }
  }
  return {
    processed: results.length,
    details: results
  };
}
// Process background tasks for announcements
async function processAnnouncementBackgroundTasks() {
  // Find pending background tasks
  const { data: pendingTasks, error: tasksError } = await supabase.from('announcement_background_tasks').select(`
      id,
      job_id,
      announcement_id,
      remaining_count,
      next_batch_index,
      status
    `).eq('status', 'pending').order('created_at', {
    ascending: true
  }).limit(MAX_TASKS);
  if (tasksError) {
    console.error('Error fetching pending tasks:', tasksError);
    throw new Error('Error fetching pending announcement tasks');
  }
  console.log(`Found ${pendingTasks?.length || 0} pending announcement tasks`);
  const results = [];
  // Process each pending task
  for (const task of pendingTasks || []){
    try {
      console.log(`Processing announcement task for job ${task.job_id}`);
      // Mark the task as processing
      await supabase.from('announcement_background_tasks').update({
        status: 'processing'
      }).eq('id', task.id);
      // Call the process-announcement-batch function
      const functionResponse = await fetch(`${Deno.env.get('API_URL')}/functions/v1/process-announcement-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('ANON_KEY')}`
        },
        body: JSON.stringify({
          jobId: task.job_id
        })
      });
      if (!functionResponse.ok) {
        const error = await functionResponse.text();
        throw new Error(`Failed to process batch: ${error}`);
      }
      const result = await functionResponse.json();
      results.push({
        job_id: task.job_id,
        announcement_id: task.announcement_id,
        status: 'processed',
        is_complete: result.is_complete,
        stats: result.stats
      });
    } catch (error) {
      console.error(`Error processing task for job ${task.job_id}:`, error);
      // Mark the task as failed
      await supabase.from('announcement_background_tasks').update({
        status: 'failed',
        error_message: error.message
      }).eq('id', task.id);
      results.push({
        job_id: task.job_id,
        announcement_id: task.announcement_id,
        status: 'error',
        error: error.message
      });
    }
  }
  return {
    processed: results.length,
    details: results
  };
}
