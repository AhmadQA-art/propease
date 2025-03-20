import { createClient } from '@supabase/supabase-js'

// Environment variables with proper fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Make sure your environment variables are set correctly.')
}

// Create a client with the public anon key (for normal client operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Create a client with the service role key (for admin operations)
// CAUTION: This has admin privileges and should be used carefully and only for server-side or trusted operations
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Helper function to get the appropriate client based on the need for admin privileges
export const getSupabaseClient = (requiresAdmin = false) => {
  if (requiresAdmin && supabaseAdmin) {
    return supabaseAdmin
  }
  return supabase
} 