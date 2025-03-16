# Implementation Plan for People Page Features

This document outlines the plan to implement the features of adding tenants, owners, and vendors to the database and displaying a listing of them on the people page.

## 1. Database Changes

*   **Goal:** Modify the database schema to accommodate the storage of tenant, owner, and vendor information.
*   **File:** `database/schema.sql`
*   **Changes:**
    *   Add the following columns to the `tenants` table:
        *   `first_name` character varying(100)
        *   `last_name` character varying(100)
        *   `email` character varying(255)
        *   `phone` character varying(50)
        *   `unit_id` uuid
        *   `lease_start` date
        *   `lease_end` date
    *   Add the following columns to the `owners` table:
        *   `first_name` character varying(100)
        *   `last_name` character varying(100)
        *   `email` character varying(255)
        *   `phone` character varying(50)
        *   `properties` uuid[]
    *   Add the following columns to the `vendors` table:
        *   `first_name` character varying(100)
        *   `last_name` character varying(100)
        *   `email` character varying(255)
        *   `phone` character varying(50)
        *   `service_type` character varying(100)
        *   `business_type` character varying(100)

## 2. Backend Changes (API)

*   **Goal:** Create API endpoints to handle the creation and retrieval of tenants, owners, and vendors.
*   **Files:**
    *   `backend/src/controllers/people.controller.js`
    *   `backend/src/routes/people.routes.js`
    *   `backend/src/services/people.service.js`
    *   `backend/src/validators/people.validator.js`
*   **Changes:**
    *   **`backend/src/controllers/people.controller.js`:**
        *   Create a base `PeopleController` class with common CRUD operations
        *   Implement the following methods:
            *   `getAllPeople` - Combined list with pagination
            *   `getTenants`, `getOwners`, `getVendors` - Type-specific lists
            *   `createTenant`, `createOwner`, `createVendor` - Create operations
            *   `updatePerson` - Update operation
            *   `deletePerson` - Delete operation
            *   `bulkDelete` - Bulk delete operation
            *   `exportPeople` - Export functionality
    *   **`backend/src/routes/people.routes.js`:**
        *   Define routes for all controller methods:
            ```javascript
            GET    /api/people          // Get all people (paginated)
            GET    /api/people/tenants  // Get tenants
            GET    /api/people/owners   // Get owners
            GET    /api/people/vendors  // Get vendors
            POST   /api/people/tenant   // Create tenant
            POST   /api/people/owner    // Create owner
            POST   /api/people/vendor   // Create vendor
            PUT    /api/people/:id      // Update person
            DELETE /api/people/:id      // Delete person
            POST   /api/people/bulk-delete  // Bulk delete
            GET    /api/people/export   // Export people
            ```
    *   **`backend/src/services/people.service.js`:**
        *   Implement business logic for all operations
        *   Add proper error handling
        *   Include pagination logic
        *   Add search and filter functionality
    *   **`backend/src/validators/people.validator.js`:**
        *   Create validation schemas for each person type
        *   Implement request validation middleware

## 3. Frontend Changes

*   **Goal:** Enhance existing components and create new ones to support all person types and operations.
*   **Files to Modify:**
    *   **`frontend/src/components/people/AddPersonDialog.tsx` (Existing):**
        *   Add validation for email format
        *   Add proper error handling for API responses
        *   Add loading state feedback during invitation sending
        *   Add support for additional fields based on person type:
            ```typescript
            // Additional fields per type
            const additionalFields = {
              tenant: [
                { name: 'unit_id', label: 'Unit', type: 'select' },
                { name: 'lease_start', label: 'Lease Start', type: 'date' },
                { name: 'lease_end', label: 'Lease End', type: 'date' }
              ],
              vendor: [
                { name: 'service_type', label: 'Service Type' },
                { name: 'business_type', label: 'Business Type' }
              ],
              owner: [
                { name: 'properties', label: 'Properties', type: 'multiselect' }
              ]
            };
            ```

    *   **`frontend/src/pages/People.tsx` (Existing):**
        *   Add bulk selection functionality
        *   Implement search functionality
        *   Add sorting capabilities
        *   Implement pagination
        *   Add export functionality
        *   Connect to real API endpoints (currently using mock data)

*   **Files to Create:**
    *   **`frontend/src/components/people/PeopleTable.tsx`:**
        *   Implement sortable columns
        *   Add pagination controls
        *   Add row selection
        *   Add action buttons (edit, delete)
        *   Handle different person types

    *   **`frontend/src/components/people/PeopleFilters.tsx`:**
        *   Create search input
        *   Add filter by type
        *   Add filter by status
        *   Add date range filters
        *   Add clear filters functionality

    *   **`frontend/src/components/people/PeopleActions.tsx`:**
        *   Add bulk delete functionality
        *   Add export selected functionality
        *   Add bulk status update

    *   **`frontend/src/services/peopleService.ts`:**
        ```typescript
        export const peopleService = {
          getAll: async (params: PaginationParams) => {},
          getByType: async (type: PersonType, params: PaginationParams) => {},
          delete: async (id: string) => {},
          bulkDelete: async (ids: string[]) => {},
          export: async (filters: PeopleFilters) => {},
          update: async (id: string, data: Partial<Person>) => {},
        };
        ```

    *   **`frontend/src/utils/peopleValidation.ts`:**
        ```typescript
        export const personValidationSchema = {
          email: z.string().email(),
          phone: z.string().regex(/^\+?[\d\s-()]+$/),
          // Add more validation rules
        };
        ```

*   **State Management Updates:**
    *   Add people-related state:
        ```typescript
        interface PeopleState {
          items: Person[];
          loading: boolean;
          error: string | null;
          filters: PeopleFilters;
          pagination: PaginationState;
          selected: string[];
        }
        ```

*   **API Integration:**
    *   Implement proper error handling
    *   Add retry logic for failed requests
    *   Add request caching
    *   Implement optimistic updates

## 4. Testing

*   **Goal:** Ensure proper testing coverage for all new features.
*   **Changes:**
    *   **Backend Tests:**
        *   Unit tests for controllers
        *   Unit tests for services
        *   Integration tests for API endpoints
        *   Validation tests
    *   **Frontend Tests:**
        *   Component tests
        *   Integration tests
        *   Form validation tests
        *   API client tests

## 5. Documentation

*   **Goal:** Provide comprehensive documentation for the new features.
*   **Changes:**
    *   Update API documentation
    *   Add component documentation
    *   Update database schema documentation
    *   Add usage examples
    *   Document testing procedures

## 6. Deployment

*   **Goal:** Ensure smooth deployment of new features.
*   **Changes:**
    *   Create database migration scripts
    *   Update deployment configuration
    *   Add feature flags if needed
    *   Plan rollback procedures
