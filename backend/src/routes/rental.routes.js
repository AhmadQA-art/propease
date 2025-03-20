const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rental.controller');
const { authenticateToken, checkRole } = require('../middleware/auth.middleware');

// Get all rentals
router.get('/', 
  authenticateToken,
  rentalController.getRentals
);

// Get rental by ID
router.get('/:id',
  authenticateToken,
  rentalController.getRentalById
);

/**
 * @swagger
 * /rentals:
 *   post:
 *     summary: Create a new rental property with units
 *     description: Creates a new rental property and associated units in a single transaction
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               property:
 *                 type: object
 *                 required:
 *                   - name
 *                   - address
 *                   - city
 *                   - state
 *                   - zip_code
 *                   - total_units
 *                   - owner_id
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the property
 *                   address:
 *                     type: string
 *                     description: Street address of the property
 *                   city:
 *                     type: string
 *                     description: City of the property
 *                   state:
 *                     type: string
 *                     description: State of the property
 *                   zip_code:
 *                     type: string
 *                     description: ZIP code of the property
 *                   total_units:
 *                     type: integer
 *                     description: Total number of units in the property
 *                   owner_id:
 *                     type: string
 *                     format: uuid
 *                     description: ID of the property owner
 *               units:
 *                 type: array
 *                 description: Units to add to the property
 *                 items:
 *                   type: object
 *                   required:
 *                     - unit_number
 *                     - rent_amount
 *                     - status
 *                   properties:
 *                     unit_number:
 *                       type: string
 *                       description: Unit identifier/number
 *                     rent_amount:
 *                       type: number
 *                       description: Monthly rent amount
 *                     bedrooms:
 *                       type: integer
 *                       description: Number of bedrooms
 *                     bathrooms:
 *                       type: number
 *                       description: Number of bathrooms
 *                     square_feet:
 *                       type: integer
 *                       description: Square footage of the unit
 *                     status:
 *                       type: string
 *                       enum: [Available, Occupied, Maintenance, Reserved]
 *                       description: Current occupancy status
 *                     floor_plan:
 *                       type: string
 *                       description: Floor plan type/name
 *                     smart_lock_enabled:
 *                       type: boolean
 *                       description: Whether the unit has smart locks enabled
 *     responses:
 *       201:
 *         description: Rental property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the created property
 *                 name:
 *                   type: string
 *                   description: Name of the property
 *                 units:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       unit_number:
 *                         type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Create new rental
router.post('/',
  authenticateToken,
  checkRole(['organization_admin', 'property_manager']),
  rentalController.createRental
);

// Update rental
router.put('/:id',
  authenticateToken,
  checkRole(['organization_admin', 'property_manager']),
  rentalController.updateRental
);

// Delete rental
router.delete('/:id',
  authenticateToken,
  checkRole(['organization_admin']),
  rentalController.deleteRental
);

module.exports = router; 