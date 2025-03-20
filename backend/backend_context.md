# PropEase Backend Code Documentation

This document provides a comprehensive overview of the PropEase backend codebase, documenting the purpose and relationships between files and components.

## Table of Contents
1. [Core Architecture](#core-architecture)
2. [Entry Points](#entry-points)
3. [Configuration](#configuration)
4. [Middleware](#middleware)
5. [Routes](#routes)
6. [Controllers](#controllers)
7. [Services](#services)
8. [Auto-generated API](#auto-generated-api)
9. [Database Integration](#database-integration)
10. [API Documentation](#api-documentation)

## Core Architecture

The PropEase backend follows an MVC (Model-View-Controller) architecture pattern, with some key components:

- **Router Layer**: HTTP routes defined in `/routes` directory, mapping endpoints to controllers
- **Controller Layer**: Business logic in `/controllers` directory, processing requests and returning responses
- **Service Layer**: Data access and core functionality in `/services` directory
- **Middleware**: Request processing utilities in `/middleware` directory
- **Configuration**: System settings in `/config` directory

The backend uses Express.js as the web framework and Supabase for database access, implementing a hybrid architecture that combines custom Express API endpoints with auto-generated Supabase APIs.

## Entry Points

### `/src/index.js`
The main application entry point that:
- Loads environment variables
- Sets up Express middleware (CORS, Helmet, Morgan)
- Registers route handlers
- Configures Swagger documentation
- Initializes the HTTP server
- Sets up graceful shutdown handling

### `/src/app.js`
A secondary entry point that:
- Creates and configures the Express application instance
- Used for testing and serverless deployments

## Configuration

### `/src/config/swagger.js`
Configures Swagger/OpenAPI documentation for the API:
- Defines OpenAPI specification version (3.0.0)
- Sets up API info, servers, and security schemes
- Initializes Swagger UI for API documentation
- Exposes the Swagger JSON and UI endpoints

### `/src/config/cors.js`
Configures Cross-Origin Resource Sharing (CORS) for the API:
- Sets allowed origins, methods, and headers
- Logs CORS configuration at startup
- Enables credentials for authentication

### `/src/config/supabase.js`
Sets up the Supabase client for database access:
- Initializes the Supabase client with appropriate credentials
- Configures authentication settings
- Provides error handling for initialization
- Exports the configured client for use throughout the application

## Middleware

### `/src/middleware/auth.middleware.js`
Handles authentication and authorization:
- `authenticateToken`: Verifies JWT tokens in request headers
- `checkRole`: Ensures users have required role permissions
- Integrates with Supabase for user profile and role verification

### `/src/middleware/hybrid-auth.middleware.js`
Supports both JWT and Supabase authentication methods:
- Attempts authentication with Supabase first
- Falls back to JWT verification if Supabase auth fails
- Provides a unified authentication interface for the application

### `/src/middleware/auth.js`
Simplified authentication middleware:
- Basic token validation functionality
- Used in simpler authentication flows

### `/src/middleware/error.middleware.js`
Global error handling middleware:
- Catches and processes errors thrown in route handlers
- Provides consistent error response format
- Logs errors for debugging

## Routes

### `/src/routes/auth.routes.js`
Authentication-related routes:
- User registration and login
- Password reset functionality
- Email verification
- User session management
- OAuth integration

### `/src/routes/property.routes.js`
Property management routes:
- CRUD operations for properties
- Property filtering and searching
- Property unit management
- Security checks for property access

### `/src/routes/owners.routes.js`
Property owner management routes:
- Owner registration and profile management
- Owner-property relationship management
- Financial information for owners

### `/src/routes/people.routes.js`
People management routes (tenants, prospects, etc.):
- CRUD operations for people records
- Contact information management
- Relationship management (tenant-property, etc.)

### `/src/routes/invite.routes.js`
User invitation routes:
- Generate and send invitations
- Accept/decline invitation flows
- Role assignment during invitation
- Organization onboarding

### `/src/routes/user.routes.js`
User profile routes:
- User profile management
- User preferences
- User-specific settings

### `/src/routes/lease.routes.js`
Lease management routes:
- CRUD operations for leases
- Lease terms and conditions
- Renewals and terminations

### `/src/routes/maintenance.routes.js`
Maintenance request routes:
- Create and track maintenance requests
- Assign maintenance tasks
- Track maintenance status

### `/src/routes/payment.routes.js`
Payment processing routes:
- Process rent payments
- Payment history
- Payment scheduling

### `/src/routes/rental.routes.js`
Rental property management routes:
- Rental listings
- Availability management
- Rental applications

### `/src/routes/auto-api.routes.js`
Auto-generated API routes:
- Dynamically generates RESTful endpoints for resources
- Standardized CRUD operations
- Security middleware integration
- Multi-tenant data isolation

## Controllers

### `/src/controllers/auth.controller.js`
Implements authentication business logic:
- User registration processing
- Login credential validation
- Password reset logic
- Token generation and validation

### `/src/controllers/property.controller.js`
Implements property management logic:
- Property creation with organization context
- Property retrieval with associated units
- Property update and deletion validation
- Cross-checks for data integrity

### `/src/controllers/owners.controller.js`
Handles property owner operations:
- Owner profile creation and management
- Owner-property association
- Owner financial data processing

### `/src/controllers/people.controller.js`
Manages people-related operations:
- Contact information validation
- Tenant relationship management
- Prospect tracking
- Communication preferences

### `/src/controllers/invite.controller.js`
Processes invitation workflows:
- Invitation generation with secure tokens
- Email sending for invitations
- Invitation verification
- User creation from invitations

### `/src/controllers/user.controller.js`
Manages user profile operations:
- Profile information updates
- User preference management
- User settings configuration

### `/src/controllers/rental.controller.js`
Handles rental property operations:
- Rental listing management
- Availability tracking
- Rental application processing

## Services

### `/src/services/auto-api.service.js`
Provides automatic API generation functionality:
- Direct table access via Supabase
- Standardized CRUD operations for any resource
- Query building with filtering and pagination
- Transaction management

### `/src/services/owner.service.js`
Manages property owner data:
- Owner database operations
- Owner-property relationships
- Financial calculations for owners

### `/src/services/people.service.js`
Handles people data management:
- Contact information storage and retrieval
- Relationship mapping
- Communication preferences

### `/src/services/role.service.js`
Manages user roles and permissions:
- Role definition and assignment
- Permission checking
- Role hierarchy management

### `/src/services/user.service.js`
Handles user-related data operations:
- User profile storage and retrieval
- User preferences management
- User settings persistence

## Auto-generated API

The PropEase backend implements an auto-generated API system that dynamically creates RESTful endpoints based on database tables:

### Core Components

1. **AutoApiService** (`/src/services/auto-api.service.js`):
   - Provides a reusable service for interacting with any Supabase table
   - Implements standardized CRUD operations
   - Handles filtering, pagination, and error management

2. **Auto API Routes** (`/src/routes/auto-api.routes.js`):
   - Dynamically generates Express routes for each resource
   - Applies consistent security middleware
   - Implements standardized error handling
   - Enforces multi-tenant data isolation

### Supported Resources

Currently, the auto-generated API supports the following resources:
- `properties`: Property management with organization isolation

### Benefits

- **Reduced Boilerplate**: Minimizes repetitive code for basic CRUD operations
- **Consistency**: Ensures all endpoints follow the same patterns and conventions
- **Maintainability**: Centralizes core functionality for easier updates
- **Flexibility**: Seamlessly combines with custom endpoints when needed

## Database Integration

The backend uses Supabase as the primary database, with a hybrid approach:

1. **Direct Supabase Access**:
   - Auto-generated APIs use direct table access
   - Row-Level Security (RLS) policies for data isolation

2. **Custom SQL Operations**:
   - Complex queries implemented via controllers and services
   - Transaction management for multi-step operations

## API Documentation

The PropEase API is documented using Swagger/OpenAPI:

### Swagger Integration

- **Configuration**: Defined in `/src/config/swagger.js`
- **Documentation Access**: Available at `/api-docs` when the server is running
- **JSON Specification**: Available at `/api-docs.json`

### Documentation Generation

- **Route Annotations**: Each route file contains JSDoc-style Swagger annotations
- **Automatic Generation**: Swagger spec is automatically generated from annotations
- **Postman Integration**: Documentation can be exported to Postman collections 