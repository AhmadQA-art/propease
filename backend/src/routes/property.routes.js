const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth.middleware');
const propertyController = require('../controllers/property.controller');

// Get all properties
router.get('/', 
  authenticateToken,
  propertyController.getProperties
);

// Get property by ID
router.get('/:id',
  authenticateToken,
  propertyController.getPropertyById
);

// Create new property
router.post('/',
  authenticateToken,
  checkRole(['super_admin', 'admin']),
  propertyController.createProperty
);

// Update property
router.put('/:id',
  authenticateToken,
  checkRole(['super_admin', 'admin']),
  propertyController.updateProperty
);

// Delete property
router.delete('/:id',
  authenticateToken,
  checkRole(['super_admin', 'admin']),
  propertyController.deleteProperty
);

// Get property units
router.get('/:id/units',
  authenticateToken,
  propertyController.getPropertyUnits
);

module.exports = router;
