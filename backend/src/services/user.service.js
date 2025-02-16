const { supabase } = require('../config/supabase');

class UserService {
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email, role, organization_id')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Error fetching user profile: ${error.message}`);
    }
  }
}

module.exports = new UserService();
