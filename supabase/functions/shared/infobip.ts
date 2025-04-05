// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Infobip configuration
export const INFOBIP_CONFIG = {
  BASE_URL: Deno.env.get('INFOBIP_BASE_URL') || 'https://9kg1xy.api.infobip.com',
  API_KEY: Deno.env.get('INFOBIP_API_KEY') || '14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc',
  WHATSAPP_NUMBER: Deno.env.get('WHATSAPP_NUMBER') || '447860099299',
};

// Helper function for error responses
export function errorResponse(status: number, message: string | Record<string, any>) {
  const responseBody = typeof message === 'string' 
    ? { success: false, error: message }
    : { success: false, ...message };

  return new Response(
    JSON.stringify(responseBody),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

// Helper function for success responses
export function successResponse(data: any) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
} 