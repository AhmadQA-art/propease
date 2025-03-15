const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authController = require('../controllers/auth.controller');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Sign up
router.post('/signup', authController.signup);

// Sign in
router.post('/signin', authController.signin);

// Request access
router.post('/request-access', authController.requestAccess);

// Password reset token verification endpoint
router.get('/confirm', async (req, res) => {
  console.log('Token exchange requested');
  const token_hash = req.query.token_hash;
  const type = req.query.type;
  const next = req.query.next ?? "/auth/update-password";

  if (!token_hash || !type) {
    console.error('Missing token_hash or type');
    return res.status(400).json({ 
      error: 'Missing parameters', 
      message: 'Token hash and type are required' 
    });
  }

  try {
    console.log(`Verifying token with type: ${type} and hash: ${token_hash.substring(0, 10)}...`);
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        error: 'Invalid token', 
        message: error.message 
      });
    }

    console.log('Token verified successfully, user session created');
    console.log('Redirecting to:', next);
    
    // Redirect to the frontend update password page - normalize the path
    const redirectPath = next.startsWith('/') ? next : `/${next}`;
    const cleanRedirectPath = redirectPath.replace('/account/', '/auth/');
    return res.redirect(303, `${process.env.FRONTEND_URL || 'http://localhost:5173'}${cleanRedirectPath}`);
  } catch (error) {
    console.error('Token verification exception:', error);
    return res.status(500).json({ 
      error: 'Error processing token', 
      message: error.message 
    });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user
router.get('/user', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Direct API endpoint for token verification
router.post('/verify-token', async (req, res) => {
  try {
    console.log('Direct token verification requested');
    const { token_hash, type } = req.body;
    
    if (!token_hash || !type) {
      return res.status(400).json({
        success: false,
        message: 'Token hash and type are required'
      });
    }
    
    console.log(`Verifying token with type: ${type} and hash: ${token_hash.substring(0, 10)}...`);
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    console.log('Token verified successfully, user session created');
    return res.json({
      success: true,
      message: 'Token verified successfully',
      session: data.session
    });
  } catch (error) {
    console.error('Token verification exception:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
