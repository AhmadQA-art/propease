# Implementation of Invitation Feature

  

This document outlines the implementation of an invitation feature for the PropEase application, segmented by user type (Team Members, Tenants, Vendors, and Owners). It provides step-by-step instructions for both backend and frontend development, specifying API endpoints, data models, database schema modifications, and testing recommendations. The instructions must be clear and actionable for developers of varying skill levels.

Based on the PropEase system implementation, here's how the user invitation process works and what users will see after clicking the invitation link:

## How Users Are Invited

Users are invited to PropEase through a specific API endpoint that sends invitations via email and optionally SMS:

The invitation process works as follows:

1. An administrator creates a user profile in the system (team member, tenant, vendor, or owner) using the respective API endpoints:
    
        
2. The system then sends an invitation with a secure token to the user's email address (and optionally via SMS if specified in the `invitationmethods` parameter)
    
3. The invitation is recorded in the database in the `organization_invitations` table with a status of "pending" and includes:
    
    - A unique token
        
    - The user's email
        
    - The organization ID
        
    - The role assigned to the user
        
    - An expiration timestamp
        

## What Users See After Clicking the Link

When a user clicks the invitation link in their email, they will experience a flow similar to the password reset process shown in the code:

1. **Initial Processing Screen**:
    
    - The PropEase logo
        
    - A "Processing your invitation link..." message while the system validates the token1
        
2. **Account Setup Screen**:
    
    - After successful validation, the user will see a form prompting them to set up their account
        
    - They'll create a password (with confirmation field)
        
    - The form will look similar to the password reset form with PropEase branding and styling1
        
3. **Form Fields**:
    
    - Password field (with minimum length requirement of 8 characters)
        
    - Confirm password field
        
    - Both with validation to ensure they match1
        
4. **Submission Process**:
    
    - A button to complete their account setup
        
    - Loading state during submission ("Setting up account...")
        
    - Success message upon completion1
        
5. **Redirection**:
    
    - After successful account setup, the user will be redirected to the login page
        
    - They can then log in with their email and newly created password1
        

The entire process is designed with the same clean, branded interface seen in the password reset flow, ensuring a consistent user experience throughout the PropEase platform.


## Backend Implementation

  

### 1. Database Schema Modifications

  

Instead of directly adding a `role` column to the `user_profiles` table, we will implement a more flexible and scalable role-based access control (RBAC) system using three tables: `user_profiles`, `roles`, and `user_roles`.

  

#### a. Examine Existing Schema

  

Review the current database schema in `database/SCHEMA.md` to identify existing tables and relationships related to user profiles and roles.

  

#### b. Modify `user_profiles` Table (if necessary)

  

The `user_profiles` table remains mostly unchanged, but we'll remove any direct references to roles.

  

#### c. Create `roles` Table

  

Create a `roles` table to store the different user roles (e.g., team_member, tenant, vendor, owner).

  

```sql

CREATE TABLE roles (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

name VARCHAR(50) UNIQUE NOT NULL,

description TEXT,

created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()

);

```

  

#### d. Create `user_roles` Table

  

Create a `user_roles` table as a many-to-many relationship between `user_profiles` and `roles`.

  

```sql

CREATE TABLE user_roles (

id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

user_id UUID REFERENCES user_profiles(id),

role_id UUID REFERENCES roles(id),

organization_id UUID,

created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

UNIQUE (user_id, role_id, organization_id)

);

```

  

This structure allows a user to have multiple roles within different organizations.

  

#### e. Understanding the Relationships

  

* `user_profiles` stores basic user information.

* `roles` stores the different roles available in the system.

* `user_roles` connects users to roles, specifying which roles a user has within a particular organization.

  

#### f. Querying User Roles

  

To query a user's roles, you would use a JOIN operation:

  

```sql

SELECT r.name

FROM user_profiles up

JOIN user_roles ur ON up.id = ur.user_id

JOIN roles r ON ur.role_id = r.id

WHERE up.id = 'user-uuid' AND ur.organization_id = 'org-uuid';

```

  

This query retrieves the names of all roles that a user has within a specific organization.

  

#### g. Managing User Roles

  

To assign a role to a user, you would insert a new record into the `user_roles` table:

  

```sql

INSERT INTO user_roles (user_id, role_id, organization_id)

VALUES ('user-uuid', 'role-uuid', 'org-uuid');

```

  

To remove a role from a user, you would delete the corresponding record from the `user_roles` table:

  

```sql

DELETE FROM user_roles

WHERE user_id = 'user-uuid' AND role_id = 'role-uuid' AND organization_id = 'org-uuid';

```

  

#### h. Seeding Roles

  

It's important to seed the `roles` table with the initial set of roles:

  

