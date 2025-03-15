const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/invite.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public invitation verification and acceptance routes
router.get('/verify/:token', inviteController.verifyInvitation);
router.post('/accept/:token', inviteController.acceptInvitation);

// Protected routes - require authentication
router.use(authenticateToken);
router.post('/team/invite', inviteController.inviteTeamMember);
router.post('/tenant/invite', inviteController.inviteTenant);
router.post('/vendor/invite', inviteController.inviteVendor);
router.post('/owner/invite', inviteController.inviteOwner);

module.exports = router;
