// Infobip API configuration
function getEnvironmentValue(name: string, defaultValue: string): string {
  try {
    const value = Deno.env.get(name);
    if (value) {
      return value;
    }
  } catch (e) {
    // If Deno.env is not available, continue to use default values
    console.warn(`Warning: Could not access env var ${name}, using default value`);
  }
  return defaultValue;
}

// Hard-coded values to ensure availability even if environment variables fail
const DEFAULT_INFOBIP_BASE_URL = "https://9kg1xy.api.infobip.com";
const DEFAULT_INFOBIP_API_KEY = "14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc";
const DEFAULT_INFOBIP_WHATSAPP_NUMBER = "447860099299";

export const INFOBIP_CONFIG = {
  BASE_URL: getEnvironmentValue('INFOBIP_BASE_URL', DEFAULT_INFOBIP_BASE_URL),
  API_KEY: getEnvironmentValue('INFOBIP_API_KEY', DEFAULT_INFOBIP_API_KEY),
  WHATSAPP_NUMBER: getEnvironmentValue('INFOBIP_WHATSAPP_NUMBER', DEFAULT_INFOBIP_WHATSAPP_NUMBER),
};

// Output config status for debugging
console.log("Infobip config loaded. Using environment vars:", {
  BASE_URL_FROM_ENV: INFOBIP_CONFIG.BASE_URL === DEFAULT_INFOBIP_BASE_URL ? "No" : "Yes",
  API_KEY_FROM_ENV: INFOBIP_CONFIG.API_KEY === DEFAULT_INFOBIP_API_KEY ? "No" : "Yes",
  WHATSAPP_NUMBER_FROM_ENV: INFOBIP_CONFIG.WHATSAPP_NUMBER === DEFAULT_INFOBIP_WHATSAPP_NUMBER ? "No" : "Yes",
});

// Helper for handling CORS
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization, X-Client-Info',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Error response helper
export function errorResponse(status: number, message: string | object) {
  let errorBody: Record<string, any>;
  
  // Allow either string messages or detailed error objects
  if (typeof message === 'string') {
    errorBody = { error: message };
  } else if (typeof message === 'object') {
    errorBody = { 
      error: message.hasOwnProperty('message') ? (message as any).message : 'Unknown error',
      details: message
    };
  } else {
    errorBody = { error: 'Unknown error' };
  }
  
  return new Response(
    JSON.stringify(errorBody),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Success response helper
export function successResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// Helper function to validate environment configuration
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Simplified validation - we just check that values are present since we have defaults
  if (!INFOBIP_CONFIG.BASE_URL) {
    errors.push('INFOBIP_BASE_URL not set');
  }
  
  if (!INFOBIP_CONFIG.API_KEY) {
    errors.push('INFOBIP_API_KEY not set');
  }
  
  if (!INFOBIP_CONFIG.WHATSAPP_NUMBER) {
    errors.push('INFOBIP_WHATSAPP_NUMBER not set');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 