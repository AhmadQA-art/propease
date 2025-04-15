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
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'PropEase API is running',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
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

// Import and use API routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

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
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
