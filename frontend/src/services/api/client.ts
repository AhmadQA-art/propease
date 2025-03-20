import axios from 'axios';
import { supabase } from '../supabase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Include cookies with requests
});

// Auth token interceptor
api.interceptors.request.use(async (config) => {
  try {
    // Try to get Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    console.log(`[API Client] Request to ${config.url}: Supabase session ${session ? 'found' : 'not found'}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API Client] Added Authorization header with Supabase token: Bearer ${token.substring(0, 10)}...`);
    } else {
      // Fallback to localStorage token if Supabase session not available
      const localToken = localStorage.getItem('token');
      
      if (localToken) {
        config.headers.Authorization = `Bearer ${localToken}`;
        console.log(`[API Client] Added Authorization header with localStorage token: Bearer ${localToken.substring(0, 10)}...`);
      } else {
        console.warn(`[API Client] No authentication token available! Request may fail if endpoint requires authentication.`);
      }
    }
  } catch (error) {
    console.error('[API Client] Error getting authentication token:', error);
  }
  
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);