```sql

INSERT INTO roles (name, description) VALUES

('team_member', 'Team member with access to specific functionalities'),

('tenant', 'Tenant with access to rental information'),

('vendor', 'Vendor providing services'),

('owner', 'Property owner');

```

  

### 2. API Endpoints

  

Create new invitation routes in `backend/src/routes/invite.routes.js` for each user type:

  

* `/people/team/invite`

* `/people/tenant/invite`

* `/people/vendor/invite`

* `/people/owner/invite`

  

These routes will handle sending the invitation email using `supabase.auth.admin.inviteUserByEmail()`.

  

#### Function Purpose

  

The `inviteUserByEmail()` method sends an invite link to a user's email address. It is typically used by administrators to invite users to join the application.

  

The correct code snippet is:

  

```javascript

const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

```

  

#### PKCE Support

  

Note that PKCE is not supported when using `inviteUserByEmail()`. This is because the browser initiating the invite is often different from the browser accepting the invite, which makes it difficult to provide the security guarantees required of the PKCE flow.

  

#### Parameters

  

The `inviteUserByEmail()` method accepts the following parameters:

  

* `email` (required string): The email address of the user to invite.

* `options` (optional object): An object containing additional options. Currently, no options are defined in the Supabase documentation.

  

#### Response Object

  

The `inviteUserByEmail()` method returns a response object with the following structure:

  

```json

{

"data": {

"user": {

"id": "11111111-1111-1111-1111-111111111111",

"aud": "authenticated",

"role": "authenticated",

"email": "example@email.com",

"invited_at": "2024-01-01T00:00:00Z",

"phone": "",

"confirmation_sent_at": "2024-01-01T00:00:00Z",

"app_metadata": {

"provider": "email",

"providers": [

"email"

]

},

"user_metadata": {},

"identities": [

{

"identity_id": "22222222-2222-2222-2222-222222222222",

"id": "11111111-1111-1111-1111-111111111111",

"user_id": "11111111-1111-1111-1111-111111111111",

"identity_data": {

"email": "example@email.com",

"email_verified": false,

"phone_verified": false,

"sub": "11111111-1111-1111-1111-111111111111"

},

"provider": "email",

"last_sign_in_at": "2024-01-01T00:00:00Z",

"created_at": "2024-01-01T00:00:00Z",

"updated_at": "2024-01-01T00:00:00Z",

"email": "example@email.com"

}

],

"created_at": "2024-01-01T00:00:00Z",

"updated_at": "2024-01-01T00:00:00Z",

"is_anonymous": false

}

},

"error": null

}

```

  

* `data`: Contains the user object.

* `user`: An object containing information about the invited user.

* `id`: The unique ID of the user.

* `aud`: The audience for the user (typically "authenticated").

* `role`: The role of the user (typically "authenticated").

* `email`: The email address of the user.

* `invited_at`: The timestamp when the invitation was sent.

* `phone`: The phone number of the user (empty string if not provided).

* `confirmation_sent_at`: The timestamp when the confirmation email was sent.

* `app_metadata`: Application-specific metadata.

* `provider`: The authentication provider used (typically "email").

* `providers`: An array of authentication providers used (typically "email"]).

* `user_metadata`: User-specific metadata (can be empty).

* `identities`: An array of identity objects.

* `identity_id`: The unique ID of the identity.

* `id`: The ID of the user.

* `user_id`: The ID of the user.

* `identity_data`: Identity-specific data.

* `email`: The email address of the user.

* `email_verified`: A boolean indicating whether the email address has been verified.

* `phone_verified`: A boolean indicating whether the phone number has been verified.

* `sub`: The subject (user ID).

* `provider`: The authentication provider used (typically "email").

* `last_sign_in_at`: The timestamp of the last sign-in.

* `created_at`: The timestamp when the identity was created.

* `updated_at`: The timestamp when the identity was updated.

* `email`: The email address of the user.

* `created_at`: The timestamp when the user was created.

* `updated_at`: The timestamp when the user was updated.

* `is_anonymous`: A boolean indicating whether the user is anonymous.

* `error`: An object containing any errors that occurred during the invitation process. If no errors occurred, this will be `null`.

  

#### Error Handling

  

It's important to handle potential errors returned in the `error` object. For example, the email address may already be in use, or the Supabase service may be unavailable.

  

#### a. Define Routes

  

```javascript

// backend/src/routes/invite.routes.js

const express = require('express');

const router = express.Router();

const inviteController = require('../controllers/invite.controller'); // Create this controller

  

router.post('/team/invite', inviteController.inviteTeamMember);

router.post('/tenant/invite', inviteController.inviteTenant);

router.post('/vendor/invite', inviteController.inviteVendor);

router.post('/owner/invite', inviteController.inviteOwner);

  

module.exports = router;

```

  

