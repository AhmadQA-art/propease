import axios from 'axios';
import { supabase } from './supabase/client';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    console.log('Adding auth token to request:', session.access_token);
  } else {
    console.log('No auth token available');
  }
  
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response || error);
    
    // Handle auth errors
    if (error.response?.status === 401) {
      console.log('Auth error detected, redirecting to login');
      supabase.auth.signOut();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 