#!/usr/bin/env node

/**
 * This script converts the Swagger/OpenAPI documentation to a Postman collection
 * and uploads it to Postman using the Postman API
 * 
 * Usage: node scripts/update-postman-collection.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');
const { swaggerSpec } = require('../src/config/swagger');

// Postman API Key
const POSTMAN_API_KEY = 'PMAK-67d6b7272e4fd7000106c282-48c9a841ddfea4e9cc630a7b2994cddf82';

// Collection name
const COLLECTION_NAME = 'PropEase API';

// Ensure the output directory exists
const outputDir = path.join(__dirname, '../postman');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the Swagger spec to a file
const swaggerPath = path.join(outputDir, 'swagger.json');
fs.writeFileSync(swaggerPath, JSON.stringify(swaggerSpec, null, 2));

console.log('Swagger specification written to:', swaggerPath);

// Function to convert OpenAPI to Postman collection using openapi-to-postmanv2
function convertOpenAPIToPostman() {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(outputDir, 'propease-api.postman_collection.json');
    
    console.log('Converting OpenAPI spec to Postman collection...');
    
    exec(`openapi2postmanv2 -s ${swaggerPath} -o ${outputPath} -p -O folderStrategy=Tags`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error converting OpenAPI to Postman collection:', error);
        reject(error);
        return;
      }
      
      console.log('Postman collection created at:', outputPath);
      resolve(outputPath);
    });
  });
}

// Function to upload the collection to Postman
function uploadToPostman(collectionPath) {
  return new Promise((resolve, reject) => {
    // Read the collection file
    const collectionData = fs.readFileSync(collectionPath, 'utf8');
    const collection = JSON.parse(collectionData);
    
    // Update the collection name
    if (collection.info) {
      collection.info.name = COLLECTION_NAME;
    }
    
    // Prepare the request data
    const requestData = JSON.stringify({
      collection: collection
    });
    
    // Set up the request options
    const options = {
      hostname: 'api.getpostman.com',
      path: '/collections',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': POSTMAN_API_KEY
      }
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Collection successfully uploaded to Postman!');
            
            // Save the collection ID for future updates
            if (response.collection && response.collection.uid) {
              console.log('Collection ID:', response.collection.uid);
              console.log('Collection Name:', response.collection.name);
              
              // Save the collection ID to a file for future reference
              fs.writeFileSync(
                path.join(outputDir, 'collection-info.json'), 
                JSON.stringify({
                  id: response.collection.uid,
                  name: response.collection.name
                }, null, 2)
              );
            }
            
            resolve(response);
          } else {
            console.error('Error uploading collection to Postman:', data);
            reject(new Error(`HTTP Status ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          console.error('Error parsing Postman API response:', error);
          console.error('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error making request to Postman API:', error);
      reject(error);
    });
    
    req.write(requestData);
    req.end();
  });
}

// Function to update an existing collection
function updateCollection(collectionId, collectionPath) {
  return new Promise((resolve, reject) => {
    // Read the collection file
    const collectionData = fs.readFileSync(collectionPath, 'utf8');
    const collection = JSON.parse(collectionData);
    
    // Update the collection name
    if (collection.info) {
      collection.info.name = COLLECTION_NAME;
    }
    
    // Prepare the request data
    const requestData = JSON.stringify({
      collection: collection
    });
    
    // Set up the request options
    const options = {
      hostname: 'api.getpostman.com',
      path: `/collections/${collectionId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': POSTMAN_API_KEY
      }
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Collection successfully updated in Postman!');
            console.log('Collection ID:', collectionId);
            resolve(response);
          } else {
            console.error('Error updating collection in Postman:', data);
            reject(new Error(`HTTP Status ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          console.error('Error parsing Postman API response:', error);
          console.error('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error making request to Postman API:', error);
      reject(error);
    });
    
    req.write(requestData);
    req.end();
  });
}

// Main function
async function main() {
  try {
    // Convert OpenAPI to Postman collection
    const collectionPath = await convertOpenAPIToPostman();
    
    // Check if we have a saved collection ID
    const collectionInfoPath = path.join(outputDir, 'collection-info.json');
    
    if (fs.existsSync(collectionInfoPath)) {
      try {
        const collectionInfo = JSON.parse(fs.readFileSync(collectionInfoPath, 'utf8'));
        
        if (collectionInfo.id) {
          console.log(`Updating existing collection with ID: ${collectionInfo.id}`);
          await updateCollection(collectionInfo.id, collectionPath);
          return;
        }
      } catch (error) {
        console.error('Error reading collection info:', error);
        // Continue to create a new collection
      }
    }
    
    // Create a new collection
    console.log('Creating a new collection in Postman...');
    await uploadToPostman(collectionPath);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 