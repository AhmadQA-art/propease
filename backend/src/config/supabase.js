const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are defined in your .env file or environment. ' +
    'This error occurs only when starting the server. Running tests to check route definitions may not require these variables.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };