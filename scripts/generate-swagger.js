const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PropEase API',
      version: '1.0.0',
      description: 'API documentation for PropEase property management system'
    },
    servers: [
      {
        url: `${process.env.API_URL || 'http://localhost:5001'}/api`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./backend/src/routes/*.js'] // Path to the API routes
};

// Generate swagger specification
const swaggerSpec = swaggerJsdoc(options);

// Clean up and normalize all paths to ensure they have exactly one /api prefix
const normalizedPaths = {};
Object.keys(swaggerSpec.paths).forEach(path => {
  // Remove any existing /api prefix
  let normalizedPath = path;
  if (normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.substring(4); // Remove the /api prefix
  }
  
  // Ensure normalized path starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  
  // Add the /api prefix back to ensure consistency
  normalizedPaths[`/api${normalizedPath}`] = swaggerSpec.paths[path];
});

// Replace all paths with normalized ones
swaggerSpec.paths = normalizedPaths;

// Log the normalized paths for debugging
console.log('Normalized API paths:');
Object.keys(swaggerSpec.paths).forEach(path => {
  console.log(`  ${path}`);
});

// Ensure the postman directory exists
const postmanDir = path.join(__dirname, '../backend/postman');
if (!fs.existsSync(postmanDir)) {
  fs.mkdirSync(postmanDir, { recursive: true });
}

// Write swagger.json file
fs.writeFileSync(
  path.join(postmanDir, 'swagger.json'),
  JSON.stringify(swaggerSpec, null, 2)
);

console.log('✅ Swagger documentation generated successfully!'); 