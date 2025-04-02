// Test endpoint to manually trigger the notification job
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Supabase URL and key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ljojrcciojdprmvrtbdb.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMzkxMywiZXhwIjoyMDU0MTg5OTEzfQ.iSwJVhqLhi6PNdDbuSAIGr8Xu2QRmJkkZvsmNecx7QI'
    
    // This is a fallback safety check
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    // Call the notification-job function directly
    const response = await fetch(
      `${supabaseUrl}/functions/v1/notification-job`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    const result = await response.json()
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error running notification job:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
