import { supabase } from '../config/supabase';

// Cache object to store the auth token with its expiration time
interface CachedSession {
  token: string;
  expiresAt: number; // timestamp when the token expires
  refreshToken?: string;
}

// Track ongoing token fetch requests to prevent duplicate calls
let tokenPromise: Promise<string | null> | null = null;

let cachedSession: CachedSession | null = null;
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiration
const TOKEN_REFRESH_BUFFER = 10 * 60 * 1000; // 10 minutes buffer for refresh

// Request counter for logging
let requestCount = 0;

/**
 * Gets the authentication token, using cache if available and valid
 */
async function getAuthToken(): Promise<string | null> {
  const requestId = ++requestCount;

  // If there's already an ongoing token fetch, reuse that promise instead of making a new request
  if (tokenPromise) {
    console.log(`[${requestId}] Reusing existing token fetch promise`);
    return tokenPromise;
  }

  try {
    // Create new token promise
    console.log(`[${requestId}] Starting new token fetch`);
    tokenPromise = _fetchAuthToken(requestId);
    return await tokenPromise;
  } finally {
    // Clear the promise reference when done
    tokenPromise = null;
  }
}

/**
 * Internal function to fetch the auth token
 */
async function _fetchAuthToken(requestId: number): Promise<string | null> {
  const now = Date.now();
  
  // Check if we have a cached token that's not expired (with buffer time)
  if (cachedSession) {
    // If token is still valid
    if (cachedSession.expiresAt > (now + TOKEN_EXPIRY_BUFFER)) {
      console.log(`[${requestId}] Using cached token, expires in ${Math.round((cachedSession.expiresAt - now) / 1000)}s`);
      return cachedSession.token;
    }
    
    // If token is near expiration but we have a refresh token, try to refresh it
    if (cachedSession.refreshToken && cachedSession.expiresAt > now) {
      try {
        console.log(`[${requestId}] Refreshing token that expires in ${Math.round((cachedSession.expiresAt - now) / 1000)}s`);
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: cachedSession.refreshToken,
        });
        
        if (!error && data.session) {
          // Update the cache with the refreshed token
          cachedSession = {
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: new Date(data.session.expires_at || '').getTime()
          };
          console.log(`[${requestId}] Token refreshed successfully, new expiry in ${Math.round((cachedSession.expiresAt - now) / 1000)}s`);
          return cachedSession.token;
        } else if (error) {
          console.warn(`[${requestId}] Token refresh failed:`, error);
        }
      } catch (err) {
        console.warn(`[${requestId}] Error refreshing token:`, err);
      }
      // Continue to fetch a new session
    }
    
    console.log(`[${requestId}] Cached token expired or refresh failed, fetching new session`);
  } else {
    console.log(`[${requestId}] No cached token, fetching new session`);
  }
  
  // Get a fresh token
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`[${requestId}] Error getting session:`, error);
      return null;
    }
    
    if (!data.session) {
      console.error(`[${requestId}] No session found in getSession response`);
      return null;
    }
    
    // Log token details (partial for security)
    const token = data.session.access_token;
    const expiry = new Date(data.session.expires_at || '').getTime();
    console.log(
      `[${requestId}] New token received, ` + 
      `starts with: ${token.substring(0, 10)}..., ` +
      `expires in: ${Math.round((expiry - now) / 1000)}s`
    );
    
    // Cache the token with its expiration time
    cachedSession = {
      token: token,
      refreshToken: data.session.refresh_token,
      expiresAt: expiry
    };
    
    return token;
  } catch (err) {
    console.error(`[${requestId}] Unexpected error in getSession:`, err);
    return null;
  }
}

/**
 * Makes an authenticated fetch request to the specified URL
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const currentRequest = ++requestCount;
  
  try {
    console.log(`[${currentRequest}] Starting authenticated request to: ${url}`);
    const token = await getAuthToken();
    
    if (!token) {
      console.error(`[${currentRequest}] No valid token available for request to ${url}`);
      throw new Error('Authentication failed: No valid session token');
    }
    
    // Add the token to the request headers
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    console.log(`[${currentRequest}] Sending request to: ${url}`);
    const response = await fetch(url, { ...options, headers });
    
    // Log response status
    console.log(`[${currentRequest}] Response from ${url}: ${response.status} ${response.statusText}`);
    
    // If we get a 401, our token might have just expired
    if (response.status === 401) {
      console.log(`[${currentRequest}] Got 401 response, invalidating token and retrying`);
      // Invalidate the cache and try again (but only once)
      invalidateAuthToken();
      
      const newToken = await getAuthToken();
      if (!newToken) {
        console.error(`[${currentRequest}] Failed to get new token after 401`);
        throw new Error('Authentication failed after retry: No valid session token');
      }
      
      // Make the request again with the new token
      const newHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      };
      
      console.log(`[${currentRequest}] Retrying request to: ${url}`);
      const retryResponse = await fetch(url, { ...options, headers: newHeaders });
      console.log(`[${currentRequest}] Retry response: ${retryResponse.status} ${retryResponse.statusText}`);
      return retryResponse;
    }
    
    return response;
  } catch (error) {
    console.error(`[${currentRequest}] Error in authFetch:`, error);
    throw error;
  }
}

/**
 * Forces the auth token to be refreshed on next request
 */
export function invalidateAuthToken(): void {
  console.log(`[${++requestCount}] Invalidating cached auth token`);
  cachedSession = null;
} 