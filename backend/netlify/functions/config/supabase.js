const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are defined in your .env file or environment.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Add error handling for initialization
const initSupabase = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase initialization error:', error);
    }
    return data;
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
    throw err;
  }
};

// Initialize on startup
initSupabase();

module.exports = { supabase };
