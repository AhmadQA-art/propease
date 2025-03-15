### Key Points
- It seems likely that adding users by invitation in Supabase involves using the `inviteUserByEmail` function to send an invite link, which users click to accept.
- The email template can be customized in the Supabase dashboard under "Auth" > "Templates," using variables like `{{ .SiteURL }}` and `{{ .ConfirmationURL }}`.
- API endpoints likely include `/auth/v1/invite` for sending invites and `/auth/v1/verify` for token verification, handled by the JavaScript library.
- Front-end verification involves extracting the token from the URL and using `verifyOtp` with type 'invite' to complete the process.
- An unexpected detail is that invite links and OTPs expire after 24 hours by default, which may affect user experience.

---

### Direct Answer

#### Overview
Adding users by invitation in Supabase is a straightforward process for administrators to manage user access. Here's how it works, including customizing the email, API endpoints, and front-end token verification.

#### Inviting Users and Email Template
To invite a user, use the `inviteUserByEmail` function from Supabase's JavaScript auth admin library. For example:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-project-id.supabase.co', 'your-anon-key');
const { data, error } = await supabase.auth.admin.inviteUserByEmail('user@example.com');
```

The email sent to the user can be customized in the Supabase dashboard. Go to "Auth" > "Templates" and edit the "Invite user" template. You can personalize it using variables like `{{ .SiteURL }}` for your app's URL and `{{ .ConfirmationURL }}` for the invite link. For instance, you might create an email like:

```
Hi {{ .Data.name }},

You've been invited to join our platform! Click [here]({{ .ConfirmationURL }}) to accept.

Best regards,
Your Company
```

#### API Endpoints
While the JavaScript library handles the details, the underlying API endpoints are likely:
- **Sending Invites:** A POST request to `/auth/v1/invite`.
- **Verifying Tokens:** A POST request to `/auth/v1/verify`, used by `verifyOtp`.

These are managed by the library, so you don't need to interact with them directly for most cases.

#### Front-End Token Verification
When a user clicks the invite link, it includes a token in the URL (e.g., `https://yourapp.com/accept?token=some_token`). In the front end, extract this token and use `verifyOtp` to verify it. Here's an example in React:

```javascript
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';

function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleAccept = async () => {
    try {
      const { error } = await supabase.auth.verifyOtp({ token, type: 'invite' });
      if (error) {
        console.error('Error accepting invite:', error);
      } else {
        window.location.href = '/dashboard'; // Redirect after success
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleAccept}>Accept Invite</button>
    </div>
  );
}
```

This verifies the invitation and logs the user in, completing their registration.

#### Important Notes
- Invite links and OTPs expire after 24 hours by default, so users must act promptly.
- Ensure your email template is well-formatted to avoid delivery issues, and handle errors gracefully in both admin and front-end code.

For more details, check the official documentation at [Supabase Auth Admin](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail) and [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates).

---

### Survey Note: Detailed Guide on Adding Users by Invitation in Supabase

This comprehensive guide explores the process of adding users by invitation in Supabase, covering the email template customization, API endpoints, and front-end token verification. It builds on the direct answer, providing a detailed, professional analysis for developers seeking a thorough understanding.

#### Introduction to Supabase and Its Invitation System

Supabase is an open-source backend-as-a-service platform that integrates a PostgreSQL database with authentication, storage, and real-time capabilities. Its authentication system, built on a fork of Netlify's GoTrue, supports various methods, including inviting users via email. This feature is ideal for controlled user onboarding, such as in enterprise applications or collaborative platforms, where administrators need to manage access.

The invitation process involves sending an email with a link that users click to accept, triggering account creation or login. This guide will detail each step, ensuring clarity for developers at all levels.

#### Setting Up the Invitation Process with `inviteUserByEmail`

The core function for inviting users is `inviteUserByEmail`, part of Supabase's JavaScript auth admin library. This function is designed for administrative use and requires a service role key, emphasizing its server-side execution for security. The function takes two parameters:

- `email`: A required string for the user's email address.
- `options`: A required object for additional settings, such as metadata.

