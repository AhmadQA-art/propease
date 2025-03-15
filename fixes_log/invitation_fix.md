### Debugging the "Invalid or Expired Invitation Token" Error in Your User Invitation Flow

You're encountering an issue in your Supabase-based application's user invitation flow where, after clicking the invitation link (e.g., `http://localhost:5173/auth/accept-invitation?token=...&email=...`), users are redirected to a password setup page but receive an "Invalid or expired invitation token" error. The console logs reveal a `403` error and a `Supabase verification error: AuthApiError: Token has expired or is invalid`. Below, I'll explain the root cause of this issue and provide a step-by-step solution to fix it based on your provided files.

---

### Root Cause

The error stems from a mismatch between the token sent in the invitation email and the token your application attempts to verify:

1. **Two Tokens in Play**:
   - In `invite.controller.js`, your `inviteUser` function generates a custom token (`token`) and stores it in the `organization_invitations` table.
   - You then call `supabase.auth.admin.inviteUserByEmail`, which generates its own Supabase-managed invitation token and sends an email with that token embedded in the link (via `{{ .TokenHash }}` in `invite-user.html`).

2. **Verification Mismatch**:
   - In `AcceptInvitation.tsx`, the frontend fetches `/api/invites/verify/${token}` to verify the token from the URL.
   - The backend (`invite.controller.js`, `verifyInvitation`) checks this token against the `organization_invitations` table, expecting it to match the custom token.
   - However, the token in the URL is the Supabase-generated token (`{{ .TokenHash }}`), not the custom token stored in your table, causing the verification to fail with a `404` (not found), which manifests as a `403` error and the "Invalid or expired invitation token" message.

3. **Current Flow Issue**:
   - Your application is bypassing Supabase's built-in invitation verification process by manually constructing the invitation link in the email template (`{{ .SiteURL }}/auth/accept-invitation?token={{ .TokenHash }}&email={{ .Email }}`) and verifying it against a custom token, rather than letting Supabase handle token validation and redirection.

---

### Solution

To resolve this, we'll align your invitation flow with Supabase's intended mechanism by:
- Using Supabase's `{{ .ConfirmationURL }}` in the email template to handle token verification automatically.
- Setting a `redirectTo` URL in `inviteUserByEmail` to redirect users to your password setup page after Supabase verifies the token.
- Updating the frontend to check the user's session (indicating successful verification) instead of manually verifying the token.

Here’s how to implement this:

---

#### Step 1: Update the Email Template (`invite-user.html`)

Replace the manually constructed link with `{{ .ConfirmationURL }}`, which Supabase generates to include token verification and redirection logic.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>You're Invited to Join PropEase</title>
  <style>
    /* Existing styles remain unchanged */
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="{{ .SiteURL }}/PropEase.png" alt="PropEase" height="40">
    </div>
    
    <div class="content">
      <h2>You're Invited to Join PropEase</h2>
      
      <p>Hello,</p>
      
      <p>You have been invited to join PropEase. To accept this invitation and set up your account, please click the button below:</p>
      
      <p style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>
      </p>
      
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      
      <p style="word-break: break-all; font-size: 12px;">
        {{ .ConfirmationURL }}
      </p>
      
      <p>This invitation link will expire in 24 hours.</p>
      
      <p>If you did not expect to receive this invitation, you can safely ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>© PropEase. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
