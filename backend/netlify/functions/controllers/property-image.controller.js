const { supabase } = require('../config/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../temp');
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}).single('image');

class PropertyImageController {
  // Handle upload middleware errors
  uploadMiddleware(req, res, next) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error (e.g., file too large)
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        // Other errors
        return res.status(400).json({ error: err.message });
      }
      // No error, continue
      next();
    });
  }

  // Upload property image
  async uploadPropertyImage(req, res) {
    try {
      // Validate request
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      const propertyId = req.body.propertyId;
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      console.log('Request user:', req.user ? req.user.id : 'No user');

      // Check if user is authorized to upload for this property
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', req.user.id)
        .single();

      if (!userProfile) {
        return res.status(401).json({ error: 'User profile not found' });
      }

      console.log('User organization_id:', userProfile.organization_id);

      // Verify property belongs to user's organization
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .eq('organization_id', userProfile.organization_id)
        .single();

      if (propertyError || !property) {
        console.error('Property verification error:', propertyError);
        return res.status(403).json({ 
          error: 'You do not have permission to upload images for this property' 
        });
      }

      // Read file from disk
      const fileContent = fs.readFileSync(req.file.path);
      const fileName = `${propertyId}/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;

      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('property-images')
        .upload(fileName, fileContent, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      // Remove temporary file
      fs.unlinkSync(req.file.path);

      if (storageError) {
        console.error('Storage error:', storageError);
        return res.status(500).json({ error: `Upload error: ${storageError.message}` });
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Insert the URL into the property_images table
      // NOTE: Only include columns that exist in the table schema
      const { data: imageRecord, error: dbError } = await supabase
        .from('property_images')
        .insert({ 
          property_id: propertyId, 
          image_url: imageUrl
          // Removed organization_id as it doesn't exist in the schema
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Try to delete the uploaded file if database insertion fails
        await supabase.storage
          .from('property-images')
          .remove([fileName]);
        
        return res.status(500).json({ error: `Database error: ${dbError.message}` });
      }

      res.status(201).json(imageRecord);
    } catch (error) {
      console.error('Error in uploadPropertyImage:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get property images
  async getPropertyImages(req, res) {
    try {
      const { propertyId } = req.params;
      
      // Validate propertyId
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      console.log('Fetching images for property:', propertyId);

      // Check if user has access to this property
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', req.user.id)
        .single();

      if (!userProfile) {
        return res.status(401).json({ error: 'User profile not found' });
      }

      // Verify property belongs to user's organization
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .eq('organization_id', userProfile.organization_id)
        .single();

      if (propertyError || !property) {
        console.error('Property verification error:', propertyError);
        return res.status(403).json({ 
          error: 'You do not have permission to view images for this property' 
        });
      }

      // Get all images for this property
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching property images:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data);
    } catch (error) {
      console.error('Error in getPropertyImages:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete property image
  async deletePropertyImage(req, res) {
    try {
      const { id } = req.params;
      
      // Validate id
      if (!id) {
        return res.status(400).json({ error: 'Image ID is required' });
      }

      // Get image details to check permissions and get storage path
      const { data: image, error: imageError } = await supabase
        .from('property_images')
        .select('*')
        .eq('id', id)
        .single();

      if (imageError || !image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Get the property to check organization access
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('organization_id')
        .eq('id', image.property_id)
        .single();

      if (propertyError || !property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Check if user has permission to delete this image (belongs to their organization)
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', req.user.id)
        .single();

      if (property.organization_id !== userProfile.organization_id) {
        return res.status(403).json({ 
          error: 'You do not have permission to delete this image' 
        });
      }

      // Extract the path from the URL
      const urlParts = image.image_url.split('/');
      const storagePath = urlParts
        .slice(urlParts.indexOf('property-images') + 1)
        .join('/')
        .split('?')[0];

      // Delete the image from storage
      const { error: storageError } = await supabase.storage
        .from('property-images')
        .remove([storagePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue anyway to try to delete the database record
      }

      // Delete the database record
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Database deletion error:', dbError);
        return res.status(500).json({ error: dbError.message });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error in deletePropertyImage:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PropertyImageController(); 