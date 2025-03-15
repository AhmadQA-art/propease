const express = require('express');
const router = express.Router();
const peopleController = require('../controllers/people.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Deprecation middleware
const deprecatedEndpoint = (req, res, next) => {
  console.warn('WARNING: This endpoint is deprecated and will be removed in future versions');
  res.setHeader('X-Deprecated', 'true');
  res.setHeader('X-Deprecated-Warning', 'This endpoint is deprecated. Please use the invitation system instead.');
  next();
};

/**
 * @route POST /api/people/team
 * @desc Create a new team member (DEPRECATED)
 * @access Private
 */
router.post('/team', authenticateToken, deprecatedEndpoint, peopleController.createTeamMember);

/**
 * @route POST /api/people/tenant
 * @desc Create a new tenant
 * @access Private
 */
router.post('/tenant', authenticateToken, peopleController.createTenant);

/**
 * @route POST /api/people/vendor
 * @desc Create a new vendor
 * @access Private
 */
router.post('/vendor', authenticateToken, peopleController.createVendor);

/**
 * @route POST /api/people/owner
 * @desc Create a new owner
 * @access Private
 */
router.post('/owner', authenticateToken, peopleController.createOwner);

/**
 * @route POST /api/people/:id/documents
 * @desc Upload documents for a person
 * @access Private
 */
router.post('/:id/documents', 
  authenticateToken, 
  peopleController.uploadMiddleware(),
  peopleController.uploadDocuments
);

/**
 * @route POST /api/people/:id/invitations
 * @desc Send invitations to a person
 * @access Private
 */
router.post('/:id/invitations', authenticateToken, peopleController.sendInvitations);

module.exports = router; 