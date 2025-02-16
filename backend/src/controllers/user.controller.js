const userService = require('../services/user.service');

class UserController {
  async getUserProfile(req, res) {
    try {
      const userId = req.user.id; // Assuming you have auth middleware that sets req.user
      const profile = await userService.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
