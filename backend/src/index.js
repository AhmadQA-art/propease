require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const path = require('path');
const authRoutes = require(path.join(__dirname, 'routes', 'auth.routes'));
const propertyRoutes = require(path.join(__dirname, 'routes', 'property.routes'));
const leaseRoutes = require(path.join(__dirname, 'routes', 'lease.routes'));
const maintenanceRoutes = require(path.join(__dirname, 'routes', 'maintenance.routes'));
const paymentRoutes = require(path.join(__dirname, 'routes', 'payment.routes'));
const userRoutes = require(path.join(__dirname, 'routes', 'user.routes'));
const rentalRoutes = require('./routes/rental.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
