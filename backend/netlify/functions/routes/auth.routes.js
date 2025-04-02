const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { signup, signin, requestAccess, getCurrentUser } = require('../controllers/auth.controller');

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
router.post('/signup', signup);

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
router.post('/signin', signin);

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
router.get('/user', getCurrentUser);

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
router.post('/request-access', requestAccess);

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
router.get('/confirm', (req, res) => res.send('Confirm endpoint'));

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
router.post('/verify-token', (req, res) => res.send('Verify token endpoint'));

module.exports = router;
