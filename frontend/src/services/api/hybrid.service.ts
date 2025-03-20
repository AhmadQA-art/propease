import { createClient, SupabaseClient, PostgrestResponse } from '@supabase/supabase-js';
import { API_CONFIG } from '@/config/api.config';
import axios, { AxiosInstance } from 'axios';

// Types for the service operations
export interface ServiceOperations<T> {
  list: (options?: QueryOptions) => Promise<ServiceResponse<T[]>>;
  getById: (id: string) => Promise<ServiceResponse<T>>;
  create: (data: Omit<T, 'id'>) => Promise<ServiceResponse<T>>;
  update: (id: string, data: Partial<T>) => Promise<ServiceResponse<T>>;
  delete: (id: string) => Promise<ServiceResponse<void>>;
}

export interface CustomOperations {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data: any) => Promise<T>;
  put: <T>(endpoint: string, data: any) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}

export interface QueryOptions {
  select?: string[];
  filter?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  page?: number;
  limit?: number;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

// Create Supabase client
export const supabaseApi: SupabaseClient = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

// Create Axios instance for custom API
const customApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.CUSTOM_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add debug logging for API calls
customApi.interceptors.request.use(
  async (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

customApi.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

// Add auth token to requests
customApi.interceptors.request.use(async (config) => {
  const session = await supabaseApi.auth.getSession();
  if (session.data.session?.access_token) {
    config.headers.Authorization = `Bearer ${session.data.session.access_token}`;
    console.log('Added authorization token to request');
  } else {
    console.warn('No access token available for request');
  }
  return config;
});

/**
 * Creates a hybrid service that combines Supabase and custom API operations
 * @param resourceName - The name of the resource (e.g., 'properties', 'users')
 * @returns Object containing both Supabase and custom operations
 */
export function createHybridService<T extends { id: string }>(resourceName: string) {
  // Supabase operations
  const supabaseOperations: ServiceOperations<T> = {
    async list(options?: QueryOptions) {
      try {
        console.log(`Supabase operation: list ${resourceName}`, options);
        let query = supabaseApi.from(resourceName).select(
          options?.select ? options.select.join(',') : '*'
        );

        // Apply filters
        if (options?.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        // Apply sorting
        if (options?.sort) {
          options.sort.forEach(({ field, direction }) => {
            query = query.order(field, { ascending: direction === 'asc' });
          });
        }

        // Apply pagination
        if (options?.page && options?.limit) {
          const start = (options.page - 1) * options.limit;
          const end = start + options.limit - 1;
          query = query.range(start, end);
        }

        const { data, error } = await query;
        console.log(`Supabase list ${resourceName} result:`, { count: data?.length, error });
        return { 
          data: data ? (data as unknown as T[]) : null, 
          error 
        };
      } catch (error) {
        console.error(`Error in Supabase list ${resourceName}:`, error);
        return { data: null, error: error as Error };
      }
    },

    async getById(id: string) {
      try {
        console.log(`Supabase operation: getById ${resourceName}/${id}`);
        const { data, error } = await supabaseApi
          .from(resourceName)
          .select('*')
          .eq('id', id)
          .single();
        
        console.log(`Supabase getById ${resourceName}/${id} result:`, { success: !!data, error });
        return { data: data as T | null, error };
      } catch (error) {
        console.error(`Error in Supabase getById ${resourceName}/${id}:`, error);
        return { data: null, error: error as Error };
      }
    },

    async create(data: Omit<T, 'id'>) {
      try {
        console.log(`Supabase operation: create ${resourceName}`, data);
        const { data: created, error } = await supabaseApi
          .from(resourceName)
          .insert(data)
          .select()
          .single();
        
        console.log(`Supabase create ${resourceName} result:`, { success: !!created, error });
        return { data: created as T | null, error };
      } catch (error) {
        console.error(`Error in Supabase create ${resourceName}:`, error);
        return { data: null, error: error as Error };
      }
    },

    async update(id: string, data: Partial<T>) {
      try {
        console.log(`Supabase operation: update ${resourceName}/${id}`, data);
        const { data: updated, error } = await supabaseApi
          .from(resourceName)
          .update(data)
          .eq('id', id)
          .select()
          .single();
        
        console.log(`Supabase update ${resourceName}/${id} result:`, { success: !!updated, error });
        return { data: updated as T | null, error };
      } catch (error) {
        console.error(`Error in Supabase update ${resourceName}/${id}:`, error);
        return { data: null, error: error as Error };
      }
    },

    async delete(id: string) {
      try {
        console.log(`Supabase operation: delete ${resourceName}/${id}`);
        const { error } = await supabaseApi
          .from(resourceName)
          .delete()
          .eq('id', id);
        
        console.log(`Supabase delete ${resourceName}/${id} result:`, { success: !error, error });
        return { data: null, error };
      } catch (error) {
        console.error(`Error in Supabase delete ${resourceName}/${id}:`, error);
        return { data: null, error: error as Error };
      }
    }
  };

  // Custom API operations
  const customOperations: CustomOperations = {
    get: <T>(endpoint: string) => 
      customApi.get<T>(`/${resourceName}${endpoint}`).then(response => response.data),
    
    post: <T>(endpoint: string, data: any) =>
      customApi.post<T>(`/${resourceName}${endpoint}`, data).then(response => response.data),
    
    put: <T>(endpoint: string, data: any) =>
      customApi.put<T>(`/${resourceName}${endpoint}`, data).then(response => response.data),
    
    delete: <T>(endpoint: string) =>
      customApi.delete<T>(`/${resourceName}${endpoint}`).then(response => response.data)
  };

  return {
    supabaseOperations,
    customOperations
  };
}

// Export endpoints for direct Supabase access when needed
export const endpoints = {
  properties: () => supabaseApi.from('properties'),
  users: () => supabaseApi.from('users'),
  maintenance: () => supabaseApi.from('maintenance_requests'),
  leases: () => supabaseApi.from('leases'),
  payments: () => supabaseApi.from('payments'),
  invitations: () => supabaseApi.from('invitations')
}; 