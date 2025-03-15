### Resetting a password[#](https://supabase.com/docs/guides/auth/passwords?queryGroups=language&language=js&queryGroups=flow&flow=pkce&queryGroups=framework&framework=express#resetting-a-password)

PKCE flow

The PKCE flow allows for server-side authentication. Unlike the implicit flow, which directly provides your app with the access token after the user clicks the confirmation link, the PKCE flow requires an intermediate token exchange step before you can get the access token.

##### Step 1: Update reset password email

Update your reset password email template to send the token hash. See [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates) for how to configure your email templates.

Your signup email template should contain the following HTML:

```
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/account/update-password"
    >Reset Password</a
  >
</p>

```

##### Step 2: Create token exchange endpoint

Create an API endpoint at `<YOUR_SITE_URL>/auth/confirm` to handle the token exchange.

Make sure you're using the right `supabase` client in the following code.

If you're not using Server-Side Rendering or cookie-based Auth, you can directly use the `createClient` from `@supabase/supabase-js`. If you're using Server-Side Rendering, see the [Server-Side Auth guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client) for instructions on creating your Supabase client.


Create a new route in your express app and populate with the following:

```
// The client you created from the Server-Side Auth instructions
const { createClient } = require("./lib/supabase")
...
app.get("/auth/confirm", async function (req, res) {
  const token_hash = req.query.token_hash
  const type = req.query.type
  const next = req.query.next ?? "/"

  if (token_hash && type) {
    const supabase = createClient({ req, res })
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      res.redirect(303, `/${next.slice(1)}`)
    }
  }

  // return the user to an error page with some instructions
  res.redirect(303, '/auth/auth-code-error')
})
```

##### Step 3: Call the reset password by email function to initiate the flow

JavaScript

```
async function resetPassword() {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
}

```
Once you have a session, collect the user's new password and call `updateUser` to update their password.

JavaScript

```
await supabase.auth.updateUser({ password: new_password })

```

### Files to Remove (Duplicates/Unused)

The following files should be removed as they are either duplicates or unused:
1. `frontend/src/components/ProtectedRoute.tsx` (duplicate of AuthRoute.tsx)
2. `backend/src/middleware/auth.js` (duplicate of auth.middleware.js)
3. `backend/src/routes/auth.routes.js` (duplicate in netlify functions)
4. `backend/src/controllers/auth.controller.js` (duplicate in netlify functions)
5. `backend/src/routes/invite.routes.js` (duplicate in netlify functions)

### Implementing Forgot Password Feature

##### Step 1: Create ForgotPassword Component

Create a new component for the forgot password page:

```typescript:frontend/src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      navigate('/login', { 
        state: { message: 'Check your email for password reset instructions' }
      });
    } catch (error) {
      console.error('Reset password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/PropEase.png" alt="PropEase" className="h-12 mx-auto" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#2C3539]">Reset Password</h1>
            <p className="text-[#6B7280] mt-1">
              Enter your email to receive reset instructions
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C3539] hover:bg-[#3d474c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539] disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

##### Step 2: Update Login Component

Update the "Forgot password?" link in your Login component:

```typescript:frontend/src/pages/auth/Login.tsx
// Add Link import if not already present
import { Link } from 'react-router-dom';

// Add this to your login form JSX
<Link 
  to="/auth/forgot-password" 
  className="text-sm text-[#2C3539] hover:underline"
>
  Forgot password?
</Link>
```

##### Step 3: Update App Routes

Add the forgot password route to your App.tsx:

```typescript:frontend/src/App.tsx
<Routes>
  {/* Public Routes */}
  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
  {/* ... other routes ... */}
</Routes>
```

### Supabase Password Reset Flow

The password reset flow uses Supabase's built-in functionality:

1. User requests password reset by entering their email
2. Supabase sends a magic link to the user's email
3. User clicks the link and is redirected to your app
4. Your app verifies the token and allows the user to set a new password

The reset password functionality is already implemented in your AuthContext:

```typescript:frontend/src/contexts/AuthContext.tsx
const resetPassword = async (email: string) => {
  try {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    toast.success('Password reset instructions sent to your email');
  } catch (error) {
    toast.error('Error sending password reset email');
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

This implementation follows the PKCE flow and integrates with your existing authentication system. The flow is secure and handles the password reset process through Supabase's authentication system.