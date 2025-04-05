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
    const { phoneNumber, text, debug = false } = requestData;
    console.log("Request payload:", JSON.stringify(requestData));
    console.log("INFOBIP_CONFIG available:", !!INFOBIP_CONFIG);
    // Check for debug mode
    if (debug) {
      console.log('Debug mode enabled, returning test response');
      return successResponse({
        debug: true,
        message: 'Debug mode response from send-sms function',
        received: requestData,
        infobip_config: {
          base_url_available: !!INFOBIP_CONFIG.BASE_URL,
          api_key_available: !!INFOBIP_CONFIG.API_KEY,
          whatsapp_number_available: !!INFOBIP_CONFIG.WHATSAPP_NUMBER
        }
      });
    }
    // Validate request
    if (!phoneNumber) {
      return errorResponse(400, 'Phone number is required');
    }
    if (!text) {
      return errorResponse(400, 'Message text is required');
    }
    // Normalize phone number - remove non-digits except leading +
    const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber.substring(1).replace(/\D/g, '') : phoneNumber.replace(/\D/g, '');
    console.log(`Normalized phone number: ${normalizedPhone} (original: ${phoneNumber})`);
    // Log the Infobip configuration being used
    console.log('Infobip API request details:', {
      url: `${INFOBIP_CONFIG.BASE_URL}/sms/2/text/advanced`,
      headers: {
        'Authorization': `App ${INFOBIP_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: {
        messages: [
          {
            destinations: [
              {
                to: normalizedPhone
              }
            ],
            from: 'ServiceSMS',
            text: text
          }
        ]
      }
    });
    // Prepare request to Infobip SMS API
    const response = await fetch(`${INFOBIP_CONFIG.BASE_URL}/sms/2/text/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            destinations: [
              {
                to: normalizedPhone
              }
            ],
            from: 'ServiceSMS',
            text: text
          }
        ]
      })
    });
    const data = await response.json();
    console.log('Infobip API response:', JSON.stringify(data, null, 2));
    if (!response.ok) {
      console.error('Error from Infobip SMS API:', JSON.stringify(data, null, 2));
      return errorResponse(response.status, `Failed to send SMS: ${data.requestError?.serviceException?.text || 'Unknown error'}`);
    }
    return successResponse({
      message: 'SMS sent successfully',
      details: {
        messageId: data.messages?.[0]?.messageId,
        to: normalizedPhone
      }
    });
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    return errorResponse(500, `Error sending SMS: ${error.message}`);
  }
});
