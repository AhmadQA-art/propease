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
}

module.exports = new AuthController(); 