import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { INFOBIP_CONFIG, corsHeaders, errorResponse, successResponse } from '../shared/infobip.ts';

interface SendEmailRequest {
  email: string;
  subject: string;
  text: string;
  firstName?: string;
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

  console.log("Processing send-email request");

  try {
    // Parse request body
    const requestData = await req.json();
    const { email, subject, text, firstName = 'Tenant', debug = false }: SendEmailRequest = requestData;

    console.log("Request payload:", JSON.stringify(requestData));
    console.log("INFOBIP_CONFIG available:", !!INFOBIP_CONFIG);

    // Check for debug mode
    if (debug) {
      console.log('Debug mode enabled, returning test response');
      return successResponse({
        debug: true,
        message: 'Debug mode response from send-email function',
        received: requestData,
        infobip_config: {
          base_url_available: !!INFOBIP_CONFIG.BASE_URL,
          api_key_available: !!INFOBIP_CONFIG.API_KEY,
          whatsapp_number_available: !!INFOBIP_CONFIG.WHATSAPP_NUMBER
        }
      });
    }

    // Validate request
    if (!email) {
      return errorResponse(400, 'Email address is required');
    }

    if (!subject) {
      return errorResponse(400, 'Subject is required');
    }

    if (!text) {
      return errorResponse(400, 'Email text is required');
    }

    // Create form data for Infobip API
    const formData = new FormData();
    formData.append('from', 'propease <ahmadmesbah@propeasesolutions.com>');
    formData.append('subject', subject);
    
    // Add recipient with placeholder
    const recipientJson = JSON.stringify({ 
      to: email, 
      placeholders: { firstName } 
    });
    formData.append('to', recipientJson);
    
    // Add message content with placeholder
    formData.append('text', `Hi {{firstName}}, ${text}`);

    try {
      // Send email via Infobip API
      console.log(`Sending email to ${email} via Infobip API at ${INFOBIP_CONFIG.BASE_URL}`);
      const response = await fetch(`${INFOBIP_CONFIG.BASE_URL}/email/3/send`, {
        method: 'POST',
        headers: {
          'Authorization': `App ${INFOBIP_CONFIG.API_KEY}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      let data;
      try {
        data = await response.json();
        console.log("API response:", JSON.stringify(data));
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        const rawText = await response.text();
        console.log('Raw response:', rawText);
        return errorResponse(500, `Failed to parse API response: ${jsonError.message}, Raw response: ${rawText}`);
      }

      if (!response.ok) {
        console.error('Error from Infobip Email API:', JSON.stringify(data));
        return errorResponse(response.status, {
          message: `Failed to send email: ${data.requestError?.serviceException?.text || 'Unknown error'}`,
          requestError: data.requestError,
          statusCode: response.status,
          statusText: response.statusText
        });
      }

      console.log("Email sent successfully");
      return successResponse({
        message: 'Email sent successfully',
        details: {
          messageId: data.messages?.[0]?.messageId,
          to: email
        }
      });
    } catch (fetchError) {
      console.error('Fetch error when calling Infobip API:', fetchError);
      return errorResponse(500, {
        message: `Network error when sending email: ${fetchError.message}`,
        error: fetchError.toString(),
        stack: fetchError.stack
      });
    }
  } catch (error) {
    console.error('Error in send-email function:', error);
    return errorResponse(500, {
      message: `Error processing email request: ${error.message}`,
      error: error.toString(),
      stack: error.stack
    });
  }
}); 