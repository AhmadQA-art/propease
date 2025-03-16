# PropEase API Documentation

This document provides instructions on how to use the API documentation and Postman integration for the PropEase API.

## Table of Contents

- [Swagger Documentation](#swagger-documentation)
- [Postman Integration](#postman-integration)
  - [Generating Postman Collection](#generating-postman-collection)
  - [Automatic Sync with Postman](#automatic-sync-with-postman)
  - [Importing to Postman](#importing-to-postman)
  - [Using Postman Environment](#using-postman-environment)
  - [Automated Test Scripts](#automated-test-scripts)
- [Adding Documentation to New Endpoints](#adding-documentation-to-new-endpoints)
- [Keeping Documentation in Sync](#keeping-documentation-in-sync)

## Swagger Documentation

The PropEase API is documented using the OpenAPI (Swagger) specification. This provides an interactive documentation that allows you to:

- View all available endpoints
- See request and response schemas
- Test endpoints directly from the documentation

### Accessing Swagger Documentation

When the server is running, you can access the Swagger documentation at:

```
http://localhost:5001/api-docs
```

This interactive documentation allows you to:

1. Browse all available endpoints organized by tags
2. See detailed request parameters, headers, and body schemas
3. View response formats and status codes
4. Execute requests directly from the browser (with proper authentication)

## Postman Integration

The API documentation can be exported to Postman for easier testing and collaboration.

### Generating Postman Collection

To generate a Postman collection and environment from the Swagger documentation:

1. Run the following command:

```bash
npm run postman-setup
```

2. This will create:
   - `swagger.json` file in the `postman` directory
   - `propease-api-environment.json` file in the `postman` directory
   - `postman-scripts.js` file with test scripts for Postman

### Automatic Sync with Postman

We've added a script that automatically converts the Swagger documentation to a Postman collection and uploads it directly to your Postman account:

1. Run the following command:

```bash
npm run update-postman
```

2. This will:
   - Generate the Swagger specification
   - Convert it to a Postman collection
   - Upload it to your Postman account
   - Save the collection ID for future updates

The script uses your Postman API key to upload the collection. The collection will be available in your Postman workspace immediately after running the script.

If you run the script again after making changes to your API, it will update the existing collection in Postman instead of creating a new one.

### Importing to Postman

If you prefer to manually import the collection, there are several ways to do this:

#### Method 1: Direct Import

1. Open Postman
2. Click the "Import" button in the top left
3. Select the "File" tab and choose the `postman/propease-api.postman_collection.json` file
4. Click "Import" to create a new collection

#### Method 2: Using Postman API

1. Get your Postman API Key from https://go.postman.co/settings/me/api-keys
2. Use the Postman API to convert the spec: https://api.getpostman.com/import/openapi

#### Method 3: Using Postman CLI Tools

1. Install the Postman CLI tools:
```bash
npm install -g openapi-to-postmanv2
```

2. Convert the Swagger spec to a Postman collection:
```bash
openapi2postmanv2 -s postman/swagger.json -o postman/propease-api.postman_collection.json
```

### Using Postman Environment

The Postman environment file contains variables that make it easier to work with the API:

1. Import the environment file:
   - Open Postman
   - Click on "Environments" in the sidebar
   - Click "Import" and select the `postman/propease-api-environment.json` file

2. Set up the environment:
   - Select the "PropEase API Environment" from the environment dropdown
   - After signing in to the API, update the "accessToken" variable with your JWT token

3. Use variables in your requests:
   - Use `{{baseUrl}}` instead of hardcoding the base URL
   - Use `{{accessToken}}` in the Authorization header

Example:
```
GET {{baseUrl}}/user/me
Authorization: Bearer {{accessToken}}
```

### Automated Test Scripts

The Postman integration includes automated test scripts that can be added to your requests to automatically set environment variables and perform other tasks.

#### Available Scripts

The following scripts are available in the `postman/postman-scripts.js` file:

1. **Sign In Test Script**: Automatically extracts the access token, user ID, organization ID, and other user information from the sign-in response and sets them as environment variables.

2. **Get Current User Test Script**: Updates environment variables with the latest user information.

3. **Sign Out Test Script**: Clears authentication-related environment variables when signing out.

4. **Create Entity Test Script**: Extracts and stores the ID of a newly created entity (tenant, property, etc.).

5. **Pre-request Script for Authentication**: Checks if the access token is set and warns if it's missing.

#### How to Use the Scripts

1. Open a request in Postman (e.g., the Sign In request)
2. Click on the "Tests" tab
3. Copy the appropriate script from `postman/postman-scripts.js`
4. Paste it into the Tests tab

For example, for the Sign In request:
1. Open the Sign In request
2. Click on the "Tests" tab
3. Copy the `signInTestScript` from `postman/postman-scripts.js`
4. Paste it into the Tests tab

Now, when you run the Sign In request, it will automatically:
- Extract the access token from the response
- Set the `accessToken` environment variable
- Extract the organization ID and set the `organizationId` environment variable
- Extract the user ID and set the `userId` environment variable
- And more

This makes testing the API much easier, as you don't have to manually copy and paste values between requests.

## Adding Documentation to New Endpoints

When adding new endpoints to the API, make sure to include Swagger annotations to keep the documentation up-to-date.

### Example

```javascript
/**
 * @swagger
 * /example/endpoint:
 *   post:
 *     summary: Short description of the endpoint
 *     description: Detailed description of what the endpoint does
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requiredField
 *             properties:
 *               requiredField:
 *                 type: string
 *                 description: Description of the field
 *     responses:
 *       200:
 *         description: Success response description
 *       400:
 *         description: Bad request description
 */
router.post('/example/endpoint', controller.exampleFunction);
```

## Keeping Documentation in Sync

To ensure the API documentation stays in sync with the actual implementation:

1. Always add Swagger annotations when creating new endpoints
2. Update annotations when modifying existing endpoints
3. Run `npm run update-postman` after making changes to update the Postman collection
4. Commit the updated Swagger documentation and Postman collection to version control

By following these practices, the API documentation will always reflect the current state of the API, making it easier for developers to understand and use the API correctly. 