import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { INFOBIP_CONFIG, corsHeaders, errorResponse, successResponse } from '../shared/infobip.ts';

interface SendWhatsAppRequest {
  to: string;
  templateName: string;
  placeholders: string[];
  debug?: boolean;
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
    // Parse request body
    const requestData = await req.json();
    const { to, templateName, placeholders, debug = false }: SendWhatsAppRequest = requestData;

    console.log("Request payload:", JSON.stringify(requestData));
    console.log("INFOBIP_CONFIG available:", !!INFOBIP_CONFIG);

    // Check for debug mode
    if (debug) {
      console.log('Debug mode enabled, returning test response');
      return successResponse({
        debug: true,
        message: 'Debug mode response from send-whatsapp function',
        received: requestData,
        infobip_config: {
          base_url_available: !!INFOBIP_CONFIG.BASE_URL,
          api_key_available: !!INFOBIP_CONFIG.API_KEY,
          whatsapp_number_available: !!INFOBIP_CONFIG.WHATSAPP_NUMBER
        }
      });
    }

    // Validate request
    if (!to) {
      return errorResponse(400, 'Recipient phone number is required');
    }

    if (!templateName) {
      return errorResponse(400, 'Template name is required');
    }

    if (!placeholders || !Array.isArray(placeholders)) {
      return errorResponse(400, 'Placeholders must be an array');
    }

    // Normalize phone number - remove non-digits except leading +
    const normalizedPhone = to.startsWith('+') 
      ? to.substring(1).replace(/\D/g, '')
      : to.replace(/\D/g, '');
    
    console.log(`Normalized phone number: ${normalizedPhone} (original: ${to})`);

    // Generate a unique message ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

    // Prepare request to Infobip WhatsApp API
    const response = await fetch(`${INFOBIP_CONFIG.BASE_URL}/whatsapp/1/message/template`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          from: INFOBIP_CONFIG.WHATSAPP_NUMBER,
          to: normalizedPhone,
          messageId: messageId,
          content: {
            templateName: templateName,
            templateData: {
              body: {
                placeholders: placeholders
              }
            },
            language: 'en'
          }
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error from Infobip WhatsApp API:', data);
      return errorResponse(response.status, `Failed to send WhatsApp message: ${data.requestError?.serviceException?.text || 'Unknown error'}`);
    }

    return successResponse({
      message: 'WhatsApp message sent successfully',
      details: {
        messageId: messageId,
        to: normalizedPhone
      }
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return errorResponse(500, `Error sending WhatsApp message: ${error.message}`);
  }
}); 