#### b. Create Controller Functions

  

Create a new controller file `backend/src/controllers/invite.controller.js` with the following functions:

  

```javascript

// backend/src/controllers/invite.controller.js

const { supabase } = require('../config/supabase');

  

const inviteUser = async (req, res) => {

try {

const { email } = req.body;

  

// ✅ Step 1: Invite a new user in Supabase auth

const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

  

if (error) {

console.error('Error inviting user:', error);

return res.status(500).json({ error: error.message });

}

  

return res.status(200).json({ message: "Invitation sent successfully", data });

} catch (error) {

console.error(error);

return res.status(500).json({ error: error.message });

}

};

  

exports.inviteTeamMember = async (req, res) => {

await inviteUser(req, res);

};

  

exports.inviteTenant = async (req, res) => {

await inviteUser(req, res);

};

  

exports.inviteVendor = async (req, res) => {

await inviteUser(req, res);

};

  

exports.inviteOwner = async (req, res) => {

await inviteUser(req, res);

};

```

  

#### c. Update `people.controller.js`

  

Remove the Supabase user creation from the `createTeamMember`, `createTenant`, `createVendor`, and `createOwner` functions in `backend/src/controllers/people.controller.js`. These functions should now only be responsible for adding the user's data to the database after they have signed up.

  

### 3. Data Models

  

Update the data models in `backend/src/services/people.service.js` to reflect the changes in the database schema.

  

#### a. Create `assignRole` function

  

Create a new function in `backend/src/services/people.service.js` to assign the role to the user.

  

```javascript

// backend/src/services/people.service.js

const { supabase } = require('../config/supabase');

  

async function assignRole(userId, role, organizationId) {

const { data: roleData, error: roleError } = await supabase

.from('roles')

.select('id')

.eq('name', role)

.single();

  

if (roleError) {

throw roleError;

}

  

if (!roleData) {

throw new Error(`Role ${role} not found`);

}

  

const { error: userRoleError } = await supabase

.from('user_roles')

.insert({

user_id: userId,

role_id: roleData.id,

organization_id: organizationId,

});

  

if (userRoleError) {

throw userRoleError;

}

  

return { success: true };

}

  

module.exports = {

// ... other functions

assignRole,

};

```

  

### 4. Testing

  

#### a. Test API Endpoints

  

Use `curl` commands to test the new API endpoints:

  

```bash

curl -X POST http://localhost:5001/api/people/team/invite \

-H "Content-Type: application/json" \

-H "Authorization: Bearer YOUR_JWT_TOKEN" \

-d '{"email":"newteam@example.com"}'

```

  

```bash

curl -X POST http://localhost:5001/api/people/tenant/invite \

-H "Content-Type: application/json" \

-H "Authorization: Bearer YOUR_JWT_TOKEN" \

-d '{"email":"newtenant@example.com"}'

```

  

```bash

curl -X POST http://localhost:5001/api/people/vendor/invite \

-H "Content-Type: application/json" \

-H "Authorization: Bearer YOUR_JWT_TOKEN" \

-d '{"email":"newvendor@example.com"}'

```

  

```bash

curl -X POST http://localhost:5001/api/people/owner/invite \

-H "Content-Type: application/json" \

-H "Authorization: Bearer YOUR_JWT_TOKEN" \

-d '{"email":"newowner@example.com"}'

```

  

Test the new `/api/assign-role` endpoint:

  

```bash

curl -X POST http://localhost:5001/api/assign-role \

-H "Content-Type: application/json" \

-d '{"userId":"user-uuid", "role":"team_member", "organizationId":"org-uuid"}'

```

  

## Frontend Implementation

  

### 1. API Integration

  

Connect the new UI elements to the backend API.

  

#### a. Create API Functions

  

Create API functions to call the new backend endpoints.

  

## Files Affected

  

* `backend/src/routes/invite.routes.js`

* `backend/src/controllers/invite.controller.js`

* `backend/src/controllers/people.controller.js`

* `backend/src/controllers/user.controller.js`

* `backend/src/services/people.service.js`

* `backend/src/routes/user.routes.js`

* `frontend/src/components/InviteUserForm.tsx` (or similar)

* `frontend/src/contexts/AuthContext.tsx`

  

## Conclusion

  

This document provides a comprehensive guide to implementing the invitation feature for the PropEase application. By following these steps, developers can successfully integrate the new functionality and provide a seamless user experience.

  

## Supabase Email Templates Customization

  

To customize the email templates used by Supabase for user invitations, password resets, and other authentication-related emails, follow these steps:

  

