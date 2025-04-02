const { supabase } = require('../config/supabase');

// Store valid tokens in memory to reduce unnecessary Supabase calls
const tokenCache = new Map();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
    
    if (!token) {
      console.log('No token in authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    // Check if token is in our cache first
    if (tokenCache.has(token)) {
      const cachedData = tokenCache.get(token);
      // If token is still valid (not expired)
      if (cachedData.expiresAt > Date.now()) {
        req.user = cachedData.user;
        req.session = { access_token: token };
        return next();
      } else {
        // Token expired, remove from cache
        tokenCache.delete(token);
      }
    }

    // Get the user from the token directly without creating a session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User validation error:', userError);
      return res.status(401).json({ error: userError?.message || 'Invalid user' });
    }

    // Fetch the user's profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*, user_roles(*, roles(*))')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(401).json({ error: 'Failed to fetch user profile' });
    }

    // Create a complete user object
    const completeUser = { 
      ...user, 
      ...profile,
      roles: profile.user_roles?.map(ur => ur.roles) || [] 
    };

    // Extract JWT expiration from token (assumes JWT format)
    // JWT expiration is in seconds from epoch, convert to milliseconds
    let expiresAt = Date.now() + (3600 * 1000); // Default 1 hour from now
    
    try {
      // Extract expiration from JWT if possible
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        if (payload.exp) {
          expiresAt = payload.exp * 1000; // Convert seconds to milliseconds
        }
      }
    } catch (e) {
      console.warn('Could not parse token expiration, using default');
    }

    // Cache the token with expiration time and user data
    tokenCache.set(token, {
      expiresAt,
      user: completeUser
    });

    req.session = { access_token: token };
    req.user = completeUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error', details: error.message });
  }
};

// Clean expired tokens from cache periodically (every 15 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (data.expiresAt < now) {
      tokenCache.delete(token);
    }
  }
}, 15 * 60 * 1000);

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        console.error('No user in request for role check');
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's roles from the profile
      const userRoles = req.user.roles || [];
      
      // Check if the user has any of the allowed roles
      const hasAllowedRole = userRoles.some(role => {
        const roleName = role?.name;
        return roleName && allowedRoles.includes(roleName);
      });

      if (!hasAllowedRole) {
        console.error('User roles not in allowed roles:', {
          userRoles: userRoles.map(r => r.name),
          allowedRoles
        });
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: 'Role verification failed', details: error.message });
    }
  };
};

module.exports = {
  authenticateToken,
  checkRole
};
