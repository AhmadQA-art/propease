### Solution to "No valid invitation found" Error in Team Member Addition Flow

When a user attempts to accept an invitation via the email link in your application, they encounter the error: **"No valid invitation found. Please contact your administrator."** Additionally, the browser console logs a **400 status code**, indicating a bad request. You've identified two main issues: a **token verification mismatch** and a **strict status check**. Let's resolve this step-by-step by analyzing the current flow, identifying the root causes, and implementing fixes in the provided files: `AcceptInvitation.tsx`, `invite.controller.js`, and `invite.routes.js`.

---

### Understanding the Current Flow

1. **Invitation Creation (`invite.controller.js` - `inviteUser`)**:
   - An admin invites a user by providing their email (and optionally `jobTitle` and `department` for team members).
   - A unique `token` is generated using `crypto.randomBytes(20).toString('hex')`.
   - An entry is created in the `organization_invitations` table with fields like `email`, `token`, `status: 'pending'`, and `expires_at`.
   - An invitation email is sent with a redirect URL: `/auth/accept-invitation?token=${token}`.

2. **Invitation Acceptance (`AcceptInvitation.tsx`)**:
   - The user clicks the email link, landing on the `AcceptInvitation` page.
   - The frontend uses Supabase to verify the invitation by querying the `organization_invitations` table directly, matching the session user's `email` and `status: 'pending'`.
   - If no matching invitation is found, it displays the error: "No valid invitation found."

3. **Backend Verification (`invite.controller.js` - `verifyInvitation`)**:
   - The backend provides a `/invite/verify/:token` endpoint that expects a `token` in the URL parameters and an `email` in the query parameters.
   - It queries the `organization_invitations` table but currently only filters by `email` and `status: 'pending'`, not the `token`.

---

### Root Causes of the Error

1. **Token Verification Mismatch**:
   - **Frontend**: `AcceptInvitation.tsx` doesn't use the `token` from the URL (available via `searchParams.get('token')`). Instead, it queries the database directly using only the session user's `email`.
   - **Backend**: The `verifyInvitation` function expects both a `token` and `email` but doesn't validate the `token` against the database record. This mismatch means the frontend isn't leveraging the backend's intended verification logic, which should use the `token` for specificity.
   - **Impact**: If multiple pending invitations exist for the same email, the frontend's query might fail to identify the correct one, or it might miss the invitation entirely if the token isn't considered.

2. **Strict Status Check**:
   - Both the frontend and backend only look for invitations with `status: 'pending'`. If the status has changed (e.g., expired or already accepted) or if the email doesn't match exactly, the invitation won't be found.
   - Additionally, the backend checks for expiration (`expires_at`), but the frontend doesn't, leading to inconsistent validation.

3. **400 Status Code**:
   - The console error suggests a request to the backend (likely `/invite/verify/:token`) is failing with a 400 status. This could occur if:
     - The `token` or `email` is missing in the request.
     - The invitation is expired or not found, triggering a 400 or 404 response that the frontend interprets as an error.

---

### Proposed Solution

To fix this, we'll:
- Update the frontend (`AcceptInvitation.tsx`) to use the `token` from the URL and call the backend's `verifyInvitation` endpoint instead of querying Supabase directly.
- Enhance the backend (`invite.controller.js` - `verifyInvitation`) to validate the `token` alongside the `email` and `status`.
- Ensure the invitation data is consistently used throughout the acceptance process.

---

#### Step 1: Update `AcceptInvitation.tsx`

The frontend should retrieve the `token` from the URL and use it to verify the invitation via the backend endpoint. Here's the modified code:

