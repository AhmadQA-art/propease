const { supabase } = require('../config/supabase');

class RoleService {
  async createUserWithRole(userData, organizationData) {
    try {
      console.log('Starting user creation process:', { userData, organizationData });

      // 1. Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationData.name,
          subscription_status: 'active'
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation failed:', orgError);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('Organization created successfully:', organization);

      // 2. Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select()
        .eq('id', userData.id)
        .single();

      let userProfile;

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            organization_id: organization.id
          })
          .eq('id', userData.id)
          .select()
          .single();

        if (updateError) {
          console.error('User profile update failed:', updateError);
          await supabase
            .from('organizations')
            .delete()
            .eq('id', organization.id);
          throw new Error(`Failed to update user profile: ${updateError.message}`);
        }

        userProfile = updatedProfile;
        console.log('User profile updated successfully:', userProfile);
      } else {
        // Create new profile
        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userData.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            organization_id: organization.id
          })
          .select()
          .single();

        if (profileError) {
          console.error('User profile creation failed:', profileError);
          await supabase
            .from('organizations')
            .delete()
            .eq('id', organization.id);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        userProfile = newProfile;
        console.log('User profile created successfully:', userProfile);
      }

      // 3. Get the superadmin role
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'superadmin')
        .single();

      if (roleError || !role) {
        console.error('Failed to fetch superadmin role:', roleError);
        await supabase
          .from('organizations')
          .delete()
          .eq('id', organization.id);
        throw new Error('Superadmin role not found');
      }

      console.log('Found superadmin role:', role);

      // 4. Create user role association
      const { data: userRole, error: userRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.id,
          role_id: role.id,
          organization_id: organization.id
        })
        .select()
        .single();

      if (userRoleError) {
        console.error('User role association failed:', userRoleError);
        await supabase
          .from('organizations')
          .delete()
          .eq('id', organization.id);
        throw new Error(`Failed to create user role association: ${userRoleError.message}`);
      }

      console.log('User role association created successfully:', userRole);

      return {
        organization,
        userProfile,
        userRole
      };
    } catch (error) {
      console.error('Complete error in createUserWithRole:', error);
      throw error;
    }
  }
}

module.exports = new RoleService(); 