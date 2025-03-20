import { authFetch } from '../utils/auth-fetch';

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
      
      // Create form data to send the file
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('propertyId', propertyId);

      // Use the backend endpoint
      const response = await authFetch('/api/property-images/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - the browser will set it with the boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload error:', response.status, response.statusText, errorData);
        throw new Error(errorData.error || `Failed to upload image: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Successfully uploaded image for property ${propertyId}`, result);
      return result;
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
      
      // Use the backend endpoint
      const response = await authFetch(`/api/property-images/${propertyId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Fetch error:', response.status, response.statusText, errorData);
        throw new Error(errorData.error || `Failed to fetch property images: ${response.status} ${response.statusText}`);
      }

      const images = await response.json();
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
   * @param imageUrl - The URL of the image to delete from storage (no longer needed with API)
   * @returns True if deletion was successful
   */
  async deletePropertyImage(imageId: string, imageUrl: string): Promise<boolean> {
    try {
      console.log(`Deleting image ${imageId}`);
      
      // Use the backend endpoint
      const response = await authFetch(`/api/property-images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Delete error:', response.status, response.statusText, errorData);
        throw new Error(errorData.error || `Failed to delete image: ${response.status} ${response.statusText}`);
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