import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, errorResponse, successResponse } from '../shared/infobip.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('API_URL') ?? '',
  Deno.env.get('SERVICE_ROLE_KEY') ?? ''
);

interface WhatsAppMessage {
  from: string;
  text: string;
  timestamp?: string;
  messageId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Parse webhook payload
    const message: WhatsAppMessage = await req.json();

    console.log('Received WhatsApp webhook:', message);

    // Validate message format
    if (!message.from || !message.text) {
      return errorResponse(400, 'Invalid webhook payload format');
    }

    // Normalize phone number format (remove +, spaces, etc.)
    const normalizedPhone = message.from.replace(/[^\d]/g, '');
    
    // Find tenant by WhatsApp number
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, first_name, last_name')
      .eq('whatsapp_number', normalizedPhone)
      .single();
    
    if (tenant) {
      // Log the message
      console.log(`Received WhatsApp message from ${tenant.first_name} ${tenant.last_name} (ID: ${tenant.id}): ${message.text}`);
    } else {
      // Try to find by phone number as fallback
      const { data: tenantByPhone } = await supabase
        .from('tenants')
        .select('id, first_name, last_name')
        .eq('phone_number', normalizedPhone)
        .single();
      
      if (tenantByPhone) {
        console.log(`Received WhatsApp message from ${tenantByPhone.first_name} ${tenantByPhone.last_name} (ID: ${tenantByPhone.id}): ${message.text}`);
      } else {
        console.log(`Received WhatsApp message from unknown number ${normalizedPhone}: ${message.text}`);
      }
    }
    
    return successResponse({ 
      success: true,
      message: 'Webhook received successfully' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return errorResponse(500, `Error processing webhook: ${error.message}`);
  }
}); 