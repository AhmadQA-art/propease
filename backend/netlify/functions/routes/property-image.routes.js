const express = require('express');
const router = express.Router();
const propertyImageController = require('../controllers/property-image.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /api/property-images/upload:
 *   post:
 *     summary: Upload a property image
 *     description: Upload an image for a specific property
 *     tags: [Property Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - propertyId
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload
 *               propertyId:
 *                 type: string
 *                 description: ID of the property the image belongs to
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       500:
 *         description: Server error
 */
router.post('/upload',
  authenticateToken,
  propertyImageController.uploadMiddleware.bind(propertyImageController),
  propertyImageController.uploadPropertyImage
);

/**
 * @swagger
 * /api/property-images/{propertyId}:
 *   get:
 *     summary: Get property images
 *     description: Get all images for a specific property
 *     tags: [Property Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the property
 *     responses:
 *       200:
 *         description: List of property images
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       500:
 *         description: Server error
 */
router.get('/:propertyId',
  authenticateToken,
  propertyImageController.getPropertyImages
);

/**
 * @swagger
 * /api/property-images/{id}:
 *   delete:
 *     summary: Delete property image
 *     description: Delete a specific property image by ID
 *     tags: [Property Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the image to delete
 *     responses:
 *       204:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user doesn't have permission
 *       404:
 *         description: Image not found
 *       500:
 *         description: Server error
 */
router.delete('/:id',
  authenticateToken,
  propertyImageController.deletePropertyImage
);

module.exports = router; 