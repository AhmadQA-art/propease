To address the requirement of removing a team member's data from all three tables (`team_members`, `user_profiles`, and `auth.users`) to ensure they no longer have an active user account, we need to implement a solution that deletes the relevant records in the correct order and securely handles the user deletion.

---

### Understanding the Tables and Relationships

the application uses three key tables:

1. **`auth.users`**: Managed by Supabase, this table stores user authentication details, such as the user’s ID and login credentials.
2. **`user_profiles`**: Contains additional user information and has a foreign key `id` that references `auth.users (id)`.
3. **`team_members`**: Stores team-specific data and has a foreign key `user_id` that references `user_profiles (id)`.

Since `user_profiles.id` is the same as `auth.users.id` (due to the foreign key relationship), deleting a team member involves removing their records from all three tables. 

the foreign key constraints require us to delete records in a specific order to avoid violations:

- First, delete from `team_members` (which references `user_profiles`).
- Then, delete from `user_profiles` (which references `auth.users`).
- Finally, delete from `auth.users` to deactivate the user account.

Because `auth.users` is managed by Supabase’s authentication system, we must use Supabase’s admin API to delete the user, and this operation should be performed securely on the server-side using the service role key.

---

### Solution Overview

To meet your requirement, we’ll:

1. **Implement a server-side endpoint** to handle the deletion of records from all three tables securely.
2. **Update the client-side code** to call this new endpoint instead of directly interacting with Supabase for this operation.

Here’s how we’ll achieve this:

---

### Step 1: Backend Implementation

We’ll create a new route and controller method in your backend to handle the deletion process. This ensures that the Supabase admin API (which requires the service role key) is used securely and that all deletions are performed in the correct order.

#### Add a New Route

In your backend file `people.routes.js`, add a new DELETE route:

```javascript
const express = require('express');
const router = express.Router();
const peopleController = require('../controllers/people.controller');
const { authenticateToken } = require('../middleware/auth'); // Assuming you have authentication middleware

router.delete('/team-members/:id', authenticateToken, peopleController.deleteTeamMember);

module.exports = router;
```

- **`authenticateToken`**: This middleware ensures that only authorized users can delete team members. Adjust this based on your authentication setup.

#### Add the Controller Method

In `people.controller.js`, add the `deleteTeamMember` method. This method will:

- Fetch the `user_id` from `team_members`.
- Delete records from `team_members`, `user_profiles`, and `auth.users` in that order.
- Handle errors appropriately.

Assuming your Supabase client is configured in `../config/supabase` with the service role key, here’s the implementation:

```javascript
const { supabase } = require('../config/supabase');

async function deleteTeamMember(req, res) {
  try {
    const { id } = req.params;
    // const { user } = req; // Uncomment and use this if your middleware provides user info

    // TODO: Add permission check (e.g., ensure the requester is an admin or team owner)

    // Step 1: Fetch the user_id from team_members
    const { data: teamMember, error: fetchError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !teamMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    const userId = teamMember.user_id;

    // Step 2: Delete from team_members
    const { error: deleteTeamError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (deleteTeamError) {
      throw new Error(`Failed to delete team member: ${deleteTeamError.message}`);
    }

    // Step 3: Delete from user_profiles
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      throw new Error(`Failed to delete user profile: ${deleteProfileError.message}`);
    }

    // Step 4: Delete from auth.users using Supabase admin API
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      throw new Error(`Failed to delete user: ${deleteUserError.message}`);
    }

    return res.status(200).json({ message: 'Team member and associated user account deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}

module.exports = { deleteTeamMember };
```

**Key Notes:**

- **Supabase Configuration**: Ensure that `supabase` in `../config/supabase` is initialized with your Supabase URL and service role key (not the public anon key), as the admin API requires elevated privileges.
- **Error Handling**: Each step checks for errors and returns appropriate responses to the client.
- **Permissions**: You should add logic to verify that the requesting user has permission to delete team members (e.g., checking their role or team ownership). This depends on your application’s authorization logic.

---

### Step 2: Frontend Implementation

On the client-side, update the `deletePerson` method in `people.ts` to call the new backend endpoint instead of directly deleting from Supabase. This ensures that the secure server-side logic handles the full deletion process.

#### Create an API Helper (Optional)

If you don’t already have a centralized API client, you can create a helper function in `services/api/api.ts`:

```javascript
import { getAuthToken } from '../auth'; // Adjust based on how you manage auth tokens

export const apiDelete = async (url) => {
  const token = getAuthToken(); // Replace with your method to retrieve the auth token
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};
```

#### Update `deletePerson`

In `people.ts`, modify the `deletePerson` method for the `'team'` case:

```javascript
import { apiDelete } from '../api/api'; // Adjust the import path as needed

async function deletePerson(type, id) {
  switch (type) {
    case 'team':
      try {
        await apiDelete(`/api/people/team-members/${id}`);
        return;
      } catch (error) {
        console.error('Error deleting team member:', error);
        throw error;
      }
    // Other cases (e.g., 'tenant') remain unchanged
    default:
      throw new Error('Unknown type');
  }
}

export { deletePerson };
```

**Key Notes:**

- **URL**: Adjust `/api/people/team-members/${id}` to match your backend’s base URL and route structure (e.g., if your backend runs on a different domain or port).
- **Auth Token**: Ensure `getAuthToken` retrieves the correct authentication token (e.g., from local storage, context, or Supabase auth). This token must be valid and recognized by your backend’s `authenticateToken` middleware.

---

### Considerations

- **Permissions**: Implement authorization checks in the backend to ensure only authorized users (organiztion_admins or admins) can delete team members.
- **Other Tables**: If your schema includes additional tables referencing `user_profiles` or `team_members` (e.g., tasks or roles), you’ll need to extend the deletion logic to handle those records first.
- **Atomicity**: While Supabase doesn’t support client-side transactions across multiple tables, the server-side approach with sequential checks ensures data consistency. If stricter atomicity is needed, you could use a PostgreSQL transaction via a custom SQL query or stored procedure, executed through Supabase’s `rpc` method.
- **User Feedback**: Enhance the frontend to display success or error messages to the user based on the API response.