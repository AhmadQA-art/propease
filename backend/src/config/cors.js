const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Default to Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

// Log CORS configuration on startup
console.log('CORS Configuration:', {
  origin: corsOptions.origin,
  methods: corsOptions.methods
});

module.exports = corsOptions;