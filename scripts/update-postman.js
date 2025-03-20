const fs = require('fs');
const path = require('path');
const https = require('https');

// Read collection ID from config or environment
const COLLECTION_ID = process.env.POSTMAN_COLLECTION_ID;
const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;

if (!POSTMAN_API_KEY) {
  console.error('❌ POSTMAN_API_KEY environment variable is required');
  process.exit(1);
}

// Read the generated collection
const collectionPath = path.join(__dirname, '../backend/postman/propease-api.postman_collection.json');
const collection = require(collectionPath);

// Prepare request options
const options = {
  hostname: 'api.getpostman.com',
  path: COLLECTION_ID 
    ? `/collections/${COLLECTION_ID}` 
    : '/collections',
  method: COLLECTION_ID ? 'PUT' : 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': POSTMAN_API_KEY
  }
};

// Make request to Postman API
const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(data);
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      // If this was a new collection, save the ID
      if (!COLLECTION_ID) {
        const config = {
          POSTMAN_COLLECTION_ID: response.collection.id
        };
        fs.writeFileSync(
          path.join(__dirname, '../backend/postman/config.json'),
          JSON.stringify(config, null, 2)
        );
      }
      console.log('✅ Postman collection updated successfully!');
    } else {
      console.error('❌ Failed to update Postman collection:', response.error?.message || 'Unknown error');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error updating Postman collection:', error.message);
});

// Send the collection data
req.write(JSON.stringify({
  collection: collection
}));

req.end(); 