Here’s an example implementation:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-project-id.supabase.co', 'your-service-role-key');
const { data, error } = await supabase.auth.admin.inviteUserByEmail('user@example.com', {
  data: { role: 'editor' }, // Example metadata
});
```

If an error occurs, such as an invalid email or existing user, it will be returned in the `error` object. Developers should handle these cases, perhaps by notifying the administrator or logging the issue.

A notable consideration is that PKCE (Proof Key for Code Exchange) is not supported for `inviteUserByEmail` due to potential browser differences between initiating and accepting invites, which could affect security guarantees. This is particularly relevant for applications relying on OAuth flows.

#### Customizing the Email Template for Invitations

Supabase allows customization of email templates to align with your brand and improve user experience. For hosted projects, access the "Email Templates" page in the Supabase dashboard under "Auth" > "Templates." For self-hosted or local development, edit configuration files, such as `config.toml`.

The "Invite user" template can be personalized using variables, as shown in the following table:

| Variable        | Description                                                  |
|-----------------|--------------------------------------------------------------|
| `{{ .SiteURL }}` | Your application's Site URL, configurable in auth settings.  |
| `{{ .RedirectTo }}` | Redirect URL from `inviteUserByEmail`, set in auth settings. |
| `{{ .Data }}`    | Metadata from `auth.users.user_metadata` for personalization. |

An example customized template might look like:

```
Subject: Invitation to Join Our Platform

Hi {{ .Data.name }},

You've been invited to join [Your Company Name] at [Site URL]({{ .SiteURL }}). Click [this link]({{ .ConfirmationURL }}) to accept the invitation and set up your account.

Best regards,
The [Your Company Name] Team
```

For email providers with spam detection (e.g., Microsoft Defender's Safe Links), which may prefetch URLs, consider using an email OTP instead by including `{{ .Token }}` and creating a custom link for user confirmation. This guards against "Token has expired or is invalid" errors.

#### Understanding the API Endpoints Involved

While Supabase's JavaScript library abstracts much of the complexity, understanding the underlying API endpoints is valuable for advanced integrations or debugging. Based on the documentation and analysis, the likely endpoints are:

- **Sending Invites:** The `inviteUserByEmail` function appears to make a POST request to `/auth/v1/invite`, passing the email and options. This endpoint is part of Supabase's auth server, built on GoTrue, and handles the email dispatch.
- **Verifying Tokens:** When accepting an invitation, the front end uses `verifyOtp` with type 'invite', which likely maps to a POST request to `/auth/v1/verify`. This endpoint validates the token and completes the user registration.

These endpoints are not directly documented in a single place for public use, but the JavaScript library's source code and Netlify's GoTrue repository suggest these paths. For most developers, using the library functions is recommended, as they handle authentication headers, error handling, and security measures like JWT validation.

#### Front-End Verification of the Token

The invitation process concludes when the user clicks the link in the email, which redirects them to your application with a token, typically in the URL query parameter (e.g., `https://yourapp.com/accept?token=some_token`). The front end must extract this token and verify it to complete the invitation.

The verification is handled by the `verifyOtp` method, with the type set to 'invite'. Here's a detailed example in a React application:

```javascript
import { useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-project-id.supabase.co', 'your-anon-key');

function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleAccept = async () => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token,
        type: 'invite',
      });
      if (error) {
        console.error('Error verifying invite:', error.message);
        // Handle error, e.g., show a user-friendly message
      } else {
        console.log('Invite accepted successfully:', data);
        // Redirect to dashboard or show success message
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      // Handle unexpected errors
    }
  };

  return (
    <div>
      <h2>Accept Invitation</h2>
      <p>Click the button below to accept the invitation and set up your account.</p>
      <button onClick={handleAccept}>Accept Invite</button>
    </div>
  );
}
```

This process logs the user in and creates their account if necessary. Note that the token is a one-time use OTP, and the link expires after 24 hours by default, as per Supabase's documentation on token expiration.

#### Best Practices and Considerations

To ensure a smooth invitation process, consider the following:

- **Email Deliverability:** Test the customized email template across different email clients to ensure compatibility. Some providers may prefetch links, potentially consuming the token; use `{{ .Token }}` for OTP-based verification in such cases.
- **Error Handling:** In both admin and front-end code, implement robust error handling. For example, if `inviteUserByEmail` fails due to an existing user, log the error and inform the administrator. In the front end, display user-friendly messages for expired or invalid tokens.
- **Security:** Handle tokens securely; avoid logging them or exposing them in client-side code. The `verifyOtp` call should be made server-side if possible for added security, though the library supports client-side use.
- **User Experience:** Consider the 24-hour expiration of invite links; notify users if they attempt to use an expired link, and provide an option to request a new invite if needed.
- **Edge Cases:** Handle scenarios like users with existing accounts or multiple invitations. The `verifyOtp` method will return appropriate errors, which you can use to guide the user (e.g., redirect to login if already registered).

This detailed guide ensures developers have all the information needed to implement and troubleshoot the invitation process in Supabase, aligning with best practices for security and user experience.

#### Key Citations
- [Supabase Documentation on inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail)
- [Supabase Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase auth verifyOtp Method](https://supabase.com/docs/reference/javascript/auth-verifyotp)