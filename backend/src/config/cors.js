const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5173', // Default to Vite's default port
    'https://main.d3fa4pbfi6dm3q.amplifyapp.com',       // Amplify domain
    /\.amplifyapp\.com$/                                // Any Amplify subdomain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // Cache preflight request results for 24 hours (in seconds)
};

// Log CORS configuration on startup
console.log('CORS Configuration:', {
  origin: corsOptions.origin,
  methods: corsOptions.methods
});

module.exports = corsOptions;