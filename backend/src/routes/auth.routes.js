const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authController = require('../controllers/auth.controller');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided information
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 characters)
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Server error
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Authenticate user
 *     description: Sign in with email and password to get access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     organization_id:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.post('/signin', authController.signin);

/**
 * @swagger
 * /auth/signout:
 *   post:
 *     summary: Sign out user
 *     description: Invalidates the user's session
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Signed out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Signed out successfully
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get current user
 *     description: Returns the currently authenticated user's information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 user_metadata:
 *                   type: object
 *                   properties:
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/user', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/request-access:
 *   post:
 *     summary: Request access to the system
 *     description: Submits a request for access to the system with organization information
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - organization_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               organization_name:
 *                 type: string
 *                 description: Name of the organization
 *     responses:
 *       200:
 *         description: Access request submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access request submitted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/request-access', authController.requestAccess);

/**
 * @swagger
 * /auth/confirm:
 *   get:
 *     summary: Confirm email or password reset
 *     description: Verifies a token for email confirmation or password reset
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token_hash
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token hash
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [signup, recovery]
 *         description: The type of verification
 *       - in: query
 *         name: next
 *         schema:
 *           type: string
 *         description: The URL to redirect to after verification
 *     responses:
 *       303:
 *         description: Redirects to the frontend update password page
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /auth/verify-token:
 *   post:
 *     summary: Verify token
 *     description: Directly verifies a token without redirection
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token_hash
 *               - type
 *             properties:
 *               token_hash:
 *                 type: string
 *                 description: The verification token hash
 *               type:
 *                 type: string
 *                 enum: [signup, recovery]
 *                 description: The type of verification
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token verified successfully
 *                 session:
 *                   type: object
 *                   description: User session information
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
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
