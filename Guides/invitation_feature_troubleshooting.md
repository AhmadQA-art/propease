# Team Member Invitation Feature Troubleshooting Guide

## Current Flow Analysis
1. Organization admin invites team member by email
2. Invitation link is sent to the email
3. User clicks link and is directed to account setup page
4. User fills in personal information
5. User profile and team member records should be created/updated

## Identified Issues
1. `user_profiles` table not being updated with `organization_id` during invitation acceptance
2. Missing team member record creation in `team_members` table
3. Incomplete user profile data handling during authentication

## Database Schema Overview

### Relevant Tables
1. `user_profiles`
   - Stores basic user information
   - Key fields: id, email, first_name, last_name, organization_id, phone
   
2. `team_members`
   - Stores team member specific data
   - Key fields: user_id, role_id, job_title, department

3. `organization_invitations`
   - Stores pending invitations
   - Key fields: id, email, organization_id, role_id, status, token

4. `roles`
   - Stores role definitions
   - Key fields: id, name, permissions

## Required Changes

### 1. Database Triggers and Functions

We need to modify the `handle_new_user()` trigger function to properly handle organization_id:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if there's a pending invitation for this user
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    organization_id,
    created_at,
    updated_at
  )
  SELECT
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    (SELECT organization_id FROM organization_invitations 
     WHERE email = NEW.email AND status = 'pending' 
     ORDER BY created_at DESC LIMIT 1),
    NOW(),
    NOW();
    
  RETURN NEW;
END;
$function$;
```

### 2. Invitation Acceptance Handler

Create or modify the invitation acceptance handler to:
1. Update user profile with organization_id
2. Create team member record
3. Update invitation status

```typescript
async function handleInvitationAcceptance(token: string, userData: UserData) {
  const invitation = await getInvitationByToken(token);
  
  if (!invitation || invitation.status !== 'pending') {
    throw new Error('Invalid or expired invitation');
  }
  
  // Begin transaction
  const trx = await db.transaction();
  
  try {
    // Update user profile
    await trx('user_profiles')
      .where({ email: invitation.email })
      .update({
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        organization_id: invitation.organization_id
      });
      
    // Create team member record
    await trx('team_members').insert({
      user_id: userData.id,
      role_id: invitation.role_id,
      organization_id: invitation.organization_id
    });
    
    // Update invitation status
    await trx('organization_invitations')
      .where({ token })
      .update({ status: 'accepted' });
      
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
```

### 3. Required API Endpoints

1. Invitation Creation Endpoint:
```typescript
POST /api/invitations
Body: {
  email: string;
  role_id: string;
  organization_id: string;
}
```

2. Invitation Acceptance Endpoint:
```typescript
POST /api/invitations/accept
Body: {
  token: string;
  userData: {
    firstName: string;
    lastName: string;
    phone?: string;
  }
}
```

## Implementation Steps

1. Update Database Functions
   - Modify handle_new_user() trigger
   - Add necessary indexes for performance

2. Backend Changes
   - Implement/update invitation handlers
   - Add transaction support for data consistency
   - Add proper error handling and validation

3. Frontend Changes
   - Update invitation form to collect required data
   - Add proper validation
   - Handle API responses and errors

4. Testing Requirements
   - Test invitation creation
   - Test invitation acceptance
   - Test edge cases (expired invitations, invalid tokens)
   - Test concurrent invitations
   - Test data consistency

## Security Considerations

1. Token Security
   - Use secure token generation
   - Set appropriate expiration time
   - Implement rate limiting

2. Authorization
   - Verify organization admin permissions
   - Validate role assignments
   - Check invitation token ownership

3. Data Validation
   - Validate email formats
   - Sanitize user inputs
   - Verify organization membership

## Monitoring and Logging

1. Add logging for:
   - Invitation creation
   - Invitation acceptance
   - Failed attempts
   - Database operations

2. Monitor:
   - Invitation acceptance rate
   - Failed invitations
   - System performance
   - Error rates

## Rollback Plan

In case of issues:
1. Keep backup of previous implementation
2. Maintain version history
3. Have database rollback scripts ready
4. Document all changes for easy reversal

## Future Improvements

1. Add email verification step
2. Implement invitation expiration
3. Add bulk invitation feature
4. Enhance error reporting
5. Add invitation reminder system

## Project Files to Update

### Backend Files

1. `src/routes/invite.routes.js`
   - Update to handle new invitation routes and logic for invitation acceptance.

2. `src/controllers/invite.controller.js`
   - Implement logic for creating invitations, handling invitation acceptance, and updating user profiles and team member records.

3. `src/services/invitationService.js`
   - Business logic for invitation management, email sending, and token handling.

4. `src/middleware/auth.js`
   - Add invitation token validation and update organization access checks.

5. `src/database/migrations/YYYYMMDDHHMMSS_update_handle_new_user_trigger.js`
   - Create a migration to update the `handle_new_user()` trigger function.

### Frontend Files

1. `src/pages/auth/AcceptInvitation.tsx`
   - Handle invitation token, collect user data, and complete account setup flow.

2. `src/services/api/auth.ts`
   - Add API calls for invitation endpoints, including invitation acceptance and error handling.

3. `src/components/Invitation/InvitationForm.tsx`
   - Reusable invitation form component with input validation and submit handling.

4. `src/store/invitationSlice.ts`
   - State management for invitations, including actions and reducers.

5. `src/utils/invitationHelpers.ts`
   - Functions for token parsing, URL generation, and status checks.

### Configuration Files

- `.env`
  - Ensure environment variables related to invitations are set, such as invitation expiry and base URL.

### Testing Files

- Update or create test files for both backend and frontend to ensure the new invitation logic is thoroughly tested.

## Database Schema (DBML)

### Related Tables

```dbml
Table user_profiles {
  id uuid [pk]
  email varchar(255)
  first_name varchar(100)
  last_name varchar(100)
  organization_id uuid
  phone varchar(50)
  created_at timestamp
  updated_at timestamp
}

Table team_members {
  id uuid [pk]
  user_id uuid
  role_id uuid
  job_title varchar(100)
  department varchar(100)
  created_at timestamp
  updated_at timestamp
}

Table organization_invitations {
  id uuid [pk]
  email varchar(255)
  organization_id uuid
  role_id uuid
  status varchar(20)
  token varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table roles {
  id uuid [pk]
  name varchar(50)
  permissions jsonb
  created_at timestamp
  updated_at timestamp
}
```

## File Update Sequence

1. Database Changes
   - Apply migration for trigger update
   - Verify database functions

2. Backend Implementation
   - Create/update controllers and services
   - Implement API endpoints
   - Add validation and error handling

3. Frontend Implementation
   - Create new components
   - Update routing
   - Implement forms and validation

4. Testing
   - Write and run unit tests
   - Perform integration testing
   - Test edge cases

5. Deployment
   - Update environment variables
   - Deploy database changes
   - Deploy application updates 