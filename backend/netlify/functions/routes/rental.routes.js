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

// Create new rental
router.post('/',
  authenticateToken,
  checkRole(['admin', 'property_manager']),
  rentalController.createRental
);

// Update rental
router.put('/:id',
  authenticateToken,
  checkRole(['admin', 'property_manager']),
  rentalController.updateRental
);

// Delete rental
router.delete('/:id',
  authenticateToken,
  checkRole(['admin']),
  rentalController.deleteRental
);

module.exports = router; 