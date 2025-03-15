# Supabase Email Templates

This directory contains the custom email templates for the Supabase authentication system.

## Templates

- `reset-password.html`: Email template for password reset requests
- `invite-user.html`: Email template for organization invitations

## How to Use

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Email Templates
3. Select the desired template (Reset Password or Invite User)
4. Replace the default template with the content from the corresponding HTML file
5. Save the changes

## Template Variables

Supabase provides several variables that can be used in email templates:

- `{{ .SiteURL }}`: The URL of your site
- `{{ .TokenHash }}`: The token hash for verification
- `{{ .Token }}`: The actual token (use with caution)
- `{{ .Email }}`: The user's email address

## Important Notes

- The reset password flow uses the PKCE (Proof Key for Code Exchange) flow for secure authentication
- The token verification happens at the `/auth/confirm` endpoint
- After verification, the user is redirected to `/auth/update-password` to set a new password
- For invitation emails, users are directed to `/auth/accept-invitation` to create their account
- Invitation tokens expire after 24 hours

## Security Considerations

- Ensure your site URL is properly configured in Supabase Auth > URL Configuration
- Add all necessary redirect URLs to the allowed list in Supabase
  - `http://localhost:5173/auth/confirm`
  - `http://localhost:5173/auth/update-password`
  - `http://localhost:5173/auth/accept-invitation`
- Email clients may preload links in emails which could invalidate tokens
- Some email tracking systems can break authentication links

For more information on Supabase email templates, see the [official documentation](https://supabase.com/docs/guides/auth/auth-email-templates). 