1. **Access the Supabase Dashboard:** Navigate to your project in the Supabase dashboard at [https://supabase.com/dashboard](https://supabase.com/dashboard).

2. **Go to Auth > Templates:** In the left sidebar, find the "Auth" section and click on "Templates".

3. **Select the Template to Customize:** You'll see a list of available email templates, including:

* Confirm signup

* Invite user

* Magic Link

* Change Email Address

* Reset Password

  

Select the "Invite User" template to customize the invitation email.

  

4. **Edit the Template:** Use the built-in editor to modify the HTML and text content of the email template.

  

#### Available Template Variables

  

You can use the following dynamic variables in your templates:

  

* `{{ .ConfirmationURL }}`: The full authentication link users will click. For the invitation flow, this is the link the user will use to set their password and complete signup. Ensure this is present and correctly formatted.

* `{{ .Token }}`: A 6-digit OTP code for alternative verification (not applicable for the invitation flow).

* `{{ .TokenHash }}`: A hashed version of the token (useful for custom links).

* `{{ .SiteURL }}`: Your application's configured site URL (e.g., `http://localhost:5173`). Make sure this URL is correctly configured in your Supabase project settings under Auth > URL Configuration.

* `{{ .RedirectTo }}`: The redirect URL specified in your authentication call (not directly used in the invitation flow, but can be configured).

* `{{ .Data }}`: Contains user metadata for personalization.

  

#### Customization Options

  

Supabase uses Go Templates, allowing for conditional logic in your emails. For example:

  

```html

{{ if eq .Data.Domain "https://www.example.com" }}

{{ else if eq .Data.Domain "https://special.example.com" }}

{{ end }}

```

  

#### Important Considerations

  

1. **Email prefetching problems:** Some email providers (like Microsoft Defender) prefetch URLs, which can invalidate your confirmation links. Solutions:

* Include the OTP code `{{ .Token }}` as an alternative (not applicable for invitation flow).

* Create a two-step verification process with a custom link.

  

2. **Email tracking issues:** External email providers with tracking features can break your authentication links. Disable email tracking if using these services.

  

3. **Mobile deep linking:** For mobile apps, you'll need special configuration to handle deep links properly.

  

4. **Server-side handling:** If using server-side rendering, create custom links to properly process authentication on the server before redirecting to the client:



5. **Update the Site URL:**

* Go to Auth > URL Configuration in your Supabase dashboard.

* Add `http://localhost:5173` to the "Site URL" field.

* Add `http://localhost:5173/auth/confirm` and `http://localhost:5173/auth/update-password` to the "Redirect URLs" field.

  

6. **Update the signup function in `frontend/src/contexts/AuthContext.tsx`:**

  

```javascript

const signup = async (email: string, password: string, userData: any) => {

try {

setIsLoading(true);

const { data, error } = await supabase.auth.signUp({

email,

password,

options: {

emailRedirectTo: `${window.location.origin}/auth/update-password`,

},

});

  

if (error) throw error;

  

if (data.user) {

// Create a new profile for the user in the user_profiles table

const { error: profileError } = await supabase

.from('user_profiles')

.insert({

id: data.user.id,

email: email,

first_name: userData.firstName,

last_name: userData.lastName,

// Add other user data as needed

});

  

if (profileError) {

throw profileError;

}

  

// Assign the role to the user

const searchParams = new URLSearchParams(window.location.search);

const role = searchParams.get('role');

  

if (role) {

try {

const response = await fetch('/api/assign-role', { // You'll need to create this API endpoint

method: 'POST',

headers: {

'Content-Type': 'application/json',

},

body: JSON.stringify({

userId: data.user.id,

role: role,

organizationId: userProfile?.organization_id, // Assuming you have access to the organization ID here

}),

});

  

if (!response.ok) {

throw new Error(`HTTP error! status: ${response.status}`);

}

  

const assignRoleData = await response.json();

console.log('Role assigned successfully:', assignRoleData);

} catch (assignRoleError: any) {

console.error('Error assigning role:', assignRoleError);

toast.error(assignRoleError.message || 'Error assigning role');

}

}

}

  

toast.success('Account created successfully');

} catch (error) {

const authError = error as AuthError;

toast.error(authError.message || 'Error creating account');

throw error;

} finally {

setIsLoading(false);

}

};

```

  

7. **Files Affected**

  

* `backend/src/controllers/invite.controller.js`

* `frontend/src/contexts/AuthContext.tsx`

* Supabase project settings (Auth > URL Configuration)

* Supabase project settings (Auth > Templates)

  

By following these steps, you can customize the email templates used by Supabase for user invitations and ensure that they match your brand identity and function correctly.