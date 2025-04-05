import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { INFOBIP_CONFIG, corsHeaders, errorResponse, successResponse } from '../shared/infobip.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('API_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
);

interface ProcessBatchRequest {
  jobId: string;
  batchSize?: number;
}

interface TenantContact {
  id?: string;
  email?: string;
  phone_number?: string;
  whatsapp_number?: string;
  first_name?: string;
  last_name?: string;
}

interface MessageResult {
  method: string;
  recipient: string;
  tenant_id?: string;
  error?: string;
}

// Default batch size
const DEFAULT_BATCH_SIZE = 50;

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Parse request body
    const { jobId, batchSize = DEFAULT_BATCH_SIZE }: ProcessBatchRequest = await req.json();

    // Validate request
    if (!jobId) {
      return errorResponse(400, 'Job ID is required');
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('announcement_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Error fetching job:', jobError);
      return errorResponse(404, 'Job not found');
    }

    // Check if job is already completed or cancelled
    if (job.status === 'completed' || job.status === 'cancelled') {
      return successResponse({
        message: `Job is already ${job.status}`,
        job
      });
    }

    // Fetch the background task for this job
    const { data: bgTask, error: bgTaskError } = await supabase
      .from('announcement_background_tasks')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (bgTaskError) {
      console.error('Error fetching background task:', bgTaskError);
      return errorResponse(500, 'Error fetching background task');
    }

    if (!bgTask) {
      return errorResponse(404, 'No background task found for this job');
    }

    // Fetch announcement details
    const { data: announcement, error: annError } = await supabase
      .from('announcements')
      .select('title, content, communication_method, type, organization_id')
      .eq('id', bgTask.announcement_id)
      .single();

    if (annError || !announcement) {
      console.error('Error fetching announcement:', annError);
      return errorResponse(404, 'Announcement not found');
    }

    // Fetch all tenant contacts for this announcement
    const { data: uniqueTenantContacts, error: tenantsError } = await supabase
      .rpc('get_announcement_tenant_contacts', { 
        announcement_id: bgTask.announcement_id 
      });

    if (tenantsError) {
      console.error('Error fetching tenant contacts:', tenantsError);
      return errorResponse(500, 'Error fetching tenant contacts');
    }

    if (!uniqueTenantContacts || uniqueTenantContacts.length === 0) {
      // No more tenants to process - mark job as completed
      await supabase
        .from('announcement_jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      return successResponse({
        message: 'Job completed - no more tenants to process',
        job: {
          ...job,
          status: 'completed'
        }
      });
    }

    // Calculate the range for this batch
    const startIndex = bgTask.next_batch_index || 0;
    const endIndex = Math.min(startIndex + batchSize, uniqueTenantContacts.length);
    const currentBatch = uniqueTenantContacts.slice(startIndex, endIndex);
    const remainingCount = uniqueTenantContacts.length - endIndex;

    console.log(`Processing batch of ${currentBatch.length} tenants (${startIndex} to ${endIndex-1})`);

    // Process this batch
    const messagesSent: MessageResult[] = [];
    const messagesFailures: MessageResult[] = [];

    // Process current batch of tenants
    await processTenantBatch(
      currentBatch, 
      announcement, 
      messagesSent, 
      messagesFailures
    );

    // Update job with batch results
    await supabase
      .from('announcement_jobs')
      .update({
        processed_count: (job.processed_count || 0) + currentBatch.length,
        success_count: (job.success_count || 0) + messagesSent.length,
        failure_count: (job.failure_count || 0) + messagesFailures.length,
        last_processed_id: currentBatch.length > 0 ? currentBatch[currentBatch.length - 1].id : job.last_processed_id
      })
      .eq('id', jobId);

    // Update the background task status
    if (remainingCount <= 0) {
      // Mark job as completed
      await supabase
        .from('announcement_jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      // Update announcement status to 'sent'
      await supabase
        .from('announcements')
        .update({ 
          status: 'sent'
        })
        .eq('id', bgTask.announcement_id);

      // Mark task as completed
      await supabase
        .from('announcement_background_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', bgTask.id);
    } else {
      // Create next batch task
      await supabase
        .from('announcement_background_tasks')
        .insert({
          job_id: jobId,
          announcement_id: bgTask.announcement_id,
          remaining_count: remainingCount,
          next_batch_index: endIndex,
          status: 'pending'
        });

      // Mark current task as completed
      await supabase
        .from('announcement_background_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', bgTask.id);
    }

    return successResponse({
      success: true,
      message: remainingCount > 0 
        ? 'Batch processed, more batches pending' 
        : 'All batches completed, job finished',
      announcement: {
        id: bgTask.announcement_id,
        title: announcement.title,
        type: announcement.type,
        methods: announcement.communication_method
      },
      stats: {
        batch_size: currentBatch.length,
        sent: messagesSent.length,
        failed: messagesFailures.length,
        remaining: remainingCount,
        total_processed: (job.processed_count || 0) + currentBatch.length
      },
      job_id: jobId,
      task_id: bgTask.id,
      is_complete: remainingCount <= 0
    });
  } catch (error) {
    console.error('Error processing announcement batch:', error);
    return errorResponse(500, `Error processing announcement batch: ${error.message}`);
  }
});

