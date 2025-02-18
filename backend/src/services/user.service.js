const { supabase } = require('../config/supabase');

class UserService {
  async getUserProfile(userId) {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First verify the user exists in auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError || !authUser) {
        console.error('Auth user not found:', authError);
        throw new Error('Auth user not found');
      }

      // Then get the profile from user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Could not fetch user profile');
      }
      
      if (!profile) {
        console.log('Creating new profile for user:', userId);
        // Create a profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            id: userId,
            email: authUser.user.email,
            first_name: '',
            last_name: '',
            role: 'user'
          }])
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          throw new Error('Could not create user profile');
        }

        return newProfile;
      }

      console.log('Found existing profile:', profile);
      return profile;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();