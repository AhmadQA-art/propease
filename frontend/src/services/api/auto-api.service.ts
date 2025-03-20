import axios, { AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { supabaseApi } from './hybrid.service';

// Base URL for auto-generated API
const BASE_URL = `${API_CONFIG.CUSTOM_API_URL}/auto`;

/**
 * Create an Axios instance for the auto-generated API
 */
const autoApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
autoApiClient.interceptors.request.use(async (config) => {
  const session = await supabaseApi.auth.getSession();
  if (session.data.session?.access_token) {
    config.headers.Authorization = `Bearer ${session.data.session.access_token}`;
  }
  return config;
});

// Add debugging interceptors
autoApiClient.interceptors.request.use(
  (config) => {
    console.log(`[AutoAPI] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[AutoAPI] Request error:', error);
    return Promise.reject(error);
  }
);

autoApiClient.interceptors.response.use(
  (response) => {
    console.log(`[AutoAPI] Response (${response.status}):`, response.data);
    return response;
  },
  (error) => {
    console.error('[AutoAPI] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Create a service for interacting with an auto-generated API endpoint
 * @param resourceName - The name of the resource (table)
 */
export function createAutoApiService<T extends { id: string; organization_id?: string }>(resourceName: string) {
  return {
    /**
     * Get all records
     * @param options - Query options
     * @returns Promise with the records
     */
    async getAll(options: {
      filters?: Record<string, any>;
      limit?: number;
      offset?: number;
    } = {}) {
      const params: Record<string, any> = {};
      
      // Add pagination
      if (options.limit) params.limit = options.limit;
      if (options.offset) params.offset = options.offset;
      
      // Add filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          params[`filter[${key}]`] = value;
        });
      }
      
      const response = await autoApiClient.get<{ data: T[]; count: number }>(
        `/${resourceName}`,
        { params }
      );
      
      return response.data;
    },
    
    /**
     * Get a record by ID
     * @param id - The record ID
     * @returns Promise with the record
     */
    async getById(id: string) {
      const response = await autoApiClient.get<{ data: T }>(
        `/${resourceName}/${id}`
      );
      
      return response.data.data;
    },
    
    /**
     * Create a new record
     * @param data - The record data
     * @returns Promise with the created record
     */
    async create(data: Omit<T, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) {
      const response = await autoApiClient.post<{ data: T }>(
        `/${resourceName}`,
        data
      );
      
      return response.data.data;
    },
    
    /**
     * Update a record
     * @param id - The record ID
     * @param data - The data to update
     * @returns Promise with the updated record
     */
    async update(id: string, data: Partial<T>) {
      const response = await autoApiClient.put<{ data: T }>(
        `/${resourceName}/${id}`,
        data
      );
      
      return response.data.data;
    },
    
    /**
     * Delete a record
     * @param id - The record ID
     * @returns Promise indicating success
     */
    async delete(id: string) {
      await autoApiClient.delete(`/${resourceName}/${id}`);
      return true;
    }
  };
}

/**
 * Auto API service for properties
 */
export const autoPropertiesApi = createAutoApiService<{
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
}>('properties');

// Export additional auto API services as needed 