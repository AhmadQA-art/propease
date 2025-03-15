const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/invite.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Apply auth middleware to protected routes
router.use('/team/invite', authenticateToken);
router.use('/tenant/invite', authenticateToken);
router.use('/vendor/invite', authenticateToken);
router.use('/owner/invite', authenticateToken);

// Protected invitation routes
router.post('/team/invite', inviteController.inviteTeamMember);
router.post('/tenant/invite', inviteController.inviteTenant);
router.post('/vendor/invite', inviteController.inviteVendor);
router.post('/owner/invite', inviteController.inviteOwner);

// Public invitation verification and acceptance routes
router.get('/verify/:token', inviteController.verifyInvitation);
router.post('/accept/:token', inviteController.acceptInvitation);

module.exports = router;
