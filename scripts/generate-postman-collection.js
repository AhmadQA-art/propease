const fs = require('fs');
const path = require('path');
const swaggerJson = require('../backend/postman/swagger.json');

// Create Postman collection structure
const postmanCollection = {
  info: {
    name: 'PropEase API',
    description: 'API collection for PropEase property management system',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [],
  auth: {
    type: 'bearer',
    bearer: [
      {
        key: 'token',
        value: '{{accessToken}}',
        type: 'string'
      }
    ]
  },
  variable: [
    {
      key: 'baseUrl',
      value: 'http://localhost:5001',
      type: 'string'
    }
  ]
};

// Convert Swagger paths to Postman items
Object.entries(swaggerJson.paths).forEach(([path, methods]) => {
  Object.entries(methods).forEach(([method, endpoint]) => {
    const item = {
      name: endpoint.summary,
      request: {
        method: method.toUpperCase(),
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        url: {
          raw: `{{baseUrl}}${path}`,
          host: ['{{baseUrl}}'],
          path: path.split('/').filter(Boolean)
        },
        description: endpoint.description
      },
      response: []
    };

    // Add path parameters
    if (endpoint.parameters) {
      const pathParams = endpoint.parameters.filter(p => p.in === 'path');
      if (pathParams.length > 0) {
        item.request.url.variable = pathParams.map(p => ({
          key: p.name,
          value: '',
          description: p.description
        }));
      }
    }

    // Add query parameters
    if (endpoint.parameters) {
      const queryParams = endpoint.parameters.filter(p => p.in === 'query');
      if (queryParams.length > 0) {
        item.request.url.query = queryParams.map(p => ({
          key: p.name,
          value: '',
          description: p.description,
          disabled: true
        }));
      }
    }

    // Add request body
    if (endpoint.requestBody) {
      const contentType = Object.keys(endpoint.requestBody.content)[0];
      const schema = endpoint.requestBody.content[contentType].schema;
      
      if (schema.$ref) {
        const refPath = schema.$ref.split('/');
        const refName = refPath[refPath.length - 1];
        const refSchema = swaggerJson.components.schemas[refName];
        item.request.body = {
          mode: 'raw',
          raw: JSON.stringify(generateExample(refSchema), null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        };
      } else {
        item.request.body = {
          mode: 'raw',
          raw: JSON.stringify(generateExample(schema), null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        };
      }
    }

    // Add to collection based on tags
    const tag = endpoint.tags?.[0] || 'General';
    let tagFolder = postmanCollection.item.find(i => i.name === tag);
    if (!tagFolder) {
      tagFolder = { name: tag, item: [] };
      postmanCollection.item.push(tagFolder);
    }
    tagFolder.item.push(item);
  });
});

// Helper function to generate example values
function generateExample(schema) {
  if (!schema) return {};

  if (schema.example) return schema.example;

  if (schema.type === 'object') {
    const example = {};
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        example[key] = generateExample(prop);
      });
    }
    return example;
  }

  if (schema.type === 'array') {
    return [generateExample(schema.items)];
  }

  // Generate example values based on type
  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') return new Date().toISOString();
      if (schema.format === 'uuid') return '00000000-0000-0000-0000-000000000000';
      if (schema.format === 'email') return 'user@example.com';
      if (schema.enum) return schema.enum[0];
      return 'string';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return true;
    default:
      return null;
  }
}

// Generate environment file
const environment = {
  name: 'PropEase API Environment',
  values: [
    {
      key: 'baseUrl',
      value: 'http://localhost:5001',
      type: 'string'
    },
    {
      key: 'accessToken',
      value: '',
      type: 'string'
    },
    {
      key: 'userId',
      value: '',
      type: 'string'
    },
    {
      key: 'organizationId',
      value: '',
      type: 'string'
    }
  ]
};

// Create postman directory if it doesn't exist
const postmanDir = path.join(__dirname, '../backend/postman');
if (!fs.existsSync(postmanDir)) {
  fs.mkdirSync(postmanDir, { recursive: true });
}

// Write collection and environment files
fs.writeFileSync(
  path.join(postmanDir, 'propease-api.postman_collection.json'),
  JSON.stringify(postmanCollection, null, 2)
);

fs.writeFileSync(
  path.join(postmanDir, 'propease-api-environment.json'),
  JSON.stringify(environment, null, 2)
);

console.log('✅ Postman collection and environment files generated successfully!'); 