```typescript
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase/client';
import { toast } from 'react-hot-toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email'); // Optional, for pre-filling
  const token = searchParams.get('token'); // Get token from URL

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('');
  const [invitationData, setInvitationData] = useState(null); // Store invitation details

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndInvitation = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setError('Invalid or expired invitation link. Please contact your administrator.');
        setIsVerifying(false);
        return;
      }

      const userEmail = session.user.email;

      if (!token) {
        setError('Missing invitation token. Please check your invitation link.');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify invitation via backend endpoint
        const response = await fetch(`/api/invite/verify/${token}?email=${encodeURIComponent(userEmail)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add auth headers if required by your backend
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'No valid invitation found. Please contact your administrator.');
          setIsVerifying(false);
          return;
        }

        const { invitation } = await response.json();
        setInvitationData(invitation); // Store invitation data
        setOrganizationName(invitation.organization_name);
        setRole(invitation.role);
        setInvitationValid(true);
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setError('Error verifying invitation. Please try again or contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    checkSessionAndInvitation();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!firstName || !lastName) {
      setError('Please provide your name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError || !user) throw new Error('No authenticated user found');

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          organization_id: invitationData.organization_id,
          phone: phone,
        }, { onConflict: 'id' });
      if (profileError) throw profileError;

      // Fetch role information
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', invitationData.role_id)
        .single();
      if (roleError) throw roleError;

      // Assign role via API
      const roleResponse = await fetch('/api/users/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: roleData.name,
          organizationId: invitationData.organization_id,
        }),
      });
      if (!roleResponse.ok) {
        const errorData = await roleResponse.json();
        throw new Error(`Role assignment failed: ${errorData.error}`);
      }

      // Handle team member specifics
      if (roleData.name === 'team_member') {
        const metadata = user.user_metadata || {};
        const { error: teamMemberError } = await supabase
          .from('team_members')
          .insert({
            user_id: user.id,
            role_id: invitationData.role_id,
            job_title: metadata.job_title || null,
            department: metadata.department || null,
          });
        if (teamMemberError) throw teamMemberError;
      }

      // Update invitation status
      const { error: invitationUpdateError } = await supabase
        .from('organization_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationData.id);
      if (invitationUpdateError) console.error('Invitation update failed:', invitationUpdateError);

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(error.message || 'An error occurred while creating your account.');
      toast.error(error.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of the component (render logic) remains unchanged
  // ...
}
```

**Key Changes**:
- Added `const token = searchParams.get('token')` to retrieve the token from the URL.
- Replaced the direct Supabase query in `useEffect` with a `fetch` call to `/api/invite/verify/:token?email=${userEmail}`.
- Added `invitationData` state to store the verified invitation details (e.g., `id`, `organization_id`, `role_id`).
- Updated `handleSubmit` to use `invitationData.id` instead of re-fetching the invitation, ensuring consistency.

**Notes**:
- Replace `/api/invite/verify/` with the correct API base URL if your backend runs on a different domain or port (e.g., `http://localhost:5000/api/invite/verify/`).
- Add authentication headers to the `fetch` call if your backend requires it.

---

#### Step 2: Update `invite.controller.js` - `verifyInvitation`

The backend should validate the `token` to ensure the correct invitation is matched. Here's the updated function:

```javascript
const verifyInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { email } = req.query;

    console.log('[VERIFY] Verifying invitation:', { token, email });

    if (!token || !email) {
      console.log('[VERIFY] Error: Token and email are required');
      return res.status(400).json({ error: 'Token and email are required' });
    }

    // Fetch invitation by both token and email
    console.log(`[VERIFY] Looking for invitation with token: ${token} and email: ${email}`);
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (
          name
        ),
        roles (
          name
        )
      `)
      .eq('token', token)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      console.error('[VERIFY] Error getting invitation:', invitationError);
      return res.status(404).json({ error: 'No valid invitation found' });
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      console.log('[VERIFY] Invitation has expired');
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    console.log('[VERIFY] Invitation is valid');
    return res.status(200).json({
      message: 'Invitation is valid',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        organization_id: invitation.organization_id,
        organization_name: invitation.organizations?.name || '',
        role_id: invitation.role_id,
        role: invitation.roles?.name || '',
      },
    });
  } catch (error) {
    console.error('[VERIFY] Verification error:', error);
    return res.status(500).json({ 
      error: 'Error verifying invitation',
      details: error.message,
    });
  }
};
```

**Key Changes**:
- Added `.eq('token', token)` to the Supabase query to match the invitation by both `token` and `email`.
- Updated error message to "No valid invitation found" for clarity.
- Kept the expiration check to ensure only valid invitations are accepted.

---

#### Step 3: Verify `invite.routes.js`

The route is already correctly set up:

```javascript
router.get('/verify/:token', inviteController.verifyInvitation);
```

Ensure that:
- The router is mounted at `/api/invite` in your Express app (e.g., `app.use('/api/invite', inviteRoutes)`).
- The backend server is running and accessible from the frontend.

---

### Additional Debugging Tips

If the issue persists:
1. **Log the URL**: In `AcceptInvitation.tsx`, add `console.log(window.location.href)` to verify the `token` is present in the URL.
2. **Check Backend Response**: Add `console.log(await response.text())` in the `fetch` error block to see the exact error message.
3. **Database Check**: Query the `organization_invitations` table manually to confirm the invitation exists with the expected `token`, `email`, and `status: 'pending'`.
4. **CORS/Port Issues**: Ensure the frontend's `fetch` URL matches your backend's address (e.g., adjust for `localhost:5000` if needed).

---

### Why This Fixes the Problem

- **Token Verification**: Using the `token` ensures the frontend and backend target the exact invitation, resolving the mismatch and handling cases with multiple invitations for the same email.
- **Status Check**: The backend's validation (token, email, status, and expiration) is more robust than the frontend's direct query, reducing false negatives.
- **400 Error**: By passing both `token` and `email` correctly, the backend won't reject the request due to missing parameters.

Apply these changes, test the flow, and the "No valid invitation found" error should be resolved!