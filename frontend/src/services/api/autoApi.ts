import { api } from './client';
import { supabase } from '../supabase/client';

/**
 * Generic API client for auto-generated endpoints
 * This service provides access to all auto-generated API endpoints
 * and implements standard CRUD operations for all supported resources.
 */
export const autoApi = {
  /**
   * Get all records for a resource
   * @param resource The resource name (table name)
   * @param filters Optional filters and pagination options
   * @returns Promise with the data and count
   */
  getAll: async (resource: string, filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    
    // Add all filters as URL parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'limit' || key === 'offset') {
          params.append(key, value.toString());
        } else {
          // Format as filter[field_name]=value for standard filters
          params.append(`filter[${key}]`, value.toString());
        }
      }
    });
    
    try {
      console.log(`[AutoAPI] Fetching all ${resource} with params:`, params.toString());
      
      const response = await api.get(`/auto/${resource}?${params.toString()}`);
      console.log(`[AutoAPI] Received response for ${resource}:`, response);
      
      // Check response structure and extract data
      if (response.data) {
        // If response already contains data property, return it directly
        return response.data;
      } else {
        // If response doesn't have a data property, wrap it
        return { data: response };
      }
    } catch (error) {
      console.error(`[AutoAPI] Error fetching ${resource}:`, error);
      // Return empty data to avoid crashes
      return { data: [] };
    }
  },
  
  /**
   * Get a record by ID
   * @param resource The resource name (table name)
   * @param id The record ID
   * @returns Promise with the record data
   */
  getById: async (resource: string, id: string) => {
    console.log(`[AutoAPI] Fetching ${resource} with id: ${id}`);
    
    const response = await api.get(`/auto/${resource}/${id}`);
    return response.data;
  },
  
  /**
   * Create a new record
   * @param resource The resource name (table name)
   * @param data The record data
   * @returns Promise with the created record
   */
  create: async (resource: string, data: Record<string, any>) => {
    console.log(`[AutoAPI] Creating new ${resource} with data:`, data);
    
    // Check authentication via Supabase session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('[AutoAPI] No active Supabase session found. User must log in.');
        throw new Error('Authentication required. Please log in to continue.');
      }
      
      console.log(`[AutoAPI] User is authenticated as: ${session.user.email}`);
    } catch (error) {
      console.error('[AutoAPI] Error checking authentication:', error);
      throw new Error('Authentication error. Please try logging in again.');
    }
    
    // Special handling for specific resources that have different schema
    if (resource === 'owners') {
      // Only include fields that exist in the owners table schema
      const ownerData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        owner_type: data.owner_type,
        notes: data.notes,
        status: data.status || 'active',
        user_id: null // Explicitly set user_id to null
      };
      
      console.log(`[AutoAPI] Sanitized owner data:`, ownerData);
      
      // Use the standard API client which already includes the Authorization header
      const response = await api.post(`/auto/${resource}`, ownerData);
      return response.data;
    }
    
    // Default handling for other resources
    const response = await api.post(`/auto/${resource}`, data);
    return response.data;
  },
  
  /**
   * Update a record
   * @param resource The resource name (table name)
   * @param id The record ID
   * @param data The fields to update
   * @returns Promise with the updated record
   */
  update: async (resource: string, id: string, data: Record<string, any>) => {
    console.log(`[AutoAPI] Updating ${resource} ${id} with data:`, data);
    
    const response = await api.put(`/auto/${resource}/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete a record
   * @param resource The resource name (table name)
   * @param id The record ID
   * @returns Promise with the operation result
   */
  delete: async (resource: string, id: string) => {
    console.log(`[AutoAPI] Deleting ${resource} ${id}`);
    
    const response = await api.delete(`/auto/${resource}/${id}`);
    return response.data;
  }
}; 