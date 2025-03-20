/**
 * API Configuration for PropEase
 * This file centralizes all API-related configuration and endpoints
 */

// Environment variables validation
const requiredEnvVars = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  API_URL: import.meta.env.VITE_API_URL
};

// Validate required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: VITE_${key}`);
  }
});

// Log the API configuration for debugging
console.log('API Configuration:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.MODE
});

// Hybrid API mode selection types
export type ApiMode = 'supabase' | 'custom' | 'hybrid';

// Resource types for feature flags
export type DirectTableResource = 'properties' | 'units' | 'organizations';
export type CustomApiResource = 'payments' | 'maintenance_requests';

/**
 * API Configuration object
 * Contains all necessary API endpoints and configuration values
 */
export const API_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Custom API Configuration
  CUSTOM_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  
  // Supabase REST API endpoint
  SUPABASE_API_URL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,

  // API Versions
  API_VERSION: 'v1',

  // API Mode
  API_MODE: 'hybrid' as ApiMode,

  // Endpoints configuration
  ENDPOINTS: {
    AUTH: '/auth',
    PROPERTIES: '/properties',
    MAINTENANCE: '/maintenance',
    LEASES: '/leases',
    PAYMENTS: '/payments',
    USERS: '/users',
    INVITATIONS: '/invitations'
  },
  
  // Feature flags for hybrid API
  FEATURES: {
    USE_SUPABASE_AUTH: true,
    USE_SUPABASE_DIRECT_TABLES: ['properties', 'units', 'organizations'] as DirectTableResource[],
    USE_CUSTOM_API_ONLY: ['payments', 'maintenance_requests'] as CustomApiResource[]
  }
};

/**
 * Helper function to construct API URLs
 * @param endpoint - The endpoint path
 * @param isSupabase - Whether to use Supabase API URL
 * @returns Full API URL
 */
export const getApiUrl = (endpoint: string, isSupabase = false): string => {
  const baseUrl = isSupabase ? API_CONFIG.SUPABASE_API_URL : API_CONFIG.CUSTOM_API_URL;
  const url = `${baseUrl}${endpoint}`;
  console.log(`Constructed API URL: ${url}`);
  return url;
};

/**
 * Determine whether to use Supabase or custom API for a resource and operation
 */
export const shouldUseSupabase = (
  resource: string, 
  operation: 'read' | 'write' | 'delete'
): boolean => {
  // Type guard for comparing string literal types
  const isApiMode = (mode: string): mode is ApiMode => 
    ['supabase', 'custom', 'hybrid'].includes(mode);
  
  const apiMode = API_CONFIG.API_MODE;
  if (isApiMode(apiMode)) {
    if (apiMode === 'supabase') return true;
    if (apiMode === 'custom') return false;
  }
  
  // For hybrid mode, we decide based on the resource and operation
  if (API_CONFIG.FEATURES.USE_CUSTOM_API_ONLY.includes(resource as CustomApiResource)) return false;
  if (API_CONFIG.FEATURES.USE_SUPABASE_DIRECT_TABLES.includes(resource as DirectTableResource)) {
    // For complex operations, still use custom API
    if (operation === 'write' && resource === 'properties') return false;
    return true;
  }
  
  // Default to custom API
  return false;
};

// Export types for endpoints
export type ApiEndpoint = typeof API_CONFIG.ENDPOINTS[keyof typeof API_CONFIG.ENDPOINTS]; 