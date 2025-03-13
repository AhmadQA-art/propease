# PropEase API Documentation

This document provides comprehensive documentation for the PropEase API, including endpoint references and example curl commands for testing.

## Table of Contents

- [Authentication](#authentication)
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

## People

### Team Members

#### Create Team Member

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

#### Send Invitations

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