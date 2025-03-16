#!/usr/bin/env node

/**
 * This script converts the Swagger/OpenAPI documentation to a Postman collection
 * Usage: node scripts/swagger-to-postman.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { swaggerSpec } = require('../src/config/swagger');

// Ensure the output directory exists
const outputDir = path.join(__dirname, '../postman');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the Swagger spec to a file
const swaggerPath = path.join(outputDir, 'swagger.json');
fs.writeFileSync(swaggerPath, JSON.stringify(swaggerSpec, null, 2));

console.log('Swagger specification written to:', swaggerPath);
console.log('To convert to Postman collection, you can use one of these methods:');
console.log('\n1. Use the Postman API to convert the Swagger spec:');
console.log('   - Install the Postman CLI: npm install -g newman postman-collection-transformer');
console.log('   - Run: postman-collection-transformer convert swagger.json --type=swagger --output=propease-api.postman_collection.json');

console.log('\n2. Manual import in Postman:');
console.log('   - Open Postman');
console.log('   - Click "Import" button');
console.log('   - Select "File" tab and choose the swagger.json file');
console.log('   - Click "Import" to create a new collection');

console.log('\n3. Use the Postman API:');
console.log('   - Get your Postman API Key from https://go.postman.co/settings/me/api-keys');
console.log('   - Use the Postman API to convert the spec: https://api.getpostman.com/import/openapi');

console.log('\nYou can also use the Swagger UI at: http://localhost:5001/api-docs'); 