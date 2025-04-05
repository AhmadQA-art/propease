import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { INFOBIP_CONFIG, corsHeaders, errorResponse, successResponse } from '../shared/infobip.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('API_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
);

interface SendAnnouncementRequest {
  announcementId: string;
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

// Maximum number of tenants to process in one batch
const BATCH_SIZE = 50;

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
    const { announcementId }: SendAnnouncementRequest = await req.json();

    // Validate request
    if (!announcementId) {
      return errorResponse(400, 'Announcement ID is required');
    }

    // Fetch announcement details
    const { data: announcement, error: annError } = await supabase
      .from('announcements')
      .select('title, content, communication_method, type, organization_id')
      .eq('id', announcementId)
      .single();

    if (annError || !announcement) {
      console.error('Error fetching announcement:', annError);
      return errorResponse(404, 'Announcement not found');
    }

    // Fetch targets
    const { data: targets, error: targetError } = await supabase
      .from('announcement_targets')
      .select('target_type, target_id, property_id, target_name')
      .eq('announcement_id', announcementId);

    if (targetError) {
      console.error('Error fetching targets:', targetError);
      return errorResponse(500, 'Error fetching announcement targets');
    }

    if (!targets || targets.length === 0) {
      return errorResponse(400, 'No targets found for this announcement');
    }

    // Instead of processing all tenants synchronously, we'll just gather them first
    // and create a background job
    const tenantContacts: TenantContact[] = [];
    const initialErrors: MessageResult[] = [];
    
    for (const target of targets) {
      if (target.target_type === 'property' && target.property_id) {
        console.log(`Processing property ${target.property_id} (${target.target_name})`);
        
        // Step 1: Get units for the property
        const { data: units, error: unitsError } = await supabase
          .from('units')
          .select('id')
          .eq('property_id', target.property_id);
        
        if (unitsError) {
          console.error('Error fetching units:', unitsError);
          initialErrors.push({
            method: 'database',
            recipient: target.target_name,
            error: 'Failed to fetch units for this property'
          });
          continue;
        }
        
        if (!units || units.length === 0) {
          console.log(`No units found for property ${target.property_id}`);
          continue;
        }
        
        console.log(`Found ${units.length} units for property ${target.property_id}`);
        
        // Step 2: Get active leases for these units
        const { data: leases, error: leasesError } = await supabase
          .from('leases')
          .select('tenant_id')
          .eq('status', 'Active')
          .in('unit_id', units.map(unit => unit.id));
        
        if (leasesError) {
          console.error('Error fetching leases:', leasesError);
          initialErrors.push({
            method: 'database',
            recipient: target.target_name,
            error: 'Failed to fetch active leases for this property'
          });
          continue;
        }
        
        if (!leases || leases.length === 0) {
          console.log(`No active leases found for property ${target.property_id}`);
          continue;
        }
        
        console.log(`Found ${leases.length} active leases for property ${target.property_id}`);
        
        // Step 3: Get tenant contact information
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, email, phone_number, whatsapp_number, first_name, last_name')
          .in('id', leases.map(lease => lease.tenant_id));
        
        if (tenantsError) {
          console.error('Error fetching tenants:', tenantsError);
          initialErrors.push({
            method: 'database',
            recipient: target.target_name,
            error: 'Failed to fetch tenant contact information'
          });
          continue;
        }
        
        if (!tenants || tenants.length === 0) {
          console.log(`No tenants found for property ${target.property_id}`);
          continue;
        }
        
        console.log(`Found ${tenants.length} tenants for property ${target.property_id}`);
        tenantContacts.push(...tenants);
      } else if (target.target_type === 'tenant' && target.target_id) {
        console.log(`Processing individual tenant ${target.target_id}`);
        
        // Get individual tenant contact information
        const { data: tenant, error: tenantError } = await supabase
          .from('tenants')
          .select('id, email, phone_number, whatsapp_number, first_name, last_name')
          .eq('id', target.target_id)
          .single();
        
        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
          initialErrors.push({
            method: 'database',
            recipient: target.target_name || target.target_id,
            error: 'Failed to fetch tenant contact information'
          });
          continue;
        }
        
        if (tenant) {
          console.log(`Found tenant ${tenant.id}`);
          tenantContacts.push(tenant);
        }
      }
    }

    // Remove duplicate tenant contacts
    const uniqueTenantIds = new Set();
    const uniqueTenantContacts = tenantContacts.filter(tenant => {
      if (tenant.id && !uniqueTenantIds.has(tenant.id)) {
        uniqueTenantIds.add(tenant.id);
        return true;
      }
      return false;
    });

    if (uniqueTenantContacts.length === 0) {
      return errorResponse(400, 'No tenant contacts found for this announcement');
    }

    console.log(`Processing announcement for ${uniqueTenantContacts.length} tenants`);

    // Create a background job for processing
    const { data: job, error: jobError } = await supabase
      .from('announcement_jobs')
      .insert({
        announcement_id: announcementId,
        total_tenants: uniqueTenantContacts.length,
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (jobError || !job) {
      console.error('Error creating job:', jobError);
      return errorResponse(500, 'Failed to create background job for announcement');
    }

    // Process the first batch immediately
    const firstBatch = uniqueTenantContacts.slice(0, BATCH_SIZE);
    const remainingTenants = uniqueTenantContacts.length - firstBatch.length;
    
    // Process first batch (instead of all tenants)
    const messagesSent: MessageResult[] = [];
    const messagesFailures: MessageResult[] = [...initialErrors];

    // Process first batch of tenants
    await processTenantBatch(
      firstBatch, 
      announcement, 
      messagesSent, 
      messagesFailures
    );

    // Update job with first batch results
    await supabase
      .from('announcement_jobs')
      .update({
        processed_count: firstBatch.length,
        success_count: messagesSent.length,
        failure_count: messagesFailures.length,
        last_processed_id: firstBatch.length > 0 ? firstBatch[firstBatch.length - 1].id : null
      })
      .eq('id', job.id);

    // Start background processing for remaining tenants if any
    if (remainingTenants > 0) {
      // In a real edge function, you'd create a background task here
      // For Supabase Edge Functions, you might use a separate worker or queue system
      // or call another edge function to continue processing
      
      // For demonstration, create a background task record
      await supabase
        .from('announcement_background_tasks')
        .insert({
          job_id: job.id,
          announcement_id: announcementId,
          remaining_count: remainingTenants,
          next_batch_index: BATCH_SIZE,
          status: 'pending'
        });
    } else {
      // If we processed all tenants in the first batch, update the job as completed
      await supabase
        .from('announcement_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }

    // Update announcement status to 'sending' (or 'sent' if small batch)
    await supabase
      .from('announcements')
      .update({ 
        status: remainingTenants > 0 ? 'sending' : 'sent', 
        issue_date: new Date().toISOString() 
      })
      .eq('id', announcementId);

    return successResponse({
      success: true,
      message: remainingTenants > 0 
        ? 'Announcement sending started (processing in background)' 
        : 'Announcement sent successfully',
      announcement: {
        id: announcementId,
        title: announcement.title,
        type: announcement.type,
        methods: announcement.communication_method
      },
      stats: {
        total_tenants: uniqueTenantContacts.length,
        processed: firstBatch.length,
        sent: messagesSent.length,
        failed: messagesFailures.length,
        remaining: remainingTenants
      },
      job_id: job.id
    });
  } catch (error) {
    console.error('Error sending announcement:', error);
    return errorResponse(500, `Error sending announcement: ${error.message}`);
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