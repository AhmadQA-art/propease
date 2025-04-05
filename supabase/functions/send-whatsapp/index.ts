import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { INFOBIP_CONFIG, corsHeaders, errorResponse, successResponse } from '../shared/infobip.ts';
serve(async (req)=>{
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
    const { to, templateName, placeholders, debug = false } = requestData;
    console.log("Request payload:", JSON.stringify(requestData, null, 2));
    console.log("INFOBIP_CONFIG available:", !!INFOBIP_CONFIG);
    console.log("INFOBIP_CONFIG details:", {
      base_url: INFOBIP_CONFIG.BASE_URL,
      api_key: INFOBIP_CONFIG.API_KEY ? "[REDACTED]" : "Not set",
      whatsapp_number: INFOBIP_CONFIG.WHATSAPP_NUMBER
    });
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
      console.error("Validation failed: Recipient phone number is required");
      return errorResponse(400, 'Recipient phone number is required');
    }
    if (!templateName) {
      console.error("Validation failed: Template name is required");
      return errorResponse(400, 'Template name is required');
    }
    if (!placeholders || !Array.isArray(placeholders)) {
      console.error("Validation failed: Placeholders must be an array");
      return errorResponse(400, 'Placeholders must be an array');
    }
    // Normalize phone number - remove non-digits except leading +
    const normalizedPhone = to.startsWith('+') ? to.substring(1).replace(/\D/g, '') : to.replace(/\D/g, '');
    console.log(`Normalized phone number: ${normalizedPhone} (original: ${to})`);
    // Generate a unique message ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    console.log("Generated messageId:", messageId);
    // Prepare request to Infobip WhatsApp API
    const requestBody = {
      messages: [
        {
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
        }
      ]
    };
    console.log("Infobip WhatsApp API request details:", {
      url: `${INFOBIP_CONFIG.BASE_URL}/whatsapp/1/message/template`,
      headers: {
        'Authorization': `App ${INFOBIP_CONFIG.API_KEY ? "[REDACTED]" : "Not set"}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: requestBody
    });
    const response = await fetch(`${INFOBIP_CONFIG.BASE_URL}/whatsapp/1/message/template`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    console.log("Infobip WhatsApp API response:", JSON.stringify(data, null, 2));
    if (!response.ok) {
      console.error('Error from Infobip WhatsApp API:', JSON.stringify(data, null, 2));
      return errorResponse(response.status, `Failed to send WhatsApp message: ${data.requestError?.serviceException?.text || 'Unknown error'}`);
    }
    console.log("WhatsApp message sent successfully");
    return successResponse({
      message: 'WhatsApp message sent successfully',
      details: {
        messageId: messageId,
        to: normalizedPhone
      }
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message, error.stack);
    return errorResponse(500, `Error sending WhatsApp message: ${error.message}`);
  }
});
