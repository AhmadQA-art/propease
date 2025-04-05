# Communications Feature Setup

This document provides instructions for setting up and using the communications features in PropEase, which enable sending announcements to tenants via email, SMS, and WhatsApp using the Infobip API.

## Prerequisites

Before setting up the communication features, ensure you have:

1. An Infobip account with the following details:
   - **Base URL:** `https://9kg1xy.api.infobip.com`
   - **API Key:** `14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc`
   - **WhatsApp Business Number:** `447860099299`

2. Supabase project with Edge Functions enabled

## Database Setup

Ensure the `tenants` table has the necessary contact fields:

```sql
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE;
```

## Supabase Edge Functions

The following Edge Functions have been implemented to handle communication via different channels:

1. `send-sms` - Sends SMS messages
2. `send-email` - Sends email messages
3. `send-whatsapp` - Sends WhatsApp messages
4. `whatsapp-webhook` - Handles WhatsApp opt-ins
5. `send-announcement` - Main function to send announcements through all channels
6. `check-schedules` - Processes scheduled announcements
7. `register-whatsapp-template` - Registers WhatsApp templates with Infobip

### Deploying Edge Functions

Deploy the Edge Functions to your Supabase project using the Supabase CLI:

```bash
supabase functions deploy send-sms
supabase functions deploy send-email
supabase functions deploy send-whatsapp
supabase functions deploy whatsapp-webhook
supabase functions deploy send-announcement
supabase functions deploy check-schedules
supabase functions deploy register-whatsapp-template
```

### Environment Variables

Set the following environment variables:

```bash
supabase secrets set SUPABASE_URL=your-supabase-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
```

## WhatsApp Templates

Before sending WhatsApp messages, you need to register templates with Infobip. We've created two templates:

1. **General Announcement Template**
   - Name: `general_announcement`
   - Text: `Announcement: {{1}}\n{{2}}`
   - Placeholders: Title, Content

2. **Community Event Template**
   - Name: `community_event`
   - Text: `Join us for {{1}} on {{2}} at {{3}}`
   - Placeholders: Event name, Date, Location

### Registering Templates

You can register templates either:

1. Using the provided script:
   ```bash
   cd scripts
   npm install node-fetch
   node register-whatsapp-templates.js
   ```

2. Or using the Edge Function:
   ```bash
   curl -X POST "https://your-project.functions.supabase.co/register-whatsapp-template" \
     -H "Authorization: Bearer your-anon-key" \
     -H "Content-Type: application/json" \
     -d '{"name":"general_announcement","language":"en","category":"MARKETING","text":"Announcement: {{1}}\n{{2}}"}'
   ```

## WhatsApp Opt-In Process

For WhatsApp messages, tenants must opt in:

1. Send an SMS with an opt-in link to tenants:
   ```
   Click to receive updates on WhatsApp: https://wa.me/447860099299?text=I%20agree%20to%20receive%20messages
   ```

2. When a tenant sends "I agree to receive messages" via WhatsApp, the `whatsapp-webhook` function updates their opt-in status in the database.

3. Configure the webhook in Infobip to receive incoming WhatsApp messages. Set the webhook URL to:
   ```
   https://your-project.functions.supabase.co/whatsapp-webhook
   ```

## Scheduled Announcements

For scheduled announcements, set up a CRON job to trigger the `check-schedules` function periodically:

```bash
# Example CRON job to run every minute
* * * * * curl -X POST "https://your-project.functions.supabase.co/check-schedules" -H "Authorization: Bearer your-anon-key"
```

This will check for due announcements and send them at the scheduled time.

## Testing

You can test the communication features by:

1. Creating an announcement via the UI
2. Selecting a property with active leases/tenants
3. Choose one or more communication methods (email, SMS, WhatsApp)
4. Send immediately or schedule for later

## Troubleshooting

- **WhatsApp Templates Pending Approval**: Templates may take up to 24 hours to be approved by WhatsApp. Messages cannot be sent until templates are approved.
- **Phone Number Format**: Ensure phone numbers are in international format (e.g., `201151359701`).
- **WhatsApp Opt-In**: Check that tenants have opted in (`whatsapp_opt_in = true`) before sending WhatsApp messages.
- **Function Permissions**: Ensure the Edge Functions have the necessary permissions to access the database.

## Monitoring

Monitor communication status:

1. Check Supabase Edge Function logs for errors
2. Monitor the Infobip dashboard for message delivery status
3. The `announcements` table tracks the status of each announcement (draft, scheduled, sending, sent)

For additional support, contact the development team. 