```

**Why**: `{{ .ConfirmationURL }}` points to Supabase’s `/auth/v1/verify` endpoint (e.g., `/auth/v1/verify?token=...&type=invite&redirect_to=...`), which verifies the token and redirects the user to the specified `redirectTo` URL with a session established.

---

#### Step 2: Set `redirectTo` in `inviteUserByEmail` (`invite.controller.js`)

Update the `inviteUser` function to include a `redirectTo` option, pointing to your frontend’s `/auth/accept-invitation` page.

```javascript
const inviteUser = async (req, res, role) => {
  try {
    const { email } = req.body;
    const { id: inviterId, organization_id } = req.user;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!organization_id) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    // Check if user with this email already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', userCheckError);
      return res.status(500).json({ error: 'Error checking for existing user' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError) {
      console.error('Error getting role:', roleError);
      return res.status(500).json({ error: 'Error getting role' });
    }

    if (!roleData) {
      return res.status(404).json({ error: `Role ${role} not found` });
    }

    // Generate expiration timestamp (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Generate a unique token (optional, if still needed for custom logic)
    const token = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .insert({
        email,
        organization_id,
        role_id: roleData.id,
        invited_by: inviterId,
        status: 'pending',
        token, // This can be removed if not needed
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return res.status(500).json({ error: 'Error creating invitation' });
    }

    // Send invitation email using Supabase with redirectTo
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/accept-invitation`, // e.g., http://localhost:5173/auth/accept-invitation
      data: {
        invitation_id: invitation.id,
        organization_id,
        role
      }
    });

    if (error) {
      console.error('Error inviting user:', error);
      await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitation.id);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: "Invitation sent successfully",
      invitation: {
        id: invitation.id,
        email,
        expires_at: invitation.expires_at,
        status: invitation.status
      }
    });
  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({ error: error.message });
  }
};
```

**Notes**:
- Define `FRONTEND_URL` in your environment variables (e.g., `http://localhost:5173` for development).
- The `token` field in `organization_invitations` is now optional since Supabase handles token verification. You might retain it for custom logic or remove it if unused.

---

#### Step 3: Update Frontend Logic (`AcceptInvitation.tsx`)

Modify `AcceptInvitation.tsx` to:
- Check the user’s session instead of manually verifying the token.
- Use the session’s user data (e.g., email) to fetch invitation details and prompt for password setup.

```javascript
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase/client';
import { toast } from 'react-hot-toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email'); // Optional, for pre-filling
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('');
  
  const { user } = useAuth(); // Get authenticated user from context
  const navigate = useNavigate();

  // Check session and fetch invitation details on mount
  useEffect(() => {
    const checkSessionAndInvitation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        setError('Invalid or expired invitation link. Please contact your administrator.');
        setIsVerifying(false);
        return;
      }

      const userEmail = session.user.email;

      try {
        // Fetch invitation details based on email
        const { data: invitation, error: invitationError } = await supabase
          .from('organization_invitations')
          .select('id, organization_id, role_id')
          .eq('email', userEmail)
          .eq('status', 'pending')
          .single();

        if (invitationError || !invitation) {
          setError('No valid invitation found. Please contact your administrator.');
          setIsVerifying(false);
          return;
        }

        // Get organization name
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', invitation.organization_id)
          .single();
          
        if (!orgError && orgData) {
          setOrganizationName(orgData.name);
        }
        
        // Get role name
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('name')
          .eq('id', invitation.role_id)
          .single();
          
        if (!roleError && roleData) {
          setRole(roleData.name);
        }
        
        setInvitationValid(true);
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setError('Error verifying invitation. Please try again or contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    checkSessionAndInvitation();
  }, []);

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
      // Set the user's password
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Update user profile with name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName
          }, { onConflict: 'id' });

        if (profileError) throw profileError;

        // Assign role and update invitation status
        const { data: invitation } = await supabase
          .from('organization_invitations')
          .select('id, organization_id, role_id')
          .eq('email', user.email)
          .eq('status', 'pending')
          .single();

        if (invitation) {
          const { data: roleData } = await supabase
            .from('roles')
            .select('name')
            .eq('id', invitation.role_id)
            .single();

          await fetch('/api/users/assign-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              role: roleData.name,
              organizationId: invitation.organization_id
            }),
          });

          await supabase
            .from('organization_invitations')
            .update({ status: 'accepted' })
            .eq('id', invitation.id);
        }
      }

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(error.message || 'An error occurred while creating your account.');
      toast.error(error.message || 'An error occurred while creating your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedRoleName = (roleName) => {
    if (!roleName) return '';
    return roleName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    // Same JSX as before, unchanged for brevity
    // Ensure email input uses user?.email if available, or emailFromUrl
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src="/PropEase.png" alt="PropEase" className="h-12 mx-auto" />
        </div>

        {isVerifying ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3539] mb-4"></div>
              <p className="text-[#6B7280]">Verifying your invitation...</p>
            </div>
          </div>
        ) : (
          <>
            {!invitationValid ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error || 'Invalid invitation link.'}
                </div>
                <div className="text-center mt-4">
                  <Link to="/login" className="text-sm text-[#2C3539] hover:underline">
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-[#2C3539]">Accept Invitation</h1>
                  <p className="text-[#6B7280] mt-1">
                    You've been invited to join <strong>{organizationName}</strong> as a <strong>{getFormattedRoleName(role)}</strong>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || emailFromUrl || ''}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Rest of the form remains unchanged */}
                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="Create a password (min. 8 characters)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C3539] hover:bg-[#3d474c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </div>
            )}

            <p className="mt-4 text-center text-[#6B7280]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2C3539] hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
```

**Key Changes**:
- Removed the manual token verification (`fetch(/api/invites/verify/${token})`) since Supabase handles it.
- Check the session with `supabase.auth.getSession()` to confirm the user is signed in (post-verification).
- Use `supabase.auth.updateUser({ password })` to set the password, as the user is already authenticated.
- Fetch invitation details using the authenticated user’s email and assign roles accordingly.

---

#### Step 4: Update `AuthContext.tsx` (Optional Simplification)

Since the invitation acceptance now relies on Supabase’s flow, you can simplify the `acceptInvitation` function or remove it if unused. For consistency, here’s an updated version if you still need it:

```javascript
const acceptInvitation = async (email, password) => {
  try {
    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;

    toast.success('Account activated successfully');
  } catch (error) {
    const authError = error;
    toast.error(authError.message || 'Error accepting invitation');
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

However, since `handleSubmit` in `AcceptInvitation.tsx` now handles this, you might not need `acceptInvitation` unless it’s used elsewhere.

---

### How It Works Now

1. **Invitation Sent**:
   - `inviteUser` calls `inviteUserByEmail` with `redirectTo: http://localhost:5173/auth/accept-invitation`.
   - Supabase sends an email with a link like `/auth/v1/verify?token=...&type=invite&redirect_to=...`.

2. **User Clicks Link**:
   - Supabase verifies the token and signs the user in with a temporary session.
   - The user is redirected to `http://localhost:5173/auth/accept-invitation`.

3. **Password Setup**:
   - `AcceptInvitation.tsx` detects the session, confirms the invitation, and prompts for a password.
   - The password is set with `updateUser`, and roles are assigned based on the `organization_invitations` record.

---

### Testing

- **Environment**: Set `FRONTEND_URL=http://localhost:5173` in your backend `.env`.
- **Steps**:
  1. Send an invitation via your backend.
  2. Click the link in the email.
  3. Verify you’re redirected to the password setup page without the token error.
  4. Set a password and check if the role is assigned correctly.

---

### Conclusion

The "Invalid or expired invitation token" error occurred because your application was trying to verify Supabase’s token against a custom token in `organization_invitations`. By leveraging Supabase’s `{{ .ConfirmationURL }}` and `redirectTo`, you let Supabase handle token verification, ensuring a seamless flow to the password setup page. This solution eliminates the mismatch and aligns with Supabase’s authentication system.