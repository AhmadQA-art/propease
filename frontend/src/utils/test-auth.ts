/**
 * This is a utility for testing authentication to the backend
 * You can import and use this in any component to check if auth is working
 */

import { supabase } from '../config/supabase';
import { authFetch } from './auth-fetch';

/**
 * Test if the current session is valid and if the backend authentication is working
 * @returns Object containing success status and details
 */
export async function testAuthentication() {
  // First, check if we have a session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !sessionData.session) {
    console.error('No valid session found:', sessionError);
    return { 
      success: false, 
      error: 'No valid session', 
      details: sessionError?.message || 'No session data',
      step: 'get_session'
    };
  }
  
  console.log('Session found:', {
    user: sessionData.session.user.email,
    expires: new Date(sessionData.session.expires_at || '').toISOString(),
    tokenStart: sessionData.session.access_token.substring(0, 10) + '...'
  });
  
  // Now test a simple backend API call
  try {
    // Use a simple API endpoint that requires authentication
    const response = await authFetch('/api/user/profile');
    
    if (!response.ok) {
      // Try to get error details
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      return { 
        success: false, 
        error: `Backend request failed: ${response.status} ${response.statusText}`,
        details: errorData,
        step: 'backend_request'
      };
    }
    
    // Successfully authenticated to the backend
    const userData = await response.json();
    return {
      success: true,
      user: userData,
      session: sessionData.session
    };
  } catch (error) {
    console.error('Error during backend auth test:', error);
    return {
      success: false,
      error: 'Exception during backend request',
      details: error instanceof Error ? error.message : String(error),
      step: 'request_exception'
    };
  }
}

/**
 * Logs out the current user
 */
export async function logoutUser() {
  await supabase.auth.signOut();
  // Also clear any cached tokens
  localStorage.removeItem('supabase.auth.token');
  console.log('User logged out');
}

/**
 * Gets the current session details for debugging
 */
export async function getSessionDetails() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    return { error: error?.message || 'No session found' };
  }
  
  const { session } = data;
  
  // Return a sanitized version (don't expose full tokens)
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    },
    expires_at: session.expires_at,
    // Omitting created_at as it doesn't exist on the Session type
    // Only show the first few chars of the tokens
    access_token: `${session.access_token.substring(0, 10)}...`,
    refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 5)}...` : null,
  };
} 