const { supabase } = require('../config/supabase');

class PeopleService {
  /**
   * Create a team member
   * @param {Object} data - Team member data
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Created team member
   */
  async createTeamMember(data, organizationId) {
    try {
      // Create the user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          organization_id: organizationId,
          status: 'pending'
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Create team member record
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .insert([{
          user_id: profile.id,
          organization_id: organizationId,
          department: data.department,
          role_id: data.role,
          job_title: data.job_title,
          status: 'pending'
        }])
        .select()
        .single();

      if (teamMemberError) {
        console.error('Error creating team member:', teamMemberError);
        // Cleanup the user profile if team member creation fails
        await supabase
          .from('user_profiles')
          .delete()
          .eq('id', profile.id);
        throw new Error('Failed to create team member');
      }

      return { profile, teamMember };
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  /**
   * Create a tenant
   * @param {Object} data - Tenant data
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Created tenant
   */
  async createTenant(data, organizationId) {
    try {
      // Create the user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          organization_id: organizationId,
          status: 'pending'
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Create tenant record
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([{
          user_id: profile.id,
          organization_id: organizationId,
          status: 'pending',
          preferred_contact_methods: data.contact_preferences ? [data.contact_preferences] : ['email'],
          emergency_contact: {
            name: data.emergency_contact_name || '',
            phone: data.emergency_contact_phone || '',
            relationship: data.emergency_contact_relationship || ''
          }
        }])
        .select()
        .single();

      if (tenantError) {
        console.error('Error creating tenant:', tenantError);
        // Cleanup the user profile if tenant creation fails
        await supabase
          .from('user_profiles')
          .delete()
          .eq('id', profile.id);
        throw new Error('Failed to create tenant');
      }

      return { profile, tenant };
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  /**
   * Create a vendor
   * @param {Object} data - Vendor data
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Created vendor
   */
  async createVendor(data, organizationId) {
    try {
      // Create the user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          organization_id: organizationId,
          status: 'pending'
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Create vendor record
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .insert([{
          user_id: profile.id,
          organization_id: organizationId,
          service_type: data.service_type,
          business_type: data.business_type,
          notes: data.notes,
          hourly_rate: data.hourly_rate || null
        }])
        .select()
        .single();

      if (vendorError) {
        console.error('Error creating vendor:', vendorError);
        // Cleanup the user profile if vendor creation fails
        await supabase
          .from('user_profiles')
          .delete()
          .eq('id', profile.id);
        throw new Error('Failed to create vendor');
      }

      return { profile, vendor };
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  /**
   * Create an owner
   * @param {Object} data - Owner data
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Created owner
   */
  async createOwner(data, organizationId) {
    try {
      // Create the user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          organization_id: organizationId,
          status: 'pending'
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile');
      }

      // Create owner record
      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .insert([{
          user_id: profile.id,
          organization_id: organizationId,
          company_name: data.company_name,
          status: 'pending',
          notes: data.notes || ''
        }])
        .select()
        .single();

      if (ownerError) {
        console.error('Error creating owner:', ownerError);
        // Cleanup the user profile if owner creation fails
        await supabase
          .from('user_profiles')
          .delete()
          .eq('id', profile.id);
        throw new Error('Failed to create owner');
      }

      return { profile, owner };
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  /**
   * Send invitations to a person
   * @param {string} personId - Person ID
   * @param {Object} methods - Invitation methods
   * @returns {Promise<Object>} Invitation result
   */
  async sendInvitations(personId, methods) {
    try {
      // Get the user profile ID for this person
      const { data: person, error: personError } = await supabase
        .from('user_profiles')
        .select('id, email, phone, organization_id')
        .eq('id', personId)
        .single();

      if (personError) {
        console.error('Error fetching person for invitation:', personError);
        throw new Error('Failed to fetch person details for invitation');
      }

      // Create invitation records in communication_logs
      const invitationPromises = [];
      
      // Default organization ID if not available
      const organizationId = person.organization_id || '00000000-0000-0000-0000-000000000000';
      
      if (methods.email && person.email) {
        invitationPromises.push(
          supabase.from('communication_logs').insert([{
            recipient_id: personId,
            recipient_type: 'user',
            method: 'email',
            message_type: 'invitation',
            content: `Invitation to join PropEase`,
            subject: 'Welcome to PropEase',
            status: 'pending',
            organization_id: organizationId
          }])
        );
      }
      
      if (methods.sms && person.phone) {
        invitationPromises.push(
          supabase.from('communication_logs').insert([{
            recipient_id: personId,
            recipient_type: 'user',
            method: 'sms',
            message_type: 'invitation',
            content: `Invitation to join PropEase`,
            status: 'pending',
            organization_id: organizationId
          }])
        );
      }

      const results = await Promise.all(invitationPromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Errors sending invitations:', errors);
        throw new Error('Failed to send some invitations');
      }

      return { success: true, methods };
    } catch (error) {
      console.error('Error in sendInvitations:', error);
      throw error;
    }
  }

  /**
   * Upload documents for a person
   * @param {string} personId - Person ID
   * @param {Array} files - Files to upload
   * @returns {Promise<Array>} Uploaded documents
   */
  async uploadDocuments(personId, files) {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${personId}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype
          });

        if (error) {
          console.error('Error uploading file:', error);
          throw error;
        }

        // Create document record in the documents table
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert([{
            related_to_id: personId,
            related_to_type: 'tenant',
            document_type: fileExt,
            document_name: file.originalname,
            document_url: fileName
          }])
          .select()
          .single();

        if (docError) {
          console.error('Error creating document record:', docError);
          throw docError;
        }

        return doc;
      });

      return Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in uploadDocuments:', error);
      throw error;
    }
  }

  /**
   * Assign a role to a user
   * @param {string} userId - User ID
   * @param {string} role - Role name
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Object>} Result
   */
  async assignRole(userId, role, organizationId) {
    try {
      // Get role ID by name
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleError) {
        console.error('Error getting role:', roleError);
        throw roleError;
      }

      if (!roleData) {
        throw new Error(`Role ${role} not found`);
      }

      // Assign role to user
      const { data: userRole, error: userRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id,
          organization_id: organizationId
        })
        .select()
        .single();

      if (userRoleError) {
        console.error('Error assigning role:', userRoleError);
        throw userRoleError;
      }

      return { success: true, userRole };
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
}

module.exports = new PeopleService(); 