const peopleService = require('../services/people.service');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { supabase } = require('../config/supabase');

const peopleController = {
  /**
   * Create a team member
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async createTeamMember(req, res) {
    try {
      const { body } = req;
      const { id: userId, organization_id } = req.user;

      if (!organization_id) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      // Validate required fields
      if (!body.first_name || !body.last_name || !body.email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
      }

      const result = await peopleService.createTeamMember(body, organization_id);
      
      // Send invitations if requested
      if (body.invitation_methods && (body.invitation_methods.email || body.invitation_methods.sms)) {
        try {
          await peopleService.sendInvitations(result.profile.id, body.invitation_methods);
        } catch (error) {
          console.error('Error sending invitations:', error);
          // Don't fail the request if invitations fail
        }
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Create a tenant
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async createTenant(req, res) {
    try {
      const { body } = req;
      const { id: userId, organization_id } = req.user;

      if (!organization_id) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      // Validate required fields
      if (!body.first_name || !body.last_name || !body.email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
      }

      const result = await peopleService.createTenant(body, organization_id);
      
      // Send invitations if requested
      if (body.invitation_methods && (body.invitation_methods.email || body.invitation_methods.sms)) {
        try {
          await peopleService.sendInvitations(result.profile.id, body.invitation_methods);
        } catch (error) {
          console.error('Error sending invitations:', error);
          // Don't fail the request if invitations fail
        }
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Create a vendor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async createVendor(req, res) {
    try {
      const { body } = req;
      const { id: userId, organization_id } = req.user;

      if (!organization_id) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      // Validate required fields
      if (!body.first_name || !body.last_name || !body.email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
      }

      const result = await peopleService.createVendor(body, organization_id);
      
      // Send invitations if requested
      if (body.invitation_methods && (body.invitation_methods.email || body.invitation_methods.sms)) {
        try {
          await peopleService.sendInvitations(result.profile.id, body.invitation_methods);
        } catch (error) {
          console.error('Error sending invitations:', error);
          // Don't fail the request if invitations fail
        }
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Create an owner
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async createOwner(req, res) {
    try {
      const { body } = req;
      const { id: userId, organization_id } = req.user;

      if (!organization_id) {
        return res.status(400).json({ error: 'Organization ID is required' });
      }

      // Validate required fields
      if (!body.first_name || !body.last_name || !body.email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
      }

      const result = await peopleService.createOwner(body, organization_id);
      
      // Send invitations if requested
      if (body.invitation_methods && (body.invitation_methods.email || body.invitation_methods.sms)) {
        try {
          await peopleService.sendInvitations(result.profile.id, body.invitation_methods);
        } catch (error) {
          console.error('Error sending invitations:', error);
          // Don't fail the request if invitations fail
        }
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Upload documents for a tenant
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async uploadDocuments(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Person ID is required' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const result = await peopleService.uploadDocuments(id, req.files);
      res.status(201).json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Send invitations to a person
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async sendInvitations(req, res) {
    try {
      const { id } = req.params;
      const { methods } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Person ID is required' });
      }

      if (!methods || (!methods.email && !methods.sms)) {
        return res.status(400).json({ error: 'At least one invitation method is required' });
      }

      const result = await peopleService.sendInvitations(id, methods);
      res.status(200).json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Create a tenant record without authentication
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async createTenantRecord(req, res) {
    try {
      const { name, phone, email, emergency_contact_phone } = req.body;
      
      // Validate required fields
      if (!name || !phone || !email) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name, phone, and email are required fields' 
        });
      }
      
      // Get organization ID from the authenticated user
      const organizationId = req.user.organization_id;
      
      if (!organizationId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Organization ID not found for the authenticated user' 
        });
      }
      
      // Create tenant record in Supabase
      const { data: tenant, error } = await supabase
        .from('tenants')
        .insert({
          name,
          phone,
          email,
          emergency_contact_phone,
          organization_id: organizationId,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating tenant record:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create tenant record' 
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Tenant record created successfully',
        data: tenant
      });
    } catch (error) {
      console.error('Error in createTenantRecord:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  },

  // Middleware for handling file uploads
  uploadMiddleware() {
    return upload.array('documents', 10);
  },

  deleteTeamMember: async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req; // Get the authenticated user

      // TODO: Add permission check (e.g., ensure the requester is an admin or team owner)
      // For now, we'll just check if the user is authenticated

      // Step 1: Call the database function to delete related records
      const { error: dbError } = await supabase.rpc('delete_team_member', { team_member_id: id });

      if (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ error: 'Failed to delete team member records' });
      }

      // Step 2: Delete the user from auth.users using Supabase admin API
      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) {
        console.error('Auth error:', authError);
        return res.status(500).json({ error: 'Failed to delete user account' });
      }

      return res.status(200).json({ message: 'Team member and associated user account deleted successfully' });
    } catch (error) {
      console.error('Error deleting team member:', error);
      return res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
  }
};

module.exports = peopleController; 