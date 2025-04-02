const { supabase } = require('../config/supabase');
const peopleService = require('../services/people.service');
const crypto = require('crypto');

/**
 * Base function to invite a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} role - Role name (team_member, tenant, vendor, owner)
 * @returns {Promise<Object>} Response object
 */
const inviteUser = async (req, res, role) => {
  try {
    const { email, jobTitle, departmentId } = req.body;
    const { id: inviterId, organization_id } = req.user;

    console.log(`[INVITE] Inviting ${role} with email: ${email}, job title: ${jobTitle}, departmentId: ${departmentId}`);

    if (!email) {
      console.log('[INVITE] Error: Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!organization_id) {
      console.log('[INVITE] Error: Organization ID is required');
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Check if user with this email already exists
    console.log(`[INVITE] Checking if user with email ${email} already exists`);
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('[INVITE] Error checking for existing user:', userCheckError);
      return res.status(500).json({ error: 'Error checking for existing user' });
    }

    if (existingUser) {
      console.log(`[INVITE] User with email ${email} already exists with ID: ${existingUser.id}`);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Get role ID
    console.log(`[INVITE] Getting role ID for ${role}`);
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError) {
      console.error('[INVITE] Error getting role:', roleError);
      return res.status(500).json({ error: 'Error getting role' });
    }

    if (!roleData) {
      console.log(`[INVITE] Role ${role} not found`);
      return res.status(404).json({ error: `Role ${role} not found` });
    }
    console.log(`[INVITE] Found role ID: ${roleData.id}`);

    // Generate expiration timestamp (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Generate a token for the invitation
    const token = crypto.randomBytes(20).toString('hex');
    console.log(`[INVITE] Generated token: ${token}`);

    // Create invitation record - DO NOT include job_title or department in this object
    // These fields don't exist in the organization_invitations table
    const invitationData = {
      email,
      organization_id,
      role_id: roleData.id,
      invited_by: inviterId,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      token: token // Include the generated token
    };

    console.log('[INVITE] Creating invitation record with data:', JSON.stringify(invitationData));
    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .insert(invitationData)
      .select()
      .single();

    if (invitationError) {
      console.error('[INVITE] Error creating invitation:', invitationError);
      return res.status(500).json({ error: 'Error creating invitation' });
    }
    console.log(`[INVITE] Created invitation with ID: ${invitation.id}`);

    // Prepare metadata for the invitation
    // This is where we store job_title and department for team members
    const invitationMetadata = {
      invitation_id: invitation.id,
      organization_id,
      role,
      token: invitation.token // Include token in metadata
    };

    // Add job title and department to metadata for team members
    if (role === 'team_member') {
      console.log('[INVITE] Adding job title and departmentId to metadata for team member');
      invitationMetadata.job_title = jobTitle || null;
      invitationMetadata.department_id = departmentId || null;
    }

    console.log('[INVITE] Sending invitation email with metadata:', JSON.stringify(invitationMetadata));
    
    // Use the Supabase verification endpoint directly, we'll handle the final redirect in our app
    // The redirectTo should point to our AuthRedirect component that will handle the verification
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/verify`;
    
    console.log(`[INVITE] Using Supabase redirect URL: ${redirectUrl}`);
    
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
      data: invitationMetadata
    });

    if (error) {
      console.error('[INVITE] Error inviting user:', error);
      // Clean up the invitation record if the email fails
      console.log(`[INVITE] Deleting invitation ${invitation.id} due to email error`);
      await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitation.id);
      return res.status(500).json({ error: error.message });
    }

    console.log(`[INVITE] Successfully invited ${email} as ${role}`);
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
    console.error('[INVITE] Controller error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Verify invitation token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
const verifyInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = req.query;

    console.log('[VERIFY] Verifying invitation:', { token, email });

    if (!token || !email) {
      console.log('[VERIFY] Error: Token and email are required');
      return res.status(400).json({ error: 'Token and email are required' });
    }

    // Fetch invitation by both token and email
    console.log(`[VERIFY] Looking for invitation with token: ${token} and email: ${email}`);
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
      .eq('token', token)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (invitationError) {
      console.error('[VERIFY] Error getting invitation:', invitationError);
      return res.status(404).json({ 
        error: 'No valid invitation found',
        details: invitationError.message
      });
    }

    if (!invitation) {
      console.error('[VERIFY] No invitation found for token and email');
      return res.status(404).json({ error: 'No valid invitation found' });
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      console.log('[VERIFY] Invitation has expired');
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    console.log('[VERIFY] Invitation is valid');
    return res.status(200).json({
      message: 'Invitation is valid',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organization_id: invitation.organization_id,
        organization_name: invitation.organizations?.name || '',
        role_id: invitation.role_id,
        role: invitation.roles?.name || '',
      },
    });
  } catch (error) {
    console.error('[VERIFY] Verification error:', error);
    return res.status(500).json({ 
      error: 'Error verifying invitation',
      details: error.message,
    });
  }
};

/**
 * Accept invitation
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} Response object
 */
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, firstName, lastName, phone } = req.body;
    console.log(`[ACCEPT] Request to accept invitation with token: ${token}`);
    console.log(`[ACCEPT] User information: firstName: ${firstName}, lastName: ${lastName}, phone: ${phone}`);

    if (!token) {
      console.log('[ACCEPT] Error: Token is required');
      return res.status(400).json({ error: 'Token is required' });
    }

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('[ACCEPT] Error: No authorization header');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const accessToken = authHeader.replace('Bearer ', '');
    if (!accessToken) {
      console.log('[ACCEPT] Error: Invalid authorization header format');
      return res.status(401).json({ error: 'Invalid authorization token format' });
    }

    // Get current user from session using the access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError) {
      console.error('[ACCEPT] Error getting user:', userError);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!user) {
      console.log('[ACCEPT] Error: User not found in session');
      return res.status(401).json({ error: 'User not found' });
    }
    console.log(`[ACCEPT] User authenticated with ID: ${user.id}, email: ${user.email}`);
    console.log('[ACCEPT] User metadata:', JSON.stringify(user.user_metadata || {}));

    // Find the invitation by token
    console.log(`[ACCEPT] Looking for invitation with token: ${token}`);
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError) {
      console.error('[ACCEPT] Error finding invitation:', invitationError);
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (!invitation) {
      console.log('[ACCEPT] Error: No valid invitation found');
      return res.status(404).json({ error: 'No valid invitation found' });
    }
    console.log(`[ACCEPT] Found invitation ${invitation.id} for role ${invitation.role_id}`);

    // Retrieve role name from role_id
    console.log(`[ACCEPT] Getting role info for ID: ${invitation.role_id}`);
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', invitation.role_id)
      .single();

    if (roleError) {
      console.error('[ACCEPT] Error getting role:', roleError);
      return res.status(500).json({ error: 'Error getting role' });
    }
    console.log(`[ACCEPT] Role for invitation: ${roleData.name}`);

    // Only proceed if the invitation email matches the authenticated user
    if (invitation.email !== user.email) {
      console.log(`[ACCEPT] Email mismatch - Invitation: ${invitation.email}, User: ${user.email}`);
      return res.status(403).json({ error: 'Email does not match invitation' });
    }

    // Update user profile
    console.log(`[ACCEPT] Updating user profile for ${user.id}`);
    const profileData = {
      id: user.id,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      organization_id: invitation.organization_id
    };
    console.log('[ACCEPT] Profile data:', JSON.stringify(profileData));

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'id' });

    if (profileError) {
      console.error('[ACCEPT] Error updating profile:', profileError);
      return res.status(500).json({ error: 'Error updating profile' });
    }
    console.log(`[ACCEPT] Profile updated successfully for ${user.id}`);

    // Check if user role already exists
    console.log(`[ACCEPT] Checking if user role already exists: ${roleData.name} for organization ${invitation.organization_id}`);
    const { data: existingRole, error: checkRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role_id', invitation.role_id)
      .eq('organization_id', invitation.organization_id)
      .maybeSingle();
    
    if (checkRoleError) {
      console.error('[ACCEPT] Error checking for existing role:', checkRoleError);
      // Continue anyway and try to insert
    }
    
    // Only insert if no role exists
    if (!existingRole) {
      console.log(`[ACCEPT] Inserting user role: ${roleData.name} for organization ${invitation.organization_id}`);
      const { error: roleAssignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role_id: invitation.role_id,
          organization_id: invitation.organization_id
        });
  
      if (roleAssignError) {
        console.error('[ACCEPT] Error assigning role:', roleAssignError);
        if (roleAssignError.code !== '23505') { // Skip duplicate key errors
          return res.status(500).json({ error: 'Error assigning role' });
        }
      }
      console.log(`[ACCEPT] Role assigned successfully for ${user.id}`);
    } else {
      console.log(`[ACCEPT] User already has role ${roleData.name} for organization ${invitation.organization_id}`);
    }

    // For team members, create entry in team_members table
    if (roleData.name === 'team_member') {
      // Get job_title and department from user metadata (they were stored here during invitation)
      const metadata = user.user_metadata || {};
      const jobTitle = metadata.job_title || null;
      const departmentId = metadata.department_id || null;
      
      console.log(`[ACCEPT] User is a team member. Adding to team_members table with job_title: ${jobTitle}, departmentId: ${departmentId}`);
      
      const { error: teamMemberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          role_id: invitation.role_id,
          job_title: jobTitle,
          department_id: departmentId
        });

      if (teamMemberError) {
        console.error('[ACCEPT] Error creating team member record:', teamMemberError);
        return res.status(500).json({ error: 'Error creating team member record' });
      }
      console.log(`[ACCEPT] Team member record created successfully for ${user.id}`);
    }

    // Update invitation status
    console.log(`[ACCEPT] Updating invitation ${invitation.id} status to accepted`);
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('[ACCEPT] Error updating invitation status:', updateError);
      // Continue anyway as the critical parts worked
    } else {
      console.log(`[ACCEPT] Invitation ${invitation.id} updated successfully`);
    }

    // Get organization details to return to client
    console.log(`[ACCEPT] Getting organization details for ${invitation.organization_id}`);
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', invitation.organization_id)
      .single();

    if (orgError) {
      console.error('[ACCEPT] Error getting organization details:', orgError);
      // Continue anyway as this is not critical
    }

    console.log(`[ACCEPT] Invitation acceptance completed successfully for ${user.id}`);
    return res.status(200).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName,
        role: roleData.name,
        organizationId: invitation.organization_id,
        organizationName: orgData?.name || 'Your Organization'
      }
    });
  } catch (error) {
    console.error('[ACCEPT] Controller error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Export controller functions
module.exports = {
  inviteTeamMember: (req, res) => inviteUser(req, res, 'team_member'),
  inviteTenant: (req, res) => inviteUser(req, res, 'tenant'),
  inviteVendor: (req, res) => inviteUser(req, res, 'vendor'),
  inviteOwner: (req, res) => inviteUser(req, res, 'owner'),
  verifyInvitation,
  acceptInvitation
};
