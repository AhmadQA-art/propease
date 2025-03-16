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
const peopleRoutes = require('./routes/people.routes');
const inviteRoutes = require('./routes/invite.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { setupSwagger } = require('./config/swagger');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Default to Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Other middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/auth', authRoutes);
app.use('/property', propertyRoutes);
app.use('/lease', leaseRoutes);
app.use('/maintenance', maintenanceRoutes);
app.use('/payment', paymentRoutes);
app.use('/user', userRoutes);
app.use('/rental', rentalRoutes);
app.use('/people', peopleRoutes);
app.use('/invite', inviteRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`CORS enabled for origin: ${corsOptions.origin}`);
});
