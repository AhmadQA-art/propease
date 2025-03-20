# Supabase Integration Guide for Hybrid Architecture

## Overview
This guide outlines the steps to implement a hybrid architecture that combines Supabase's auto-generated APIs with existing manual Express endpoints in the PropEase application.

## Current Architecture Analysis
- Custom Express backend (port 5001)
- Direct Supabase client calls
- Mixed API base URLs:
  - `http://localhost:5001/api`
  - `/.netlify/functions/api`
  - Direct Supabase client calls
- Complex business logic in Express routes
- Swagger documentation for manual endpoints

## Implementation Steps

### 1. API Configuration Standardization

Create `frontend/src/config/api.config.ts`:
```typescript
export const API_CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  CUSTOM_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  SUPABASE_API_URL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`
};
```

### 2. Hybrid Service Layer

Create `frontend/src/services/api/hybrid.service.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from '@/config/api.config';
import axios from 'axios';

export const supabaseApi = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

export const createHybridService = (resourceName: string) => {
  const customApi = axios.create({
    baseURL: API_CONFIG.CUSTOM_API_URL
  });

  return {
    // Supabase Direct Operations
    supabaseOperations: {
      list: () => supabaseApi.from(resourceName).select('*'),
      getById: (id: string) => supabaseApi.from(resourceName).select('*').eq('id', id).single(),
      create: (data: any) => supabaseApi.from(resourceName).insert(data).select().single(),
      update: (id: string, data: any) => supabaseApi.from(resourceName).update(data).eq('id', id),
      delete: (id: string) => supabaseApi.from(resourceName).delete().eq('id', id)
    },

    // Custom API Operations
    customOperations: {
      get: (endpoint: string) => customApi.get(`/${resourceName}${endpoint}`),
      post: (endpoint: string, data: any) => customApi.post(`/${resourceName}${endpoint}`, data),
      put: (endpoint: string, data: any) => customApi.put(`/${resourceName}${endpoint}`, data),
      delete: (endpoint: string) => customApi.delete(`/${resourceName}${endpoint}`)
    }
  };
};

export const endpoints = {
  properties: () => supabaseApi.from('properties'),
  users: () => supabaseApi.from('users'),
  maintenance: () => supabaseApi.from('maintenance_requests'),
  leases: () => supabaseApi.from('leases'),
  payments: () => supabaseApi.from('payments')
};
```

### 3. Files Requiring Updates

#### Frontend Services
1. `frontend/src/services/api/auth.ts`
2. `frontend/src/services/api/properties.ts`
3. `frontend/src/services/api/people.ts`
4. `frontend/src/services/api/invitation.ts`

#### Backend Routes to Review and Maintain
1. `backend/src/routes/auth.routes.js` (Keep for complex auth flows)
2. `backend/src/routes/maintenance.routes.js` (Keep for workflow logic)
3. `backend/src/routes/lease.routes.js` (Keep for business rules)
4. `backend/src/routes/payment.routes.js` (Keep for payment processing)
5. `backend/src/routes/supabase.routes.js` (New file for direct Supabase operations)

### 4. Example Service Implementation

Updated property service (`frontend/src/services/api/properties.ts`):
```typescript
import { createHybridService } from './hybrid.service';
import type { Property } from '../types';

const hybridService = createHybridService('properties');

export const propertyApi = {
  // Direct Supabase operations for basic CRUD
  async getAllProperties() {
    const { data, error } = await hybridService.supabaseOperations.list();
    if (error) throw error;
    return data as Property[];
  },

  async getProperty(id: string) {
    const { data, error } = await hybridService.supabaseOperations.getById(id);
    if (error) throw error;
    return data as Property;
  },

  async createProperty(property: Omit<Property, 'id'>) {
    const { data, error } = await hybridService.supabaseOperations.create(property);
    if (error) throw error;
    return data as Property;
  },

  // Custom operations that require business logic
  async createPropertyWithMetadata(property: Omit<Property, 'id'>) {
    return hybridService.customOperations.post('/create-with-metadata', property);
  },

  async updatePropertyWithHistory(id: string, property: Partial<Property>) {
    return hybridService.customOperations.put(`/${id}/update-with-history`, property);
  }
};
```

### 5. Backend Route Organization

Create `backend/src/routes/supabase.routes.js`:
```javascript
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/auth.middleware');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Generic Supabase operations with RLS
router.get('/:table', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(req.params.table)
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 6. Security Implementation

#### Supabase RLS Policies
```sql
-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for properties
CREATE POLICY "Users can view properties in their organization" ON properties
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );
```

#### Hybrid Authentication Middleware
```javascript
// backend/src/middleware/hybrid-auth.middleware.js
const { verifyToken } = require('../utils/jwt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const hybridAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with both systems
    const [jwtVerification, supabaseSession] = await Promise.all([
      verifyToken(token),
      supabase.auth.getUser(token)
    ]);

    req.user = {
      ...jwtVerification,
      supabaseUser: supabaseSession.data.user
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { hybridAuthMiddleware };
```

### 7. Environment Configuration

Update `.env.example`:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5001/api
```

Update `netlify.toml`:
```toml
[build.environment]
VITE_SUPABASE_URL = "https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY = "your-anon-key"
VITE_API_URL = "/.netlify/functions/api"
```

### 8. Best Practices

1. **When to Use Supabase Direct APIs:**
   - Simple CRUD operations
   - Real-time subscriptions
   - File storage
   - Basic authentication flows

2. **When to Keep Manual Express Routes:**
   - Complex business logic
   - Multi-step workflows
   - Third-party integrations
   - Custom authentication flows
   - Batch operations
   - Complex validations

3. **Error Handling**
```typescript
// frontend/src/utils/error-handling.ts
export const handleApiError = async (error: any) => {
  if (error.code?.startsWith('PGRST')) {
    // Handle Supabase errors
    return handleSupabaseError(error);
  }
  // Handle Express API errors
  return handleExpressError(error);
};
```

### 9. Documentation Updates

Update Swagger configuration (`backend/src/config/swagger.js`):
```javascript
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PropEase Hybrid API',
      version: '1.0.0',
      description: 'API documentation for PropEase hybrid architecture'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};
```

## Conclusion

This hybrid integration approach allows you to:
1. Leverage Supabase's auto-generated APIs for simple operations
2. Maintain complex business logic in Express
3. Gradually migrate features as needed
4. Keep existing functionality while adding new features
5. Optimize performance based on usage patterns

Remember to:
- Keep custom endpoints for complex business logic
- Implement proper security measures
- Maintain type safety
- Monitor performance
- Document API changes

For questions or clarification, refer to the Supabase documentation or contact the development team.
```