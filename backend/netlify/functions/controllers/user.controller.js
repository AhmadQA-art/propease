const userService = require('../services/user.service');
const peopleService = require('../services/people.service');

class UserController {
  async getUserProfile(req, res) {
    try {
      console.log('Getting user profile for:', req.user);
      
      if (!req.user || !req.user.id) {
        console.error('No user ID found in request');
        return res.status(400).json({ error: 'User ID is required' });
      }

      const profile = await userService.getUserProfile(req.user.id);
      console.log('Retrieved profile:', profile);
      
      res.json(profile);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get current user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  getCurrentUser(req, res) {
    res.json(req.user);
  }

  /**
   * Assign a role to a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async assignRole(req, res) {
    try {
      const { userId, role, organizationId } = req.body;

      if (!userId || !role || !organizationId) {
        return res.status(400).json({ error: 'User ID, role, and organization ID are required' });
      }

      const result = await peopleService.assignRole(userId, role, organizationId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
