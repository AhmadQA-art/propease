# PropEase Backend

PropEase is a property management system designed to simplify property management tasks.

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to AWS Elastic Beanstalk

### Method 1: Manual Deployment

1. Create a deployment package:
   ```bash
   cd backend/fresh-eb
   ./create-eb-package.sh
   ```
   This script creates a `fresh-eb.zip` file in the backend directory.

2. Deploy to Elastic Beanstalk:
   - Log in to the AWS Management Console
   - Navigate to Elastic Beanstalk
   - Select your application and environment
   - Click on "Upload and Deploy"
   - Upload the `fresh-eb.zip` file
   - Enter a version label (e.g., `v1.0.0-production`)
   - Click "Deploy"

3. Environment Variables:
   Set the following environment variables in your Elastic Beanstalk environment:
   - `NODE_ENV`: `production`
   - `PORT`: `8081`
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `CORS_ORIGIN`: Your frontend URL (Amplify app URL)

### Method 2: CI/CD Deployment

1. Set up GitHub Repository:
   - Push your code to GitHub
   - Create two branches: `main` for production and `develop` for development

2. Configure GitHub Secrets:
   Add these secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AMPLIFY_CLI_TOKEN` (from AWS Amplify)
   - `DEV_SUPABASE_URL` (development Supabase URL)
   - `DEV_SUPABASE_ANON_KEY` (development Supabase anon key)
   - `DEV_API_URL` (development API URL)

3. The CI/CD pipeline is configured in:
   - `.github/workflows/production.yml` - Production deployment
   - `.github/workflows/development.yml` - Development deployment

4. Workflow:
   - Push to `develop` branch to deploy to development environment
   - Merge `develop` to `main` branch to deploy to production environment

## Setting Up a Custom Domain

1. Register a domain with AWS Route 53 or transfer an existing domain

2. Create a Hosted Zone:
   - Go to Route 53 in AWS console
   - Create a hosted zone for your domain

3. Create a CNAME record:
   - Go to your hosted zone
   - Create a record for your API subdomain (e.g., api.yourdomain.com)
   - Choose CNAME as the record type
   - Point it to your Elastic Beanstalk environment URL
   - Save the record

4. Set up HTTPS:
   - Go to AWS Certificate Manager
   - Request a certificate for your domain
   - Follow the validation process
   - Once validated, go to your Elastic Beanstalk environment
   - Configure the load balancer to use the certificate

5. Update CORS Settings:
   - Update the `CORS_ORIGIN` environment variable to include your frontend domain

## Troubleshooting

- **Health issues**: Check the Elastic Beanstalk logs and ensure all environment variables are correctly set
- **404 errors**: Ensure the correct routes are configured and the application is running properly
- **CORS errors**: Verify that the CORS settings are correctly configured

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## License

[MIT](LICENSE)

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