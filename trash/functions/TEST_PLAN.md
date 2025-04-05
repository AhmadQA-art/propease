# Propease Announcement System Test Plan

This document outlines the comprehensive test plan for the Propease Announcement System, focusing on the edge functions that power the communication features.

## 1. Environment Setup

### 1.1 Environment Variables

Create or update your `.env` file with these values:

```bash
# Supabase Configuration
SUPABASE_URL="https://ljojrcciojdprmvrtbdb.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.-iqJefSjdHCvChvfYXnZOJIqKHTympzRpVSOy7R2bRc"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMzkxMywiZXhwIjoyMDU0MTg5OTEzfQ.iSwJVhqLhi6PNdDbuSAIGr8Xu2QRmJkkZvsmNecx7QI"

# Infobip API Configuration (PRODUCTION)
INFOBIP_BASE_URL="https://9kg1xy.api.infobip.com"
INFOBIP_API_KEY="14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc"
INFOBIP_WHATSAPP_NUMBER="447860099299"

# Testing Configuration
TEST_EMAIL="ahmadmesbahqa@gmail.com"
TEST_PHONE_NUMBER="+97477968296"
TEST_WHATSAPP_NUMBER="+201151359701"
TEST_ANNOUNCEMENT_ID="050122ff-95ef-47be-8350-04dac0dbc84e"  # Optional: ID of a test announcement
```

Or use the automated setup script:

```bash
cd supabase/functions
chmod +x setup-environment.sh
./setup-environment.sh
```

### 1.2 Dependencies Installation

```bash
cd supabase/functions
npm install
```

### 1.3 Making Scripts Executable

```bash
cd supabase/functions
chmod +x test-runner.sh
chmod +x deploy-functions.sh
```

## 2. Testing Process

### 2.1 Debug Mode vs. Real Message Testing

The test scripts support two modes of operation:

#### Debug Mode (default)
In debug mode, the edge functions don't actually send messages but return diagnostic information:
- No actual messages are sent to recipients
- Functions return configuration and input data for verification
- Use this mode for testing connectivity and configuration

```bash
# Test in debug mode (default)
./test-runner.sh
```

#### Real Message Mode
In real message mode, actual messages will be sent to the test recipients:
- Real emails, SMS, and WhatsApp messages will be delivered
- Recipients will receive test messages
- Use this mode to verify end-to-end message delivery

```bash
# Test with real message delivery
./test-runner.sh --real
```

You can also test individual channels with real messages:
```bash
# Send real email
node test-send-email.js --real

# Send real SMS
node test-send-sms.js --real

# Send real WhatsApp
node test-send-whatsapp.js --real
```

### 2.2 Verify Environment Configuration

Run the debug test to verify your environment and connection:

```bash
cd supabase/functions
node test-debug.js
```

Expected successful output:
```
==== Edge Function Debug Tool ====
--- Environment Variables Check ---
✅ SUPABASE_URL: https://ljojrcciojdprmvrtbdb.supabase.co
✅ SUPABASE_ANON_KEY is set (value hidden)
----------------------------------

Checking if Supabase Edge Functions are running...
...
=== Debug Summary ===
...
✅ Basic function test succeeded
```

### 2.2 Test Infobip API Directly

Before testing the edge functions, verify that your Infobip credentials work:

```bash
cd supabase/functions
node test-infobip-api.js
```

Successful output will show:
```
Infobip API Integration Test
============================
Testing Email API...
✅ Email API test successful

Testing SMS API...
✅ SMS API test successful

Testing WhatsApp API...
✅ WhatsApp API test successful
```

### 2.3 Run Individual Function Tests

Test each function individually:

```bash
# Test email function
node test-send-email.js

# Test SMS function 
node test-send-sms.js

# Test WhatsApp function
node test-send-whatsapp.js
```

Successful output for email test:
```
Testing send-email function on https://ljojrcciojdprmvrtbdb.supabase.co...
Response status: 200
Response data: {
  "success": true,
  "debug": true,
  "message": "Debug mode response from send-email function",
  ...
}
Test completed with result: SUCCESS
```

### 2.4 Run All Tests with Test Runner

```bash
./test-runner.sh
```

For specific tests:
```bash
./test-runner.sh email     # Test just the email function
./test-runner.sh sms       # Test just the SMS function
./test-runner.sh whatsapp  # Test just the WhatsApp function
```

## 3. Deploying Edge Functions

Deploy all functions to your Supabase project:

```bash
cd supabase/functions
./deploy-functions.sh
```

This script will:
1. Deploy the shared module first
2. Deploy all individual functions
3. Set environment variables in Supabase

If you need to deploy manually:

```bash
# Project reference
PROJECT_REF="ljojrcciojdprmvrtbdb"

# Deploy shared module first
supabase functions deploy shared --project-ref $PROJECT_REF --no-verify-jwt

# Deploy individual functions
supabase functions deploy send-email --project-ref $PROJECT_REF --no-verify-jwt
supabase functions deploy send-sms --project-ref $PROJECT_REF --no-verify-jwt
supabase functions deploy send-whatsapp --project-ref $PROJECT_REF --no-verify-jwt
# ...other functions...
```

## 4. Troubleshooting

### 4.1 Common Issues and Solutions

#### Function Test Returns 401 Unauthorized
- **Check**: Verify that you're using the correct SUPABASE_ANON_KEY
- **Solution**: Update your .env file with the correct anon key

#### Function Test Returns 404 Not Found
- **Check**: Verify that functions are deployed properly
- **Solution**: Deploy functions again with `./deploy-functions.sh`

