import { supabase } from './supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  created_at: string;
}

export const propertyImageService = {
  /**
   * Upload an image to Supabase storage and save reference in the database
   * @param propertyId - The ID of the property this image belongs to
   * @param imageFile - The image file to upload
   * @returns The uploaded image record
   */
  async uploadPropertyImage(propertyId: string, imageFile: File): Promise<PropertyImage | null> {
    try {
      console.log(`Uploading image for property ${propertyId}`, imageFile.name);
      
      // Generate a unique file name
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${propertyId}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('property-images')
        .upload(filePath, imageFile, {
          upsert: false,
          contentType: imageFile.type
        });
      
      if (uploadError) {
        console.error('Error uploading image to storage:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('property-images')
        .getPublicUrl(filePath);
      
      // Create a database record
      const { data: imageRecord, error: dbError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: publicUrl,
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Error saving image record to database:', dbError);
        
        // Clean up the uploaded file if db insert fails
        await supabase
          .storage
          .from('property-images')
          .remove([filePath]);
          
        throw new Error(`Failed to save image record: ${dbError.message}`);
      }
      
      console.log(`Successfully uploaded image for property ${propertyId}`, imageRecord);
      return imageRecord;
    } catch (error) {
      console.error('Error in uploadPropertyImage:', error);
      return null;
    }
  },

  /**
   * Fetch all images for a specific property
   * @param propertyId - The ID of the property to fetch images for
   * @returns Array of property image records
   */
  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    try {
      console.log(`Fetching images for property ${propertyId}`);
      
      // Fetch directly from Supabase
      const { data: images, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching property images:', error);
        throw new Error(`Failed to fetch property images: ${error.message}`);
      }
      
      console.log(`Received ${images.length} images for property ${propertyId}`);
      return images;
    } catch (error) {
      console.error(`Error in getPropertyImages for property ${propertyId}:`, error);
      return [];
    }
  },
  
  /**
   * Delete a property image
   * @param imageId - The ID of the image record to delete
   * @param imageUrl - The URL of the image to delete from storage
   * @returns True if deletion was successful
   */
  async deletePropertyImage(imageId: string, imageUrl: string): Promise<boolean> {
    try {
      console.log(`Deleting image ${imageId}`);
      
      // Get the storage path from the URL
      const storageUrl = new URL(imageUrl);
      const pathParts = storageUrl.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === 'property-images');
      
      if (bucketIndex === -1) {
        console.error('Invalid image URL format', imageUrl);
        return false;
      }
      
      // Extract path after the bucket name
      const storagePath = pathParts.slice(bucketIndex + 1).join('/');
      
      // Delete from Supabase Storage
      const { error: storageError } = await supabase
        .storage
        .from('property-images')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Error deleting image from storage:', storageError);
        // Continue anyway to try to delete the database record
      }
      
      // Delete the database record
      const { error: dbError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);
      
      if (dbError) {
        console.error('Error deleting image record from database:', dbError);
        throw new Error(`Failed to delete image record: ${dbError.message}`);
      }
      
      console.log(`Successfully deleted image ${imageId}`);
      return true;
    } catch (error) {
      console.error('Error in deletePropertyImage:', error);
      return false;
    }
  },
  
  /**
   * Get a resized version of an image URL
   * @param url - The original image URL
   * @param width - The desired width
   * @param height - The desired height (default: same as width)
   * @returns The transformed URL
   */
  getResizedImageUrl(url: string, width: number, height: number = width): string {
    if (!url) return '';
    
    // If the URL is from Supabase storage, add transformation parameters
    if (url.includes('supabase.co/storage')) {
      return `${url.split('?')[0]}?width=${width}&height=${height}`;
    }
    
    return url;
  }
}; 