const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Import your existing routes and middleware
const authRoutes = require('../../src/routes/auth.routes');
const rentalRoutes = require('../../src/routes/rental.routes');
// ... other route imports

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));
app.use(express.json());

// Routes
app.use('/.netlify/functions/api/auth', authRoutes);
app.use('/.netlify/functions/api/rentals', rentalRoutes);
// ... other routes

// Export the handler
exports.handler = serverless(app); 