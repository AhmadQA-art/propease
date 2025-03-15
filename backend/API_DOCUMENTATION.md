# PropEase API Documentation

This document provides comprehensive documentation for the PropEase API, including endpoint references and example curl commands for testing.

## Table of Contents

- [Authentication](#authentication)
  - [Login](#login)
  - [Register](#register)
  - [Reset Password](#reset-password)
  - [Verify Reset Token](#verify-reset-token)
  - [Update Password](#update-password)
- [People](#people)
  - [Team Members](#team-members)
  - [Tenants](#tenants)
  - [Vendors](#vendors)
  - [Owners](#owners)
  - [Documents](#documents)
  - [Invitations](#invitations)
- [Properties](#properties)
- [Rentals](#rentals)
- [Leases](#leases)
- [Maintenance](#maintenance)
- [Payments](#payments)
- [Users](#users)

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:5001/api
```

## Authentication

Authentication is required for most endpoints. The API uses JWT tokens for authentication.

### Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"yourpassword"}'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Register

```
POST /auth/register
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "newpassword",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"newpassword","first_name":"Jane","last_name":"Smith"}'
```

### Reset Password

Initiates the password reset process by sending a reset link to the user's email.

```
POST /auth/reset-password
```

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset instructions sent to your email"
}
```

### Verify Reset Token

Verifies a password reset token from an email link and redirects to the password update page.

```
GET /auth/confirm
```

**Query Parameters:**

- `token_hash`: The token hash from the email link
- `type`: The type of token (e.g., "recovery")
- `next`: (Optional) The path to redirect to after verification (default: "/auth/update-password")

**Example URL:**

```
http://localhost:5001/api/auth/confirm?token_hash=abc123def456&type=recovery&next=/auth/update-password
```

**Response:**

- Redirects to the update password page if successful
- Returns error JSON if verification fails:

```json
{
  "error": "Invalid token",
  "message": "Token has expired or is invalid"
}
```

### Verify Token Directly

Direct API endpoint for token verification from the frontend. Useful when working with the password reset flow.

```
POST /auth/verify-token
```

**Request Body:**

```json
{
  "token_hash": "abc123def456",
  "type": "recovery"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token_hash":"abc123def456","type":"recovery"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Token verified successfully",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "aBcDeFgHiJkLmNoPqRsTuVwXyZ...",
    "expires_at": 1678901234,
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    }
  }
}
```

### Update Password

Updates the user's password after a successful password reset.

```
POST /auth/update-password
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "password": "newSecurePassword"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/auth/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"password":"newSecurePassword"}'
```

**Response:**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## People

### Team Members

#### Create Team Member (DEPRECATED)

**Note: This endpoint is deprecated and will be removed in future versions. Please use the invitation system instead (`/api/invites/team/invite`).**

```
POST /people/team
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "first_name": "Michael",
  "last_name": "Johnson",
  "email": "michael.j@example.com",
  "phone": "555-123-4567",
  "department": "Maintenance",
  "role": "manager",
  "job_title": "Maintenance Manager",
  "invitation_methods": {
    "email": true,
    "sms": false
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/people/team \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "Michael",
    "last_name": "Johnson",
    "email": "michael.j@example.com",
    "phone": "555-123-4567",
    "department": "Maintenance",
    "role": "manager",
    "job_title": "Maintenance Manager",
    "invitation_methods": {
      "email": true,
      "sms": false
    }
  }'
```

**Response:**

```json
{
  "profile": {
    "id": "profile-id",
    "first_name": "Michael",
    "last_name": "Johnson",
    "email": "michael.j@example.com",
    "phone": "555-123-4567",
    "organization_id": "org-id",
    "status": "pending"
  },
  "teamMember": {
    "id": "team-member-id",
    "user_id": "profile-id",
    "organization_id": "org-id",
    "department": "Maintenance",
    "role_id": "manager",
    "job_title": "Maintenance Manager",
    "status": "pending"
  }
}
```

### Tenants

#### Create Tenant

```
POST /people/tenant
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "first_name": "Sarah",
  "last_name": "Williams",
  "email": "sarah.w@example.com",
  "phone": "555-234-5678",
  "contact_preferences": "email",
  "emergency_contact_name": "John Williams",
  "emergency_contact_phone": "555-876-5432",
  "emergency_contact_relationship": "Spouse",
  "invitation_methods": {
    "email": true,
    "sms": true
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/people/tenant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "Sarah",
    "last_name": "Williams",
    "email": "sarah.w@example.com",
    "phone": "555-234-5678",
    "contact_preferences": "email",
    "emergency_contact_name": "John Williams",
    "emergency_contact_phone": "555-876-5432",
    "emergency_contact_relationship": "Spouse",
    "invitation_methods": {
      "email": true,
      "sms": true
    }
  }'
```

**Response:**

```json
{
  "profile": {
    "id": "profile-id",
    "first_name": "Sarah",
    "last_name": "Williams",
    "email": "sarah.w@example.com",
    "phone": "555-234-5678",
    "organization_id": "org-id",
    "status": "pending"
  },
  "tenant": {
    "id": "tenant-id",
    "user_id": "profile-id",
    "organization_id": "org-id",
    "status": "pending",
    "preferred_contact_methods": ["email"],
    "emergency_contact": {
      "name": "John Williams",
      "phone": "555-876-5432",
      "relationship": "Spouse"
    }
  }
}
```

### Vendors

#### Create Vendor

```
POST /people/vendor
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "first_name": "Robert",
  "last_name": "Brown",
  "email": "robert.b@example.com",
  "phone": "555-345-6789",
  "service_type": "Plumbing",
  "business_type": "LLC",
  "notes": "Available on weekends",
  "hourly_rate": "75.00",
  "invitation_methods": {
    "email": true,
    "sms": false
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/people/vendor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "Robert",
    "last_name": "Brown",
    "email": "robert.b@example.com",
    "phone": "555-345-6789",
    "service_type": "Plumbing",
    "business_type": "LLC",
    "notes": "Available on weekends",
    "hourly_rate": "75.00",
    "invitation_methods": {
      "email": true,
      "sms": false
    }
  }'
```

**Response:**

```json
{
  "profile": {
    "id": "profile-id",
    "first_name": "Robert",
    "last_name": "Brown",
    "email": "robert.b@example.com",
    "phone": "555-345-6789",
    "organization_id": "org-id",
    "status": "pending"
  },
  "vendor": {
    "id": "vendor-id",
    "user_id": "profile-id",
    "organization_id": "org-id",
    "service_type": "Plumbing",
    "business_type": "LLC",
    "notes": "Available on weekends",
    "hourly_rate": "75.00"
  }
}
```

### Owners

#### Create Owner

```
POST /people/owner
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "first_name": "Jennifer",
  "last_name": "Davis",
  "email": "jennifer.d@example.com",
  "phone": "555-456-7890",
  "company_name": "Davis Properties LLC",
  "notes": "Owns multiple properties",
  "invitation_methods": {
    "email": true,
    "sms": true
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/people/owner \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "Jennifer",
    "last_name": "Davis",
    "email": "jennifer.d@example.com",
    "phone": "555-456-7890",
    "company_name": "Davis Properties LLC",
    "notes": "Owns multiple properties",
    "invitation_methods": {
      "email": true,
      "sms": true
    }
  }'
```

**Response:**

```json
{
  "profile": {
    "id": "profile-id",
    "first_name": "Jennifer",
    "last_name": "Davis",
    "email": "jennifer.d@example.com",
    "phone": "555-456-7890",
    "organization_id": "org-id",
    "status": "pending"
  },
  "owner": {
    "id": "owner-id",
    "user_id": "profile-id",
    "organization_id": "org-id",
    "company_name": "Davis Properties LLC",
    "status": "pending",
    "notes": "Owns multiple properties"
  }
}
```

### Documents

#### Upload Documents

```
POST /people/:id/documents
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request Parameters:**

- `id`: The ID of the person to upload documents for

**Request Body:**

Form data with files in the "documents" field (up to 10 files)

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/people/profile-id/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "documents=@/path/to/document1.pdf" \
  -F "documents=@/path/to/document2.pdf"
```

**Response:**

```json
[
  {
    "id": "doc-id-1",
    "related_to_id": "profile-id",
    "related_to_type": "tenant",
    "document_type": "pdf",
    "document_name": "document1.pdf",
    "document_url": "profile-id/1620000000000.pdf"
  },
  {
    "id": "doc-id-2",
    "related_to_id": "profile-id",
    "related_to_type": "tenant",
    "document_type": "pdf",
    "document_name": "document2.pdf",
    "document_url": "profile-id/1620000000001.pdf"
  }
]
```

### Invitations

#### Send Invitations (DEPRECATED)

**Note: This endpoint is deprecated and will be removed in future versions. Please use the dedicated invitation endpoints instead (`/api/invites/{role}/invite`).**

```
POST /people/:id/invitations
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Parameters:**

- `id`: The ID of the person to send invitations to

**Request Body:**

```json
{
  "methods": {
    "email": true,
    "sms": true
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/people/profile-id/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "methods": {
      "email": true,
      "sms": true
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "methods": {
    "email": true,
    "sms": true
  }
}
```

## Properties

### Get All Properties

```
GET /properties
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**

```bash
curl -X GET http://localhost:5001/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Property

```
POST /properties
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "name": "Sunset Apartments",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "zip_code": "12345",
  "total_units": 10,
  "owner_id": "owner-id",
  "property_manager_id": "manager-id",
  "property_status": "active"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sunset Apartments",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "12345",
    "total_units": 10,
    "owner_id": "owner-id",
    "property_manager_id": "manager-id",
    "property_status": "active"
  }'
```

## Rentals

### Get All Rentals

```
GET /rentals
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**

```bash
curl -X GET http://localhost:5001/api/rentals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Rental

```
POST /rentals
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "property": {
    "name": "Ocean View Complex",
    "address": "456 Beach Rd",
    "city": "Seaside",
    "state": "FL",
    "zip_code": "67890",
    "total_units": 5,
    "owner_id": "owner-id",
    "property_manager_id": "manager-id",
    "property_status": "active"
  },
  "units": [
    {
      "unit_number": "101",
      "rent_amount": 1500,
      "bedrooms": 2,
      "bathrooms": 1,
      "square_feet": 950,
      "status": "Available",
      "floor_plan": "2BR Standard",
      "smart_lock_enabled": true
    },
    {
      "unit_number": "102",
      "rent_amount": 1700,
      "bedrooms": 2,
      "bathrooms": 2,
      "square_feet": 1050,
      "status": "Available",
      "floor_plan": "2BR Deluxe",
      "smart_lock_enabled": true
    }
  ]
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/rentals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "property": {
      "name": "Ocean View Complex",
      "address": "456 Beach Rd",
      "city": "Seaside",
      "state": "FL",
      "zip_code": "67890",
      "total_units": 5,
      "owner_id": "owner-id",
      "property_manager_id": "manager-id",
      "property_status": "active"
    },
    "units": [
      {
        "unit_number": "101",
        "rent_amount": 1500,
        "bedrooms": 2,
        "bathrooms": 1,
        "square_feet": 950,
        "status": "Available",
        "floor_plan": "2BR Standard",
        "smart_lock_enabled": true
      },
      {
        "unit_number": "102",
        "rent_amount": 1700,
        "bedrooms": 2,
        "bathrooms": 2,
        "square_feet": 1050,
        "status": "Available",
        "floor_plan": "2BR Deluxe",
        "smart_lock_enabled": true
      }
    ]
  }'
```

## Leases

### Get All Leases

```
GET /leases
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**

```bash
curl -X GET http://localhost:5001/api/leases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Lease

```
POST /leases
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "tenant_id": "tenant-id",
  "property_id": "property-id",
  "unit_id": "unit-id",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "rent_amount": 1500,
  "security_deposit": 1500,
  "lease_type": "standard",
  "status": "active"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/leases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tenant_id": "tenant-id",
    "property_id": "property-id",
    "unit_id": "unit-id",
    "start_date": "2023-01-01",
    "end_date": "2023-12-31",
    "rent_amount": 1500,
    "security_deposit": 1500,
    "lease_type": "standard",
    "status": "active"
  }'
```

## Maintenance

### Get All Maintenance Requests

```
GET /maintenance
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**

```bash
curl -X GET http://localhost:5001/api/maintenance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Maintenance Request

```
POST /maintenance
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "property_id": "property-id",
  "unit_id": "unit-id",
  "tenant_id": "tenant-id",
  "title": "Leaking Faucet",
  "description": "The kitchen faucet is leaking and needs repair",
  "priority": "medium",
  "status": "pending",
  "category": "plumbing"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/maintenance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "property_id": "property-id",
    "unit_id": "unit-id",
    "tenant_id": "tenant-id",
    "title": "Leaking Faucet",
    "description": "The kitchen faucet is leaking and needs repair",
    "priority": "medium",
    "status": "pending",
    "category": "plumbing"
  }'
```

## Payments

### Get All Payments

```
GET /payments
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**

```bash
curl -X GET http://localhost:5001/api/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Payment

```
POST /payments
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**

```json
{
  "tenant_id": "tenant-id",
  "lease_id": "lease-id",
  "amount": 1500,
  "payment_date": "2023-05-01",
  "payment_method": "credit_card",
  "status": "completed",
  "payment_type": "rent"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "tenant_id": "tenant-id",
    "lease_id": "lease-id",
    "amount": 1500,
    "payment_date": "2023-05-01",
    "payment_method": "credit_card",
    "status": "completed",
    "payment_type": "rent"
  }'
```

## Users

### Get User Profile

```
GET /users/profile
```

**Request Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Example:**

```bash
curl -X GET http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "555-123-4567",
  "organization_id": "org-id",
  "status": "active"
}
```

## Testing with Postman

You can import the following Postman collection to test all the API endpoints:

1. Create a new collection in Postman
2. Add a new request for each endpoint
3. Set the appropriate HTTP method, URL, headers, and body
4. Create an environment variable for your JWT token after login
5. Use the environment variable in your Authorization headers

Example Postman environment:

```json
{
  "id": "your-environment-id",
  "name": "PropEase API",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5001/api",
      "enabled": true
    },
    {
      "key": "token",
      "value": "your-jwt-token",
      "enabled": true
    }
  ]
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message details"
}
```

## User Invitations

The following endpoints are used to invite users to the application with different roles.

### Send Team Member Invitation

```
POST /api/invites/team/invite
```

Invites a new team member to the organization.

**Request Headers:**
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Request Body:**
```json
{
  "email": "newteam@example.com"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/invites/team/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email":"newteam@example.com"}'
```

**Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newteam@example.com",
    "expires_at": "2023-06-08T12:00:00.000Z",
    "status": "pending"
  }
}
```

### Send Tenant Invitation

```
POST /api/invites/tenant/invite
```

Invites a new tenant to the organization.

**Request Headers:**
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Request Body:**
```json
{
  "email": "newtenant@example.com"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/invites/tenant/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email":"newtenant@example.com"}'
```

**Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newtenant@example.com",
    "expires_at": "2023-06-08T12:00:00.000Z",
    "status": "pending"
  }
}
```

### Send Vendor Invitation

```
POST /api/invites/vendor/invite
```

Invites a new vendor to the organization.

**Request Headers:**
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Request Body:**
```json
{
  "email": "newvendor@example.com"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/invites/vendor/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email":"newvendor@example.com"}'
```

**Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newvendor@example.com",
    "expires_at": "2023-06-08T12:00:00.000Z",
    "status": "pending"
  }
}
```

### Send Owner Invitation

```
POST /api/invites/owner/invite
```

Invites a new property owner to the organization.

**Request Headers:**
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Request Body:**
```json
{
  "email": "newowner@example.com"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/invites/owner/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"email":"newowner@example.com"}'
```

**Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newowner@example.com",
    "expires_at": "2023-06-08T12:00:00.000Z",
    "status": "pending"
  }
}
```

### Verify Invitation Token

```
GET /api/invites/verify/:token
```

Verifies if an invitation token is valid.

**Path Parameters:**
- `token`: The invitation token to verify

**cURL Example:**

```bash
curl -X GET http://localhost:5001/api/invites/verify/abc123def456 \
  -H "Content-Type: application/json"
```

**Response (200 OK):**
```json
{
  "message": "Invitation is valid",
  "invitation": {
    "id": "invitation-uuid",
    "email": "user@example.com",
    "organization_id": "organization-uuid",
    "role_id": "role-uuid"
  }
}
```

### Assign Role to User

```
POST /api/users/assign-role
```

Assigns a role to a user within an organization.

**Request Headers:**
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "team_member",
  "organizationId": "organization-uuid"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5001/api/users/assign-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user-uuid",
    "role": "team_member",
    "organizationId": "organization-uuid"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "userRole": {
    "id": "user-role-uuid",
    "user_id": "user-uuid",
    "role_id": "role-uuid",
    "organization_id": "organization-uuid",
    "created_at": "2023-06-07T12:00:00.000Z",
    "updated_at": "2023-06-07T12:00:00.000Z"
  }
}
``` 