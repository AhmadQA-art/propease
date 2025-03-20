const { createClient } = require('@supabase/supabase-js');
const { verifyToken } = require('../utils/jwt');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Hybrid authentication middleware that supports both JWT and Supabase authentication
 */
const hybridAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // First try Supabase authentication
      const { data: { user }, error: supabaseError } = await supabase.auth.getUser(token);
      
      if (user) {
        // Supabase authentication successful
        req.user = {
          id: user.id,
          email: user.email,
          supabaseUser: user
        };
        return next();
      }
    } catch (supabaseError) {
      // If Supabase auth fails, try JWT verification
      try {
        const jwtPayload = await verifyToken(token);
        req.user = {
          ...jwtPayload,
          authType: 'jwt'
        };
        return next();
      } catch (jwtError) {
        // Both authentication methods failed
        return res.status(401).json({ 
          error: 'Invalid token',
          details: 'Token verification failed for both Supabase and JWT'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = { hybridAuthMiddleware }; 