#!/usr/bin/env node

/**
 * This script generates a Postman environment file with the current configuration
 * Usage: node scripts/postman-env.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Ensure the output directory exists
const outputDir = path.join(__dirname, '../postman');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create Postman environment
const environment = {
  id: "propease-api-environment",
  name: "PropEase API Environment",
  values: [
    {
      key: "baseUrl",
      value: process.env.BASE_URL || "http://localhost:5001",
      type: "default",
      enabled: true
    },
    {
      key: "accessToken",
      value: "",
      type: "secret",
      enabled: true
    },
    {
      key: "userId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "organizationId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "userName",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "userEmail",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "userRole",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "tenantId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "ownerId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "vendorId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "propertyId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "unitId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "leaseId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "maintenanceId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "paymentId",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "invitationToken",
      value: "",
      type: "default",
      enabled: true
    },
    {
      key: "testEmail",
      value: "test@example.com",
      type: "default",
      enabled: true
    },
    {
      key: "testPassword",
      value: "Password123!",
      type: "secret",
      enabled: true
    }
  ],
  _postman_variable_scope: "environment"
};

// Write environment file
const envPath = path.join(outputDir, 'propease-api-environment.json');
fs.writeFileSync(envPath, JSON.stringify(environment, null, 2));

console.log('Postman environment file created at:', envPath);
console.log('\nTo use this environment in Postman:');
console.log('1. Open Postman');
console.log('2. Click on "Environments" in the sidebar');
console.log('3. Click "Import" and select the environment file');
console.log('4. After signing in to the API, update the "accessToken" variable with your JWT token');
console.log('\nThis will allow you to use the {{baseUrl}} and {{accessToken}} variables in your requests.');
console.log('\nAdditional variables will be automatically set by the test scripts when you run the requests.'); 