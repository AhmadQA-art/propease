const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth.middleware');
const ownerController = require('../controllers/owners.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Owner:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated ID of the owner
 *         name:
 *           type: string
 *           description: The owner's full name
 *         email:
 *           type: string
 *           format: email
 *           description: The owner's email address
 *         phone:
 *           type: string
 *           description: The owner's phone number
 *         organization_id:
 *           type: string
 *           format: uuid
 *           description: The ID of the organization this owner belongs to
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the owner was created
 *         created_by:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who created this owner
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the owner was last updated
 *         updated_by:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who last updated this owner
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "John Doe"
 *         email: "john.doe@example.com"
 *         phone: "+1-555-123-4567"
 *         organization_id: "123e4567-e89b-12d3-a456-426614174001"
 *         created_at: "2024-03-18T12:00:00Z"
 *         created_by: "123e4567-e89b-12d3-a456-426614174002"
 *         updated_at: "2024-03-18T12:00:00Z"
 *         updated_by: "123e4567-e89b-12d3-a456-426614174002"
 */

/**
 * @swagger
 * /api/owners:
 *   get:
 *     summary: Get all owners
 *     description: Retrieve all owners for the current organization. Requires authentication.
 *     tags: [Owners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of owners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Owner'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not authenticated"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch owners"
 */
router.get('/', authenticateToken, ownerController.getOwners);

/**
 * @swagger
 * /api/owners/{id}:
 *   get:
 *     summary: Get owner by ID
 *     description: Retrieve a specific owner by their ID. Requires authentication.
 *     tags: [Owners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The owner's ID
 *     responses:
 *       200:
 *         description: The owner details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Owner'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       404:
 *         description: Owner not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Owner not found"
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, ownerController.getOwnerById);

/**
 * @swagger
 * /api/owners:
 *   post:
 *     summary: Create new owner
 *     description: Create a new owner. Requires authentication and admin/super_admin role.
 *     tags: [Owners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - phone
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1-555-123-4567"
 *               company_name:
 *                 type: string
 *                 example: "ABC Properties"
 *               business_type:
 *                 type: string
 *                 example: "LLC"
 *     responses:
 *       201:
 *         description: Owner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Owner'
 *       400:
 *         description: Invalid input or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *                 fields:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["name", "email"]
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       403:
 *         description: Forbidden - user does not have required role
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, checkRole(['organization_admin', 'admin']), ownerController.createOwner);

/**
 * @swagger
 * /api/owners/{id}:
 *   put:
 *     summary: Update owner
 *     description: Update an existing owner. Requires authentication and admin/super_admin role.
 *     tags: [Owners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The owner's ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Owner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Owner'
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       403:
 *         description: Forbidden - user does not have required role
 *       404:
 *         description: Owner not found or access denied
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, checkRole(['organization_admin', 'admin']), ownerController.updateOwner);

/**
 * @swagger
 * /api/owners/{id}:
 *   delete:
 *     summary: Delete owner
 *     description: Delete an existing owner. Requires authentication and admin/super_admin role.
 *     tags: [Owners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The owner's ID
 *     responses:
 *       200:
 *         description: Owner deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Owner deleted successfully"
 *       401:
 *         description: Unauthorized - invalid or missing authentication token
 *       403:
 *         description: Forbidden - user does not have required role
 *       404:
 *         description: Owner not found or access denied
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, checkRole(['organization_admin', 'admin']), ownerController.deleteOwner);

module.exports = router;