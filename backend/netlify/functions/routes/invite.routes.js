const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/invite.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /invite/verify/{token}:
 *   get:
 *     summary: Verify an invitation token
 *     description: Verifies if an invitation token is valid and returns the invitation details
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The invitation token from the email link
 *     responses:
 *       200:
 *         description: Invitation is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invitation is valid
 *                 invitation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: invitation-uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *                       example: org-uuid
 *                     organization_name:
 *                       type: string
 *                       example: Example Organization
 *                     role:
 *                       type: string
 *                       example: team_member
 *       400:
 *         description: Invalid token format
 *       404:
 *         description: Invitation not found
 *       410:
 *         description: Invitation expired
 *       500:
 *         description: Internal server error
 */
router.get('/verify/:token', inviteController.verifyInvitation);

/**
 * @swagger
 * /invite/accept/{token}:
 *   post:
 *     summary: Accept an invitation
 *     description: Accepts an invitation and creates a user account
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The invitation token from the email link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invitation accepted successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: user-uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *                       example: org-uuid
 *                     role:
 *                       type: string
 *                       example: team_member
 *       400:
 *         description: Invalid input or token format
 *       404:
 *         description: Invitation not found
 *       410:
 *         description: Invitation expired
 *       500:
 *         description: Internal server error
 */
router.post('/accept/:token', inviteController.acceptInvitation);

// Protected routes - require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /invite/team/invite:
 *   post:
 *     summary: Invite a team member
 *     description: Sends an invitation to a new team member
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the team member
 *               jobTitle:
 *                 type: string
 *                 description: Job title of the team member
 *               department:
 *                 type: string
 *                 description: Department of the team member
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invitation sent successfully
 *                 invitation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: invitation-uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: newteam@example.com
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-03-21T12:00:00.000Z
 *                     status:
 *                       type: string
 *                       example: pending
 *       400:
 *         description: Invalid input or user already exists
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/team/invite', inviteController.inviteTeamMember);

/**
 * @swagger
 * /invite/tenant/invite:
 *   post:
 *     summary: Invite a tenant
 *     description: Sends an invitation to a new tenant
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the tenant
 *               name:
 *                 type: string
 *                 description: Full name of the tenant
 *               phone:
 *                 type: string
 *                 description: Phone number of the tenant
 *               language_preference:
 *                 type: string
 *                 description: Preferred language
 *               vehicles:
 *                 type: object
 *                 description: Tenant's vehicles information
 *               pets:
 *                 type: object
 *                 description: Tenant's pets information
 *               emergency_contact:
 *                 type: object
 *                 description: Tenant's emergency contact information
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Invalid input or user already exists
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/tenant/invite', inviteController.inviteTenant);

/**
 * @swagger
 * /invite/vendor/invite:
 *   post:
 *     summary: Invite a vendor
 *     description: Sends an invitation to a new vendor
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the vendor
 *               contact_name:
 *                 type: string
 *                 description: Contact name
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               service_type:
 *                 type: string
 *                 description: Type of service provided
 *               business_type:
 *                 type: string
 *                 description: Type of business
 *               service_areas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Areas where service is provided
 *               service_availability:
 *                 type: object
 *                 description: Service availability details
 *               emergency_service:
 *                 type: boolean
 *                 description: Whether emergency service is available
 *               payment_terms:
 *                 type: string
 *                 description: Payment terms
 *               hourly_rate:
 *                 type: number
 *                 description: Hourly rate
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Invalid input or user already exists
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/vendor/invite', inviteController.inviteVendor);

/**
 * @swagger
 * /invite/owner/invite:
 *   post:
 *     summary: Invite an owner
 *     description: Sends an invitation to a new property owner
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the owner
 *               name:
 *                 type: string
 *                 description: Full name of the owner
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               company_name:
 *                 type: string
 *                 description: Company name
 *               address:
 *                 type: string
 *                 description: Business address
 *               business_type:
 *                 type: string
 *                 description: Type of business
 *               tax_id:
 *                 type: string
 *                 description: Tax ID number
 *               payment_schedule:
 *                 type: string
 *                 description: Payment schedule preference
 *               payment_method:
 *                 type: string
 *                 description: Preferred payment method
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       400:
 *         description: Invalid input or user already exists
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/owner/invite', inviteController.inviteOwner);

module.exports = router;
