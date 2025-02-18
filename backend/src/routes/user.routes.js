const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Debug route
router.get('/debug', authenticateToken, (req, res) => {
  console.log('Debug - User object:', req.user);
  res.json({ user: req.user });
});

// Get user profile
router.get('/profile', authenticateToken, userController.getUserProfile);

module.exports = router;
