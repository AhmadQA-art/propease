const { supabase } = require('../config/supabase');
const peopleService = require('../services/people.service');

/**
 * Base function to invite a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} role - Role name (team_member, tenant, vendor, owner)
 * @returns {Promise<Object>} Response object
 */
const inviteUser = async (req, res, role) => {
  try {
    const { email } = req.body;
    const { id: inviterId, organization_id } = req.user;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!organization_id) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Check if user with this email already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', userCheckError);
      return res.status(500).json({ error: 'Error checking for existing user' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError) {
      console.error('Error getting role:', roleError);
      return res.status(500).json({ error: 'Error getting role' });
    }

    if (!roleData) {
      return res.status(404).json({ error: `Role ${role} not found` });
    }

    // Generate expiration timestamp (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .insert({
        email,
        organization_id,
        role_id: roleData.id,
        invited_by: inviterId,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return res.status(500).json({ error: 'Error creating invitation' });
    }

    // Send invitation email using Supabase with redirectTo
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/accept-invitation`,
      data: {
        invitation_id: invitation.id,
        organization_id,
        role
      }
    });

    if (error) {
      console.error('Error inviting user:', error);
      await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitation.id);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        email,
        expires_at: invitation.expires_at,
        status: invitation.status
      }
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Invite a team member
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
exports.inviteTeamMember = async (req, res) => {
  return await inviteUser(req, res, 'team_member');
};

/**
 * Invite a tenant
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
exports.inviteTenant = async (req, res) => {
  return await inviteUser(req, res, 'tenant');
};

/**
 * Invite a vendor
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
exports.inviteVendor = async (req, res) => {
  return await inviteUser(req, res, 'vendor');
};

/**
 * Invite an owner
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
exports.inviteOwner = async (req, res) => {
  return await inviteUser(req, res, 'owner');
};

/**
 * Verify invitation token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
exports.verifyInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = req.query;

    console.log('Verifying invitation:', { token, email });

    if (!token || !email) {
      return res.status(400).json({ error: 'Token and email are required' });
    }

    // Get invitation by email without verifying token again
    // The frontend has already verified the token with Supabase
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (
          name
        ),
        roles (
          name
        )
      `)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    console.log('Found invitation:', invitation);

    if (invitationError || !invitation) {
      console.error('Error getting invitation:', invitationError);
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);

    if (now > expiresAt) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    return res.status(200).json({
      message: 'Invitation is valid',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organization_id: invitation.organization_id,
        organization_name: invitation.organizations?.name || '',
        role_id: invitation.role_id,
        role: invitation.roles?.name || ''
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      error: 'Error verifying invitation',
      details: error.message
    });
  }
};

/**
 * Accept an invitation and create a user account
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, password, firstName, lastName } = req.body;

    console.log('Accepting invitation:', { token, email });

    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Token, email, and password are required' });
    }

    // Get invitation by email
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      console.error('Error getting invitation:', invitationError);
      return res.status(404).json({ error: 'Invitation not found or invalid' });
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);

    if (now > expiresAt) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Create a new user with the provided password
    // We need to set the user up directly since we're bypassing Supabase's auto-authentication
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/confirm`,
        data: {
          invitation_id: invitation.id,
          organization_id: invitation.organization_id
        }
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return res.status(400).json({ error: userError.message });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userData.user.id,
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        organization_id: invitation.organization_id,
        status: 'active'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return res.status(500).json({ error: 'Error creating user profile' });
    }

    // Get role data
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', invitation.role_id)
      .single();
    
    if (roleError) {
      console.error('Error getting role:', roleError);
      // Continue anyway as we already created the user
    }

    // Assign user role
    const { error: roleAssignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role_id: invitation.role_id,
        organization_id: invitation.organization_id
      });

    if (roleAssignError) {
      console.error('Error assigning role:', roleAssignError);
      // Continue anyway as we already created the user
    }
    
    // Update invitation status to accepted
    const { error: updateInviteError } = await supabase
      .from('organization_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);
      
    if (updateInviteError) {
      console.error('Error updating invitation status:', updateInviteError);
      // Continue anyway as we already created the user
    }

    return res.status(200).json({
      message: 'Account created successfully',
      user: {
        id: userData.user.id,
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        organization_id: invitation.organization_id,
        role: roleData?.name || '',
      }
    });
  } catch (error) {
    console.error('Acceptance error:', error);
    return res.status(500).json({
      error: 'Error accepting invitation',
      details: error.message
    });
  }
}; 