#### Module Not Found Error
- **Check**: Ensure shared module is deployed first
- **Solution**:
  ```bash
  supabase functions deploy shared --project-ref ljojrcciojdprmvrtbdb --no-verify-jwt
  ```

#### 500 Internal Server Error
- **Check**: Look at function logs for detailed error messages
  ```bash
  supabase functions logs --project-ref ljojrcciojdprmvrtbdb
  ```
- **Solution**: Fix errors in function implementation and redeploy

#### Messages Not Being Delivered
- **Check phone number format:** Ensure phone numbers are formatted correctly
  - **Solution:** Infobip API requires phone numbers WITHOUT the '+' prefix
  - **Example for WhatsApp:** "201151359701" (not "+201151359701")
  - **Example for SMS:** "97477968296" (not "+97477968296")

### 4.2 Debug Mode

All test scripts include a `debug: true` flag to prevent actual message sending. This allows you to test the API connectivity without sending real messages.

To test actual message delivery:
1. Edit the test scripts to remove the debug flag
2. Run the tests again

### 4.3 Checking Import Paths

If you encounter import errors, ensure all functions are importing from the correct path:

```typescript
// Correct import path
import { ... } from '../shared/infobip.ts';

// NOT this (old path)
import { ... } from '../_shared/infobip.ts';
```

## 5. Function Testing Details

### 5.1 Email Function Test

Request format:
```json
{
  "email": "ahmadmesbahqa@gmail.com",
  "subject": "Test Email",
  "text": "Test message content",
  "firstName": "Ahmad",
  "debug": true
}
```

### 5.2 SMS Function Test

Request format:
```json
{
  "phoneNumber": "+97477968296",
  "text": "Test SMS message",
  "debug": true
}
```

### 5.3 WhatsApp Function Test

Request format:
```json
{
  "to": "+201151359701",
  "templateName": "general_announcement",
  "placeholders": [
    "Test Announcement",
    "This is a test WhatsApp message to verify the send-whatsapp edge function is working."
  ],
  "debug": true
}
```

### 5.4 Announcement Function Test

Request format:
```json
{
  "announcementId": "00000000-0000-0000-0000-000000000000",
  "debug": true
}
```

## 6. Verification Checklist

- [ ] Environment variables set correctly in `.env` file
- [ ] All dependencies installed with `npm install`
- [ ] Infobip API test passes (`node test-infobip-api.js`)
- [ ] Debug test passes (`node test-debug.js`)
- [ ] Email function test passes (`./test-runner.sh email`)
- [ ] SMS function test passes (`./test-runner.sh sms`)
- [ ] WhatsApp function test passes (`./test-runner.sh whatsapp`)
- [ ] All functions deployed with `./deploy-functions.sh`
- [ ] Environment variables set in Supabase with `supabase secrets set`
- [ ] Function logs checked for any errors

## 7. Testing Production Deployment

After verifying all functions work in debug mode:

1. Remove debug flag from test scripts
2. Run the tests to send actual messages
3. Check your test email, phone, and WhatsApp for received messages
4. Verify message content and formatting is correct 

## Common Issues and Solutions

### Function Deployment Issues

- **Error:** `Error: Function name cannot start with an underscore (_)`
  - **Solution:** Rename the function folder from `_shared` to `shared` and update all import paths

### Environment Variables Missing

- **Error:** `Error: Missing required environment variable: INFOBIP_API_KEY`
  - **Solution:** Set the required environment variables using the setup script: `./setup-environment.sh`

### Messages Not Being Delivered

- **Check phone number format:** Ensure phone numbers are formatted correctly
  - **Solution:** Infobip API requires phone numbers WITHOUT the '+' prefix
  - **Example for WhatsApp:** "201151359701" (not "+201151359701")
  - **Example for SMS:** "97477968296" (not "+97477968296") 

## 8. Manual Testing via Supabase Dashboard

For simple manual testing without using the terminal or scripts, you can test directly through the Supabase dashboard interface.

### 8.1 Accessing the Dashboard

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Log in with your account credentials
3. Select the project (`ljojrcciojdprmvrtbdb`)
4. Navigate to **Edge Functions** in the left sidebar

### 8.2 Testing Individual Functions

For each function:
1. Click on the function name in the list
2. Switch to the **Invoke** tab
3. Paste the appropriate test payload (see below)
4. Click **Invoke Function**

### 8.3 Test Payloads

#### Email Function Payload
```json
{
  "email": "ahmadmesbahqa@gmail.com",
  "subject": "Test Email from Dashboard",
  "text": "This is a test email sent from the Supabase dashboard",
  "firstName": "Ahmad",
  "debug": true
}
```

#### SMS Function Payload
```json
{
  "phoneNumber": "201151359701", 
  "text": "Test SMS from Dashboard"
}
```

#### WhatsApp Function Payload
```json
{
  "to": "201151359701",
  "templateName": "test_whatsapp_template_en",
  "placeholders": [
    "Dashboard Test",
    "This is a test WhatsApp message sent from the Supabase dashboard"
  ]
}
```

#### Announcement Function Payload
```json
{
  "announcementId": "050122ff-95ef-47be-8350-04dac0dbc84e",
  "debug": true
}
```

### 8.4 Checking Logs

After invoking a function:
1. Click on the **Logs** tab
2. Set the time period (e.g., Last 30 minutes)
3. Look for your function invocation logs
4. Examine any error messages if the function fails

### 8.5 Real Message Testing

To send real messages via the dashboard:
1. Remove the `"debug": true` line from the payload
2. Click **Invoke Function**
3. Check the recipient device for the message

> ⚠️ **Warning**: Removing the debug flag will cause real messages to be sent to the specified recipients. 