# Propease Edge Functions

This directory contains Supabase Edge Functions for the Propease platform, including functions for sending communications via various channels (email, SMS, WhatsApp).

## Overview

The main functions include:

- `send-email` - Send emails via Infobip
- `send-sms` - Send SMS messages via Infobip
- `send-whatsapp` - Send WhatsApp messages via Infobip
- `send-announcement` - Send announcements to tenants via multiple channels
- `process-announcement-batch` - Process batches of announcement messages in the background
- `check-schedules` - Cron job to check for scheduled announcements and process background tasks

## Setting Up Environment

To properly set up the environment for testing and deployment:

1. Run the setup script:
   ```bash
   chmod +x setup-environment.sh
   ./setup-environment.sh
   ```

2. Create a `.env` file with the following variables (the setup script will help with this):
   ```
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Infobip API Configuration
   INFOBIP_API_KEY=your_infobip_api_key
   INFOBIP_BASE_URL=your_infobip_base_url
   INFOBIP_WHATSAPP_NUMBER=your_whatsapp_number

   # Testing Configuration
   TEST_EMAIL=your_test_email
   TEST_PHONE_NUMBER=your_test_phone
   TEST_WHATSAPP_NUMBER=your_test_whatsapp
   TEST_ANNOUNCEMENT_ID=optional_test_announcement_id
   ```

3. Install dependencies for testing:
   ```bash
   npm install
   ```

## Configuring Supabase Edge Functions

When deploying to Supabase, you need to set environment secrets:

```bash
supabase secrets set API_URL=your_supabase_url
supabase secrets set SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set ANON_KEY=your_anon_key
supabase secrets set INFOBIP_API_KEY=your_infobip_api_key
supabase secrets set INFOBIP_BASE_URL=your_infobip_base_url
supabase secrets set INFOBIP_WHATSAPP_NUMBER=your_whatsapp_number
```

## Testing

### Debugging Environment Issues

If you're having issues with the functions, use the debug script:

```bash
node test-debug.js
```

### Testing the Infobip API Directly

To test if your Infobip API credentials are working correctly:

```bash
node test-infobip-api.js
```

### Testing Individual Functions

Test scripts are provided for each function:

```bash
# Test all functions
./test-runner.sh

# Test specific functions
./test-runner.sh email
./test-runner.sh sms
./test-runner.sh whatsapp
./test-runner.sh announcement  # Requires TEST_ANNOUNCEMENT_ID to be set
```

You can also use npm scripts:

```bash
npm test           # Run all tests
npm run test:email # Test email function
npm run test:sms   # Test SMS function
npm run test:whatsapp # Test WhatsApp function
npm run debug      # Run debug script
npm run test:api   # Test Infobip API directly
```

## Testing Results Summary

The edge functions have been successfully tested and are working correctly:

| Function       | Status | Notes                                  |
|----------------|--------|-----------------------------------------|
| send-email     | ✅    | Successfully sends emails in real mode  |
| send-sms       | ✅    | Successfully sends SMS messages         |
| send-whatsapp  | ✅    | Successfully sends WhatsApp messages    |
| announcement   | ❌    | Requires valid announcement ID in database |

### Debug Mode vs. Real Messages

The test scripts now support two modes of operation:

1. **Debug Mode (default)**: No actual messages are sent
   ```bash
   ./test-runner.sh
   ```

2. **Real Message Mode**: Sends actual messages to recipients
   ```bash
   ./test-runner.sh --real
   ```

Individual functions can also be tested in real mode:
```bash
node test-send-email.js --real
node test-send-sms.js --real
node test-send-whatsapp.js --real
```

### Fixed Issues:

1. **Debug Flag Implementation**: Added debug mode to all functions to allow testing without sending real messages
2. **Environment Variables**: Correctly set in both local `.env` file and Supabase secrets
3. **Import Paths**: Updated all imports to use `../shared/infobip.ts` format
4. **WhatsApp Parameters**: Fixed parameter names (`to`, `templateName`, `placeholders`)
5. **Test Scripts**: Updated all test scripts to use correct URLs and credentials

For complete testing instructions, see [TEST_PLAN.md](./TEST_PLAN.md).

## Common Errors and Solutions

### 500 Internal Server Error

If all functions return 500 errors, check:

