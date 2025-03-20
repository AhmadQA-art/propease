const { supabase } = require('../config/supabase');

// Signup handler
const signup = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Create user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name
        }
      }
    });

    if (authError) throw authError;
    
    res.status(201).json({
      message: 'User created successfully',
      user: authData.user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Signin handler
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    
    res.json({
      token: authData.session.access_token,
      user: authData.user
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Request access handler
const requestAccess = async (req, res) => {
  try {
    const { email, organization_name } = req.body;
    
    // Store access request in database
    const { data, error } = await supabase
      .from('access_requests')
      .insert([{ email, organization_name }]);

    if (error) throw error;
    
    res.json({ message: 'Access request submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    console.log('Getting current user');
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*, roles (*), organizations (*)')
      .eq('id', req.user.id)
      .single();
    if (error) return res.status(500).json({ error: 'Failed to fetch user profile' });
    if (!profile) return res.status(404).json({ error: 'User profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get current user', details: error.message });
  }
};

module.exports = {
  signup,
  signin,
  requestAccess,
  getCurrentUser
}; 
