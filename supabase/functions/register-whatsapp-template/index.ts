import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { INFOBIP_CONFIG, corsHeaders, errorResponse, successResponse } from '../shared/infobip.ts';

interface TemplateRequest {
  name: string;
  language: string;
  category: string;
  text: string;
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
    const { name, language, category, text }: TemplateRequest = await req.json();

    // Validate request
    if (!name) {
      return errorResponse(400, 'Template name is required');
    }

    if (!language) {
      return errorResponse(400, 'Language code is required');
    }

    if (!category) {
      return errorResponse(400, 'Category is required');
    }

    if (!text) {
      return errorResponse(400, 'Template text is required');
    }

    // Prepare request to Infobip WhatsApp Template API
    const response = await fetch(`${INFOBIP_CONFIG.BASE_URL}/whatsapp/1/message/template`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        language: language,
        category: category,
        structure: {
          body: {
            text: text
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error from Infobip WhatsApp Template API:', data);
      return errorResponse(response.status, `Failed to register template: ${data.requestError?.serviceException?.text || 'Unknown error'}`);
    }

    return successResponse({
      message: 'Template registered successfully',
      details: {
        name: name,
        status: data.status || 'pending_review'
      }
    });
  } catch (error) {
    console.error('Error registering template:', error);
    return errorResponse(500, `Error registering template: ${error.message}`);
  }
}); 