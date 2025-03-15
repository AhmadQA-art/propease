const roleService = require('../services/role.service');
const { supabase } = require('../config/supabase');

class AuthController {
  async signup(req, res) {
    try {
      const { email, password, firstName, lastName, organizationName } = req.body;
      console.log('Received signup request for:', email);

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(409).json({ 
          error: 'User already exists',
          message: 'An account with this email already exists. Please try logging in instead.'
        });
      }

      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) {
        console.error('Supabase auth user creation failed:', authError);
        return res.status(400).json({ error: authError.message });
      }

      console.log('Auth user created successfully:', authData.user.id);

      // 2. Create organization, profile, and role associations
      const result = await roleService.createUserWithRole(
        {
          id: authData.user.id,
          email,
          firstName,
          lastName
        },
        { name: organizationName }
      );

      console.log('User setup completed successfully:', result);

      res.status(201).json({
        message: 'User created successfully',
        data: result
      });
    } catch (error) {
      console.error('Signup process failed:', error);
      res.status(500).json({ 
        error: error.message,
        details: 'Failed to complete signup process'
      });
    }
  }

  async signin(req, res) {
    try {
      const { email, password } = req.body;
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        throw error;
      }
      
      console.log('User signed in successfully');
      res.json(data);
    } catch (error) {
      console.error('Signin process failed:', error);
      res.status(401).json({ 
        error: error.message,
        message: 'Invalid credentials'
      });
    }
  }

  async requestAccess(req, res) {
    try {
      const { email, name, company, message } = req.body;
      console.log('Access request received from:', email);
      
      // Store the access request
      const { data, error } = await supabase
        .from('access_requests')
        .insert([
          {
            email,
            name,
            company,
            message,
            status: 'pending'
          }
        ]);
      
      if (error) {
        console.error('Error storing access request:', error);
        throw error;
      }
      
      // Here you could add logic to send an email notification
      // to administrators about the access request
      
      return res.status(200).json({
        success: true,
        message: 'Your access request has been submitted successfully. We will contact you shortly.'
      });
    } catch (error) {
      console.error('Access request error:', error);
      return res.status(500).json({
        error: 'Failed to submit access request',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController(); 