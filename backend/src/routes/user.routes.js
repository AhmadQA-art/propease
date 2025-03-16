const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the complete profile information for the authenticated user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 profile_image_url:
 *                   type: string
 *                   format: uri
 *                 organization_id:
 *                   type: string
 *                   format: uuid
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticateToken, userController.getUserProfile);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user basic info
 *     description: Retrieves basic information about the currently authenticated user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 first_name:
 *                   type: string
 *                 last_name:
 *                   type: string
 *                 organization_id:
 *                   type: string
 *                   format: uuid
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/me', authenticateToken, userController.getCurrentUser);

/**
 * @swagger
 * /user/assign-role:
 *   post:
 *     summary: Assign role to user
 *     description: Assigns a role to a user within an organization
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *               - organizationId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to assign the role to
 *               role:
 *                 type: string
 *                 description: Role to assign (e.g., admin, team_member, tenant, owner, vendor)
 *               organizationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the organization
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Role assigned successfully
 *       400:
 *         description: Invalid input or missing required fields
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.post('/assign-role', authenticateToken, userController.assignRole);

module.exports = router;
