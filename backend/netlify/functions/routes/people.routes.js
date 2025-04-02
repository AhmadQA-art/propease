const express = require('express');
const router = express.Router();
const peopleController = require('../controllers/people.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /people/tenant-record:
 *   post:
 *     summary: Create a new tenant record without authentication
 *     description: Creates a new tenant record in the database without creating a user profile or authentication.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the tenant
 *               phone:
 *                 type: string
 *                 description: Phone number of the tenant
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the tenant
 *               emergency_contact_phone:
 *                 type: string
 *                 description: Emergency contact phone number
 *     responses:
 *       201:
 *         description: Tenant record created successfully
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
 *                   example: Tenant record created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: tenant-uuid
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     phone:
 *                       type: string
 *                       example: +1234567890
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john.doe@example.com
 *                     emergency_contact_phone:
 *                       type: string
 *                       example: +1987654321
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *                       example: org-uuid
 *                     status:
 *                       type: string
 *                       example: active
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-06-01T12:00:00.000Z
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-06-01T12:00:00.000Z
 *       400:
 *         description: Bad request - missing required fields or organization ID not found
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.post('/tenant-record', authenticateToken, peopleController.createTenantRecord);

/**
 * @swagger
 * /people/{id}/documents:
 *   post:
 *     summary: Upload documents for a person
 *     description: Upload one or more documents for a specific person (tenant, owner, vendor, etc.)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The person ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Documents to upload (max 10)
 *     responses:
 *       201:
 *         description: Documents uploaded successfully
 *       400:
 *         description: Bad request - missing person ID or no files uploaded
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.post('/:id/documents', 
  authenticateToken, 
  peopleController.uploadMiddleware(),
  peopleController.uploadDocuments
);

// Delete team member
router.delete('/team-members/:id', authenticateToken, peopleController.deleteTeamMember);

module.exports = router; 