// Helper function to process a batch of tenants
async function processTenantBatch(
  tenants: TenantContact[],
  announcement: any,
  messagesSent: MessageResult[],
  messagesFailures: MessageResult[]
) {
  for (const contact of tenants) {
    for (const method of announcement.communication_method) {
      try {
        if (method === 'email' && contact.email) {
          // Send email
          const emailResponse = await fetch(`${Deno.env.get('API_URL')}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('ANON_KEY')}`
            },
            body: JSON.stringify({
              email: contact.email,
              subject: announcement.title,
              text: announcement.content,
              firstName: contact.first_name || 'Tenant'
            })
          });
          
          if (emailResponse.ok) {
            messagesSent.push({ 
              method: 'email', 
              recipient: contact.email,
              tenant_id: contact.id 
            });
          } else {
            const errorText = await emailResponse.text();
            messagesFailures.push({ 
              method: 'email', 
              recipient: contact.email,
              tenant_id: contact.id,
              error: errorText 
            });
          }
        }
        
        if (method === 'sms' && contact.phone_number) {
          // Send SMS
          const smsResponse = await fetch(`${Deno.env.get('API_URL')}/functions/v1/send-sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('ANON_KEY')}`
            },
            body: JSON.stringify({
              phoneNumber: contact.phone_number,
              text: `${announcement.title}: ${announcement.content}`
            })
          });
          
          if (smsResponse.ok) {
            messagesSent.push({ 
              method: 'sms', 
              recipient: contact.phone_number,
              tenant_id: contact.id 
            });
          } else {
            const errorText = await smsResponse.text();
            messagesFailures.push({ 
              method: 'sms', 
              recipient: contact.phone_number,
              tenant_id: contact.id,
              error: errorText 
            });
          }
        }
        
        if (method === 'whatsapp' && contact.whatsapp_number) {
          // Determine template and placeholders based on announcement type
          const templateName = announcement.type === 'community event' ? 'community_event' : 'general_announcement';
          let placeholders: string[];
          
          if (announcement.type === 'community event') {
            // Extract date and location from content if available, or use defaults
            const contentParts = announcement.content.split(',');
            const eventDate = contentParts.length > 1 ? contentParts[0].trim() : 'upcoming date';
            const eventLocation = contentParts.length > 2 ? contentParts[1].trim() : 'location TBD';
            
            placeholders = [announcement.title, eventDate, eventLocation];
          } else {
            placeholders = [announcement.title, announcement.content];
          }
          
          // Send WhatsApp message
          const whatsappResponse = await fetch(`${Deno.env.get('API_URL')}/functions/v1/send-whatsapp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('ANON_KEY')}`
            },
            body: JSON.stringify({
              to: contact.whatsapp_number,
              templateName,
              placeholders
            })
          });
          
          if (whatsappResponse.ok) {
            messagesSent.push({ 
              method: 'whatsapp', 
              recipient: contact.whatsapp_number,
              tenant_id: contact.id 
            });
          } else {
            const errorText = await whatsappResponse.text();
            messagesFailures.push({ 
              method: 'whatsapp', 
              recipient: contact.whatsapp_number,
              tenant_id: contact.id,
              error: errorText 
            });
          }
        }
      } catch (error) {
        console.error(`Error sending ${method} to ${contact.id}:`, error);
        messagesFailures.push({ 
          method, 
          recipient: contact.id || 'unknown',
          error: error.message 
        });
      }
    }
  }
} 