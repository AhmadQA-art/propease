# Migration of Edge Functions to Production

This document provides instructions for migrating edge functions from development to the production environment.

## Prerequisites

- Supabase CLI installed (version 2.20.0 or later)
- Access to both development and production Supabase projects
- Production project created with database schema, triggers, and roles already migrated

## Migration Steps

1. **Ensure you have the latest functions code**
   
   Make sure your local repository has the latest edge functions code from development.

2. **Login to Supabase CLI**

   ```bash
   supabase login
   ```

3. **Gather production project information**

   Before running the migration script, you'll need:
   - Your production project ID (not the project name)
   - This ID is a 20-character alphanumeric string, which you can find in the project settings page

4. **Run the migration script**

   ```bash
   cd supabase/functions
   ./migrate-to-production.sh
   ```

   The script will:
   - Ask for your production project ID
   - Verify your Supabase login
   - Check the existence of the production project
   - List existing functions in production and offer to remove them
   - Deploy the shared module and all functions to production
   - Set necessary environment variables and secrets

5. **Provide required information**

   During the migration process, you'll need to provide:
   - Production Project ID
   - Whether to remove existing functions (if any)
   - INFOBIP_BASE_URL for production
   - INFOBIP_API_KEY for production
   - INFOBIP_WHATSAPP_NUMBER for production
   - Optional additional environment variables (API_URL, ANON_KEY, SERVICE_ROLE_KEY)

6. **Verify deployment**

   After the migration completes, verify that all functions are properly deployed:

   ```bash
   supabase functions list --project-ref <your-production-project-id>
   ```

7. **Test functions**

   Test the deployed functions to ensure they're working correctly:

   ```bash
   cd supabase/functions
   # Set environment variables for the production project
   export SUPABASE_URL="https://[your-production-project-id].supabase.co"
   export SUPABASE_ANON_KEY="your-production-anon-key"
   export SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"
   
   # Run tests against production
   ./test-runner.sh
   ```

## Function Descriptions

The following edge functions are migrated to production:

1. **shared** - Shared module with common utilities and database queries
2. **send-email** - Sends email notifications to users
3. **send-sms** - Sends SMS notifications to users
4. **send-whatsapp** - Sends WhatsApp messages to users
5. **send-announcement** - Initiates the announcement sending process
6. **process-announcement-batch** - Processes batches of announcements
7. **register-whatsapp-template** - Registers WhatsApp message templates
8. **check-schedules** - Checks for scheduled announcements
9. **whatsapp-webhook** - Handles WhatsApp webhook callbacks

## Environment Variables

Ensure the following environment variables are properly set in production:

- **INFOBIP_BASE_URL** - Base URL for the Infobip API
- **INFOBIP_API_KEY** - API key for Infobip
- **INFOBIP_WHATSAPP_NUMBER** - WhatsApp number for sending messages
- **API_URL** - URL of the Supabase API
- **ANON_KEY** - Anon key for Supabase
- **SERVICE_ROLE_KEY** - Service role key for Supabase

## Finding Your Project ID

1. Go to your Supabase dashboard (https://supabase.com/dashboard)
2. Select your production project
3. Go to Project Settings
4. The Project ID (Reference ID) is displayed at the top of the settings page
5. It should be a 20-character alphanumeric string, e.g., `abcdefghijklmnopqrst`

## Troubleshooting

If you encounter issues during migration, try the following:

1. **Check function logs**

   ```bash
   supabase functions logs --project-ref <your-production-project-id>
   ```

2. **Verify environment variables**

   ```bash
   supabase secrets list --project-ref <your-production-project-id>
   ```

3. **Redeploy individual functions**

   If a specific function fails to deploy, you can redeploy it individually:

   ```bash
   supabase functions deploy [function-name] --project-ref <your-production-project-id> --no-verify-jwt
   ```

4. **Check for errors in the functions code**

   Verify that the function code doesn't have any syntax errors or dependencies issues.

5. **Use the test-debug.js script**

   ```bash
   node test-debug.js
   ``` 