1. **Environment Variables**: Make sure all required environment variables are set.
   ```bash
   supabase functions env list
   ```

2. **Infobip API Credentials**: Verify your Infobip credentials are correct by running:
   ```bash
   npm run test:api
   ```

3. **Deployment Status**: Ensure functions are properly deployed:
   ```bash
   supabase functions list
   ```

### Messages Not Being Delivered

If WhatsApp or SMS messages are not being delivered:

1. **Phone Number Format**: Infobip API requires phone numbers WITHOUT the '+' sign. 
   ```
   Correct format: "201151359701" (not "+201151359701")
   ```

2. **WhatsApp Template**: Make sure your template is approved in Infobip dashboard.

3. **Credits**: Verify your Infobip account has sufficient credits for sending messages.

### Function Timeouts

The `send-announcement` function may time out when sending to many recipients. This is handled by:

1. Processing recipients in batches
2. Creating a background job for remaining messages
3. Using the `check-schedules` function to process batches

## Troubleshooting Tips

1. **Check Supabase Logs**:
   ```bash
   supabase functions logs
   ```

2. **Run Functions Locally**:
   ```bash
   supabase functions serve
   ```

3. **Test with Debug Mode**:
   Send a request with `debug: true` in the payload to get detailed environment information.

4. **Update Infobip Template**:
   If WhatsApp messages are failing, ensure your templates are approved in the Infobip dashboard.

## Database Tables

The announcement system uses the following tables:

- `announcements` - Stores announcement details
- `announcement_targets` - Links announcements to properties/tenants
- `announcement_jobs` - Tracks processing of large announcements
- `announcement_background_tasks` - Manages batches of messages to be processed

Create these tables using the SQL script in `shared/sql/create_announcement_tables.sql`.

## Manual Testing via Supabase Dashboard

You can also test the edge functions directly through the Supabase dashboard:

1. Login to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`ljojrcciojdprmvrtbdb`)
3. Navigate to **Edge Functions** in the left sidebar
4. Select the function you want to test
5. Click on the **Invoke** tab

### Testing `send-email`

1. **Payload**: Copy this JSON payload:
   ```json
   {
     "email": "ahmadmesbahqa@gmail.com",
     "subject": "Test Email from Dashboard",
     "text": "This is a test email sent from the Supabase dashboard",
     "firstName": "Ahmad",
     "debug": true
   }
   ```
2. Remove `debug: true` to send a real email
3. Click **Invoke Function**
4. **Expected Response**: Status 200 with JSON containing `"success": true`

### Testing `send-sms`

1. **Payload**: Copy this JSON payload:
   ```json
   {
     "phoneNumber": "97477968296",
     "text": "Test SMS from Dashboard",
     "debug": true
   }
   ```
2. Remove `debug: true` to send a real SMS
3. Click **Invoke Function**
4. **Expected Response**: Status 200 with JSON containing `"success": true`

### Testing `send-whatsapp`

1. **Payload**: Copy this JSON payload:
   ```json
   {
     "to": "201151359701",
     "templateName": "general_announcement",
     "placeholders": [
       "Dashboard Test",
       "This is a test WhatsApp message sent from the Supabase dashboard"
     ],
     "debug": true
   }
   ```
2. Remove `debug: true` to send a real WhatsApp message
3. Click **Invoke Function**
4. **Expected Response**: Status 200 with JSON containing `"success": true`

### Testing `send-announcement`

1. **Prerequisite**: You need a valid announcement ID in your database
2. **Payload**: Copy this JSON payload:
   ```json
   {
     "announcementId": "050122ff-95ef-47be-8350-04dac0dbc84e",
     "debug": true
   }
   ```
3. Replace the UUID with a valid announcement ID
4. Remove `debug: true` to process a real announcement
5. Click **Invoke Function**
6. **Expected Response**: Status 200 with details about the announcement processing

### Viewing Logs

To view the function execution logs:
1. Navigate to the **Logs** tab for the function
2. Set the time period (Last 24 hours, etc.)
3. Look for logs with your invocation timestamp
4. Check for any errors or success messages

### Troubleshooting Dashboard Testing

- **Authentication Errors**: Make sure the function is set to `--no-verify-jwt` during deployment
- **500 Errors**: Check the function logs for detailed error messages
- **Missing Variables**: Verify all environment variables are set correctly in Project Settings > API > Edge Functions