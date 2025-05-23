require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { setupSwagger } = require('./config/swagger');
const corsOptions = require('./config/cors');
const events = require('events');

// Increase event listener limit
events.EventEmitter.defaultMaxListeners = 15;

// Import routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const leaseRoutes = require('./routes/lease.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const paymentRoutes = require('./routes/payment.routes');
const userRoutes = require('./routes/user.routes');
const rentalRoutes = require('./routes/rental.routes');
const peopleRoutes = require('./routes/people.routes');
const inviteRoutes = require('./routes/invite.routes');
const ownersRoutes = require('./routes/owners.routes');
const autoApiRoutes = require('./routes/auto-api.routes');
const propertyImageRoutes = require('./routes/property-image.routes');
const departmentRoutes = require('./routes/department.routes');

const app = express();

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Other middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint for AWS Elastic Beanstalk
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    name: 'PropEase API',
    version: '1.0',
    documentation: '/api-docs',
    health: '/health',
    test: '/api/test'
  });
});

// Test route for verifying API access
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend API is running',
    environment: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

// Setup Swagger documentation
setupSwagger(app);

// Add proxy for direct access to auto API routes - redirects /auto/* to /api/auto/*
app.use('/auto', (req, res) => {
  const targetUrl = `/api/auto${req.url}`;
  console.log(`Redirecting request from /auto${req.url} to ${targetUrl}`);
  
  // Redirect to the API endpoint with the /api prefix
  res.redirect(307, targetUrl); // 307 maintains the original HTTP method
});

// List of API endpoints that need to be accessible directly without /api prefix
const directApiAccess = [
  'auth', 
  'properties', 
  'lease', 
  'maintenance', 
  'payment', 
  'user', 
  'rental', 
  'people',
  'invite',
  'owners',
  'departments'
];

// Add direct access to other API routes (for compatibility)
directApiAccess.forEach(endpoint => {
  app.use(`/${endpoint}`, (req, res) => {
    const targetUrl = `/api/${endpoint}${req.url}`;
    console.log(`Redirecting request from /${endpoint}${req.url} to ${targetUrl}`);
    
    // Redirect to the API endpoint with the /api prefix
    res.redirect(307, targetUrl); // 307 maintains the original HTTP method
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/lease', leaseRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/people', peopleRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/owners', ownersRoutes);
app.use('/api/auto', autoApiRoutes);
app.use('/api/property-images', propertyImageRoutes);
app.use('/api/departments', departmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.message 
  });
});

const port = process.env.PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
