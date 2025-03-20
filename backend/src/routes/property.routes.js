const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth.middleware');
const propertyController = require('../controllers/property.controller');

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties
 *     description: Retrieve all properties for the current organization
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   address:
 *                     type: string
 *                   price:
 *                     type: number
 *                   bedrooms:
 *                     type: number
 *                   bathrooms:
 *                     type: number
 *                   square_feet:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [available, rented, maintenance]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', 
  authenticateToken,
  propertyController.getProperties
);

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     description: Retrieve a specific property by its ID
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.get('/:id',
  authenticateToken,
  propertyController.getPropertyById
);

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property
 *     description: Create a new property in the system
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - address
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               square_feet:
 *                 type: number
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post('/',
  authenticateToken,
  checkRole(['organization_admin']),
  propertyController.createProperty
);

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update property
 *     description: Update an existing property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               square_feet:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, rented, maintenance]
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.put('/:id',
  authenticateToken,
  checkRole(['super_admin', 'admin']),
  propertyController.updateProperty
);

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete property
 *     description: Delete a property from the system
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.delete('/:id',
  authenticateToken,
  checkRole(['super_admin', 'admin']),
  propertyController.deleteProperty
);

/**
 * @swagger
 * /properties/{id}/units:
 *   get:
 *     summary: Get property units
 *     description: Get all units for a specific property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of property units
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.get('/:id/units',
  authenticateToken,
  propertyController.getPropertyUnits
);

module.exports = router;
