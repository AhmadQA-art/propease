# PropEase API Documentation

This document provides comprehensive documentation for the PropEase API, including endpoint references and example curl commands for testing.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
  - [Sign Up](#sign-up)
  - [Sign In](#sign-in)
  - [Sign Out](#sign-out)
  - [Request Access](#request-access)
  - [Verify Token](#verify-token)
- [User Management](#user-management)
  - [Get Current User](#get-current-user)
  - [Get User Profile](#get-user-profile)
  - [Assign Role](#assign-role)
- [Invitations](#invitations)
  - [Team Member Invitation](#team-member-invitation)
  - [Tenant Invitation](#tenant-invitation)
  - [Owner Invitation](#owner-invitation)
  - [Vendor Invitation](#vendor-invitation)
  - [Verify Invitation](#verify-invitation)
  - [Accept Invitation](#accept-invitation)
- [Tenant Management](#tenant-management)
  - [Create Tenant Record](#create-tenant-record)
- [Error Handling](#error-handling)

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:5001
```

## Authentication

Authentication is required for most endpoints. The API uses JWT tokens for authentication.

### Sign Up

```
POST /auth/signup
```

**Request Headers:**
```
Content-Type: application/json
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
curl -X POST http://localhost:5001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "newpassword",
    "first_name": "Jane",
    "last_name": "Smith"
  }'
```

**Success Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user-uuid",
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or email already exists
- `500 Internal Server Error`: Server error

### Sign In

```
POST /auth/signin
```

**Request Headers:**
```
Content-Type: application/json
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
curl -X POST http://localhost:5001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid credentials
- `401 Unauthorized`: Authentication failed
- `500 Internal Server Error`: Server error

### Sign Out

```
POST /auth/signout
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/auth/signout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "message": "Successfully signed out"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `500 Internal Server Error`: Server error

### Request Access

```
POST /auth/request-access
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "organization_name": "My Company"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/auth/request-access \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "organization_name": "My Company"
  }'
```

**Success Response (200 OK):**
```json
{
  "message": "Access request submitted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input
- `500 Internal Server Error`: Server error

### Verify Token

```
POST /auth/verify-token
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification-token"
  }'
```

**Success Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid token
- `401 Unauthorized`: Token expired
- `500 Internal Server Error`: Server error

## User Management

### Get Current User

```
GET /user/me
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**cURL Example:**
```bash
curl -X GET http://localhost:5001/user/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "organization_id": "org-uuid",
  "role": "team_member"
}
```

### Get User Profile

```
GET /user/profile
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**cURL Example:**
```bash
curl -X GET http://localhost:5001/user/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Assign Role

```
POST /user/assign-role
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "team_member",
  "organizationId": "org-uuid"
}
```

## Invitations

### Team Member Invitation

```
POST /invite/team/invite
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newteam@example.com",
  "jobTitle": "Project Manager",
  "department": "Operations"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/invite/team/invite \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newteam@example.com",
    "jobTitle": "Project Manager",
    "department": "Operations"
  }'
```

**Success Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newteam@example.com",
    "expires_at": "2024-03-21T12:00:00.000Z",
    "status": "pending"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or user already exists
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

### Tenant Invitation

```
POST /invite/tenant/invite
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newtenant@example.com",
  "name": "John Doe",
  "phone": "555-234-5678",
  "language_preference": "English",
  "vehicles": {
    "vehicle1": {
      "make": "Toyota",
      "model": "Camry",
      "year": "2020",
      "plate": "ABC123"
    }
  },
  "pets": {
    "pet1": {
      "type": "Dog",
      "breed": "Labrador",
      "name": "Max",
      "weight": "65"
    }
  },
  "emergency_contact": {
    "name": "Jane Smith",
    "phone": "555-876-5432",
    "relationship": "Sister"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/invite/tenant/invite \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newtenant@example.com",
    "name": "John Doe",
    "phone": "555-234-5678",
    "language_preference": "English",
    "vehicles": {
      "vehicle1": {
        "make": "Toyota",
        "model": "Camry",
        "year": "2020",
        "plate": "ABC123"
      }
    },
    "pets": {
      "pet1": {
        "type": "Dog",
        "breed": "Labrador",
        "name": "Max",
        "weight": "65"
      }
    },
    "emergency_contact": {
      "name": "Jane Smith",
      "phone": "555-876-5432",
      "relationship": "Sister"
    }
  }'
```

**Success Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newtenant@example.com",
    "expires_at": "2024-03-21T12:00:00.000Z",
    "status": "pending"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or user already exists
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

### Owner Invitation

```
POST /invite/owner/invite
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newowner@example.com",
  "name": "Jennifer Davis",
  "phone": "555-456-7890",
  "company_name": "Davis Properties LLC",
  "address": "123 Business Ave, Suite 100",
  "business_type": "LLC",
  "tax_id": "12-3456789",
  "payment_schedule": "monthly",
  "payment_method": "direct_deposit",
  "notes": "Owns multiple properties"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/invite/owner/invite \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newowner@example.com",
    "name": "Jennifer Davis",
    "phone": "555-456-7890",
    "company_name": "Davis Properties LLC",
    "address": "123 Business Ave, Suite 100",
    "business_type": "LLC",
    "tax_id": "12-3456789",
    "payment_schedule": "monthly",
    "payment_method": "direct_deposit",
    "notes": "Owns multiple properties"
  }'
```

**Success Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newowner@example.com",
    "expires_at": "2024-03-21T12:00:00.000Z",
    "status": "pending"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or user already exists
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

### Vendor Invitation

```
POST /invite/vendor/invite
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newvendor@example.com",
  "contact_name": "Robert Brown",
  "phone": "555-345-6789",
  "service_type": "Plumbing",
  "business_type": "LLC",
  "service_areas": ["Downtown", "Suburbs"],
  "service_availability": {
    "weekdays": "9:00 AM - 5:00 PM",
    "weekends": "On Call"
  },
  "emergency_service": true,
  "payment_terms": "Net 30",
  "hourly_rate": 75.00,
  "notes": "Available for emergency calls"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/invite/vendor/invite \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newvendor@example.com",
    "contact_name": "Robert Brown",
    "phone": "555-345-6789",
    "service_type": "Plumbing",
    "business_type": "LLC",
    "service_areas": ["Downtown", "Suburbs"],
    "service_availability": {
      "weekdays": "9:00 AM - 5:00 PM",
      "weekends": "On Call"
    },
    "emergency_service": true,
    "payment_terms": "Net 30",
    "hourly_rate": 75.00,
    "notes": "Available for emergency calls"
  }'
```

**Success Response (200 OK):**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "newvendor@example.com",
    "expires_at": "2024-03-21T12:00:00.000Z",
    "status": "pending"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or user already exists
- `401 Unauthorized`: Invalid token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server error

### Verify Invitation

```
GET /invite/verify/:token
```

**Request Parameters:**
- `token`: The invitation token from the email link

**cURL Example:**
```bash
curl -X GET http://localhost:5001/invite/verify/abc123def456
```

**Success Response (200 OK):**
```json
{
  "message": "Invitation is valid",
  "invitation": {
    "id": "invitation-uuid",
    "email": "user@example.com",
    "organization_id": "org-uuid",
    "organization_name": "Example Organization",
    "role": "team_member"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid token format
- `404 Not Found`: Invitation not found
- `410 Gone`: Invitation expired
- `500 Internal Server Error`: Server error

### Accept Invitation

```
POST /invite/accept/:token
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Parameters:**
- `token`: The invitation token from the email link

**Request Body:**
```json
{
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 (123) 456-7890"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/invite/accept/abc123def456 \
  -H "Content-Type: application/json" \
  -d '{
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1 (123) 456-7890"
  }'
```

**Success Response (200 OK):**
```json
{
  "message": "Invitation accepted successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "organization_id": "org-uuid",
    "role": "team_member"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or token format
- `404 Not Found`: Invitation not found
- `410 Gone`: Invitation expired
- `500 Internal Server Error`: Server error

## Tenant Management

### Create Tenant Record

Creates a new tenant record in the database without creating a user profile or authentication.

```
POST /people/tenant-record
```

**Request Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john.doe@example.com",
  "emergency_contact_phone": "+1987654321"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/people/tenant-record \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john.doe@example.com",
    "emergency_contact_phone": "+1987654321"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant record created successfully",
  "data": {
    "id": "tenant-uuid",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john.doe@example.com",
    "emergency_contact_phone": "+1987654321",
    "organization_id": "org-uuid",
    "status": "active",
    "created_at": "2024-06-01T12:00:00.000Z",
    "updated_at": "2024-06-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or organization ID not found
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters or validation failed
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions to perform the action
- `404 Not Found`: Requested resource not found
- `410 Gone`: Resource no longer available (e.g., expired invitation)
- `422 Unprocessable Entity`: Request validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message details",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error context"
  }
}
```