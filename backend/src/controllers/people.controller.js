const peopleService = require('../services/people.service');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

class PeopleController {
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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

  // Middleware for handling file uploads
  uploadMiddleware() {
    return upload.array('documents', 10); // Allow up to 10 files
  }
}

module.exports = new PeopleController(); 