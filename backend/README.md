# PropEase Backend

## File Structure and Purpose

### Core Configuration Files
- `backend/package.json`: Project configuration and scripts
  - Contains scripts for development, building, and Postman integration
  - Main entry point is `src/index.js`

### API Documentation
- `backend/API_DOCS_README.md`: Instructions for API documentation and Postman integration
- `backend/API_DOCUMENTATION.md`: Comprehensive API endpoint reference
- `backend/src/config/swagger.js`: Swagger/OpenAPI configuration
  - Configures API documentation at `/api-docs`
  - Defines server information and security schemes

### Server Setup
- `backend/src/index.js`: Main application entry point
  - Sets up Express server
  - Configures middleware (CORS, Helmet, Morgan)
  - Mounts all route modules
  - Runs on port 5001 by default

### Postman Integration
- `backend/postman/`: Directory containing Postman-related files
  - `propease-api.postman_collection.json`: Postman collection
  - `propease-api-environment.json`: Environment variables
  - `postman-scripts.js`: Test scripts for requests
  - `swagger.json`: OpenAPI specification

### Deployment
- `backend/netlify/functions/`: Serverless function configuration for Netlify deployment
  - `index.js`: Main serverless entry point
  - `api.js`: API routes for serverless functions

## Environment Setup

1. Required Environment Variables:
```bash
PORT=5001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
CORS_ORIGIN=http://localhost:5173
```

## Available Scripts

```bash
# Development
npm run dev         # Start development server with nodemon

# Documentation
npm run generate-docs           # Generate Swagger documentation
npm run generate-postman-env    # Generate Postman environment
npm run postman-setup          # Generate both docs and environment
npm run update-postman         # Update Postman collection

# Production
npm run build      # Build for production
npm start          # Start production server
```

## Testing API Endpoints

### Method 1: Swagger UI
1. Start the server: `npm run dev`
2. Access Swagger UI: `http://localhost:5001/api-docs`
3. Use the interactive documentation to test endpoints

### Method 2: Postman
1. Import the collection:
   - Open Postman
   - Import `backend/postman/propease-api.postman_collection.json`
   - Import `backend/postman/propease-api-environment.json`

2. Set up environment:
   - Select "PropEase API Environment"
   - Update variables as needed

3. Use the pre-configured requests to test endpoints

### Method 3: cURL Commands
Refer to `backend/API_DOCUMENTATION.md` for detailed cURL examples for each endpoint.

## Available Endpoints

### Authentication
- POST `/auth/signup`: Register new user
- POST `/auth/signin`: User login
- POST `/auth/signout`: User logout
- GET `/auth/verify-token`: Verify JWT token

### User Management
- GET `/user/me`: Get current user
- GET `/user/profile`: Get user profile
- POST `/user/role`: Assign role

### Invitations
- POST `/invite/team-member`: Invite team member
- POST `/invite/tenant`: Invite tenant
- POST `/invite/owner`: Invite owner
- POST `/invite/vendor`: Invite vendor
- GET `/invite/verify/:token`: Verify invitation
- POST `/invite/accept/:token`: Accept invitation

### Additional Routes
- Property management (`/property`)
- Lease management (`/lease`)
- Maintenance (`/maintenance`)
- Payments (`/payment`)
- Rentals (`/rental`)
- People management (`/people`)
- Owners management (`/owners`)