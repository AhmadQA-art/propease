const userService = require('../services/user.service');

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
}

module.exports = new UserController();
