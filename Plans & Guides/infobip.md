# Comprehensive Guide for Implementing Announcement Communication Features with Infobip

This guide provides a framework for sending announcements to tenants using Infobip's SMS, email, and WhatsApp channels. It leverages your `announcements`, `announcement_targets`, and `announcement_schedules` tables to target tenants of specific rentals (properties) or individual tenants, supports scheduled announcements, and integrates with your React, Vite, TypeScript, and Supabase tech stack. Tenants are fetched through the `properties` → `units` → `leases` → `tenants` relationship, as they are external users stored in the `tenants` table, not authenticated users in `user_profiles`.

---

## 1. Prerequisites

- **Base URL:** `https://9kg1xy.api.infobip.com`
- **API Key:** `14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc`
- **WhatsApp Business Number:** `447860099299`
- **Tech Stack:** React, Vite, TypeScript, Supabase
- **Database Tables:**
  - `announcements`: Stores announcement details (`title`, `content`, `communication_method`, `is_scheduled`, `status`, `issue_date`, `type`)
  - `announcement_targets`: Links announcements to targets (`target_type`, `target_id`, `property_id`)
  - `announcement_schedules`: Manages scheduled announcements (`start_date`, `repeat_frequency`, `next_run`)
  - `properties`: Represents rentals (`id`, `name`, etc.)
  - `units`: Belongs to properties (`property_id`, `id`, etc.)
  - `leases`: Links units to tenants (`unit_id`, `tenant_id`, `status`)
  - `tenants`: Stores tenant contact details (`phone_number`, `email`, `whatsapp_number`, `whatsapp_opt_in`)

Set up Supabase with serverless functions and environment variables (`SUPABASE_URL`, `SUPABASE_KEY`).

### Database Updates
Ensure the `tenants` table has the necessary contact fields:

```sql
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE;
```

---

## 2. Sending SMS Announcements

SMS is ideal for sending quick announcements or WhatsApp opt-in requests.

### Curl Command
```sh
curl -L -g 'https://9kg1xy.api.infobip.com/sms/2/text/advanced' \
-H 'Authorization: App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"messages":[{"destinations":[{"to":"201151359701"}],"from":"ServiceSMS","text":"New Announcement: Rent due on the 5th."}]}'
```

### Details
- **Endpoint:** `https://9kg1xy.api.infobip.com/sms/2/text/advanced`
- **Method:** POST
- **Headers:**
  - `Authorization: App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc`
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Payload:**
  - `messages`: Array containing message details
  - `destinations`: Array with the recipient’s phone number (`to`)
  - `from`: Sender ID (`ServiceSMS`)
  - `text`: Message content

### Implementation (Supabase Function)
```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { phoneNumber, text } = JSON.parse(event.body);
  const url = 'https://9kg1xy.api.infobip.com/sms/2/text/advanced';
  const headers = {
    'Authorization': 'App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  const body = {
    messages: [{ destinations: [{ to: phoneNumber }], from: 'ServiceSMS', text }]
  };

  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await response.json();
  return { statusCode: response.status, body: JSON.stringify(data) };
};
```
- Deploy at `/api/send-sms`.

### Notes
- Use for announcements (e.g., "Rent due on the 5th") or WhatsApp opt-in requests.
- Ensure phone numbers are in international format (e.g., `201151359701`).

---

## 3. Sending Email Announcements

Email is suited for detailed announcements and formal communications.

### Curl Command
```sh
curl -L -g 'https://9kg1xy.api.infobip.com/email/3/send' \
-H 'Authorization: App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc' \
-H 'Content-Type: multipart/form-data' \
-H 'Accept: application/json' \
-F 'from="propease <ahmadmesbah@propeasesolutions.com>"' \
-F 'subject="Community Event"' \
-F 'to="{\"to\":\"ahmadmesbah@propeasesolutions.com\",\"placeholders\":{\"firstName\":\"Ahmad\"}}"' \
-F 'text="Hi {{firstName}}, join us for the upcoming community gathering."'
```

### Details
- **Endpoint:** `https://9kg1xy.api.infobip.com/email/3/send`
- **Method:** POST
- **Headers:**
  - `Authorization: App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc`
  - `Content-Type: multipart/form-data`
  - `Accept: application/json`
- **Form Data:**
  - `from`: Sender email and name
  - `subject`: Email subject
  - `to`: JSON string with recipient email and placeholders
  - `text`: Email body with placeholder (`{{firstName}}`)

### Implementation (Supabase Function)
```javascript
const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  const { email, subject, text, firstName } = JSON.parse(event.body);
  const url = 'https://9kg1xy.api.infobip.com/email/3/send';
  const form = new FormData();
  form.append('from', 'propease <ahmadmesbah@propeasesolutions.com>');
  form.append('subject', subject);
  form.append('to', JSON.stringify({ to: email, placeholders: { firstName } }));
  form.append('text', `Hi {{firstName}}, ${text}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc',
      'Accept': 'application/json',
      ...form.getHeaders()
    },
    body: form
  });
  const data = await response.json();
  return { statusCode: response.status, body: JSON.stringify(data) };
};
```
- Deploy at `/api/send-email`.

### Notes
- Verify your email domain in Infobip.
- Use placeholders (e.g., `{{firstName}}`) for personalization.

---

## 4. Verifying WhatsApp Numbers

Verify tenants’ WhatsApp numbers using SMS opt-in, as tenants are external users stored in the `tenants` table.

### Steps
1. **Send SMS Opt-in Link**
   ```javascript
   await fetch('/api/send-sms', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       phoneNumber: '201151359701',
       text: 'Click to receive updates on WhatsApp: https://wa.me/447860099299?text=I%20agree%20to%20receive%20messages'
     })
   });
   ```

2. **Handle Consent (Webhook)**
   ```javascript
   const { createClient } = require('@supabase/supabase-js');
   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

   exports.handler = async (event) => {
     const message = JSON.parse(event.body);
     if (message.text?.toLowerCase() === 'i agree to receive messages') {
       const { error } = await supabase
         .from('tenants')
         .update({ whatsapp_opt_in: true })
         .eq('whatsapp_number', message.from);
       if (error) return { statusCode: 500, body: JSON.stringify(error) };
     }
     return { statusCode: 200, body: 'OK' };
   };
   ```
   - Deploy at `/api/whatsapp-webhook`.

### Notes
- Matches incoming WhatsApp numbers to the `tenants` table and updates `whatsapp_opt_in`.
- Configure the webhook in Infobip to receive incoming WhatsApp messages.

---

## 5. Creating WhatsApp Templates

Create templates for announcements.

### Templates
1. **General Announcement**
   ```json
   {
     "name": "general_announcement",
     "language": "en",
     "category": "MARKETING",
     "structure": {
       "body": {
         "text": "Announcement: {{1}}\n{{2}}"
       }
     }
   }
   ```
   - Placeholders: `title`, `content`

2. **Community Event**
   ```json
   {
     "name": "community_event",
     "language": "en",
     "category": "MARKETING",
     "structure": {
       "body": {
         "text": "Join us for {{1}} on {{2}} at {{3}}"
       }
     }
   }
   ```
   - Placeholders: `title`, `date`, `location`

### Submission (Curl Command)
```sh
curl -L -g 'https://9kg1xy.api.infobip.com/whatsapp/1/message/template' \
-H 'Authorization: App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc' \
-H 'Content-Type: application/json' \
-d '{"name":"general_announcement","language":"en","category":"MARKETING","structure":{"body":{"text":"Announcement: {{1}}\n{{2}}"}}'
```
- Repeat for `community_event`.
- Approval takes up to 24 hours.

---

## 6. Sending WhatsApp Announcements

Send templated WhatsApp messages to verified tenants.

### Curl Command
```sh
curl -L -g 'https://9kg1xy.api.infobip.com/whatsapp/1/message/template' \
-H 'Authorization: App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"messages":[{"from":"447860099299","to":"201151359701","messageId":"40e45bca-792d-4b1e-be14-0a9e23aa0cac","content":{"templateName":"general_announcement","templateData":{"body":{"placeholders":["Community Event","Join us this Saturday!"]}},"language":"en"}}]}'
```

### Details
- **Endpoint:** `https://9kg1xy.api.infobip.com/whatsapp/1/message/template`
- **Method:** POST
- **Headers:**
  - `Authorization: App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc`
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Payload:**
  - `messages`: Array containing message details
  - `from`: WhatsApp business number (`447860099299`)
  - `to`: Recipient’s phone number
  - `messageId`: Unique identifier for the message
  - `content`:
    - `templateName`: Name of the approved template
    - `templateData`: Placeholder values for the template
    - `language`: Language code (`en`)

### Implementation (Supabase Function)
```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { to, templateName, placeholders } = JSON.parse(event.body);
  const url = 'https://9kg1xy.api.infobip.com/whatsapp/1/message/template';
  const headers = {
    'Authorization': 'App 14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  const body = {
    messages: [{
      from: '447860099299',
      to,
      messageId: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      content: { templateName, templateData: { body: { placeholders } }, language: 'en' }
    }]
  };

  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await response.json();
  return { statusCode: response.status, body: JSON.stringify(data) };
};
```
- Deploy at `/api/send-whatsapp`.

---

## 7. Sending Announcements (All Channels)

### Supabase Function (Send Announcement)
This function fetches tenants through the `properties` → `units` → `leases` → `tenants` relationship and sends announcements via the specified communication methods.

```javascript
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const FormData = require('form-data');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async (event) => {
  const { announcementId } = JSON.parse(event.body);

  // Fetch announcement details
  const { data: announcement, error: annError } = await supabase
    .from('announcements')
    .select('title, content, communication_method, type')
    .eq('id', announcementId)
    .single();
  if (annError) return { statusCode: 500, body: JSON.stringify(annError) };

  // Fetch targets
  const { data: targets, error: targetError } = await supabase
    .from('announcement_targets')
    .select('target_type, target_id')
    .eq('announcement_id', announcementId);
  if (targetError) return { statusCode: 500, body: JSON.stringify(targetError) };

  // Fetch tenant contacts
  const tenantContacts = [];
  for (const target of targets) {
    if (target.target_type === 'property') {
      const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('id, phone_number, email, whatsapp_number, whatsapp_opt_in')
        .in('id', await supabase
          .from('leases')
          .select('tenant_id')
          .eq('status', 'Active')
          .in('unit_id', await supabase
            .from('units')
            .select('id')
            .eq('property_id', target.target_id)
          )
        );
      if (tenantError) continue; // Log error if needed
      tenantContacts.push(...tenants);
    } else if (target.target_type === 'tenant') {
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('phone_number, email, whatsapp_number, whatsapp_opt_in')
        .eq('id', target.target_id)
        .single();
      if (tenantError) continue; // Log error if needed
      if (tenant) tenantContacts.push(tenant);
    }
  }

  // Send announcements
  for (const contact of tenantContacts) {
    for (const method of announcement.communication_method) {
      if (method === 'sms' && contact.phone_number) {
        await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: contact.phone_number,
            text: `${announcement.title}: ${announcement.content}`
          })
        });
      } else if (method === 'email' && contact.email) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: contact.email,
            subject: announcement.title,
            text: announcement.content,
            firstName: contact.name || 'Tenant'
          })
        });
      } else if (method === 'whatsapp' && contact.whatsapp_number && contact.whatsapp_opt_in) {
        const templateName = announcement.type === 'community event' ? 'community_event' : 'general_announcement';
        const placeholders = announcement.type === 'community event'
          ? [announcement.title, '2025-04-10', 'Community Hall'] // Adjust based on actual data
          : [announcement.title, announcement.content];
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: contact.whatsapp_number, templateName, placeholders })
        });
      }
    }
  }

  // Update announcement status
  await supabase
    .from('announcements')
    .update({ status: 'sent', issue_date: new Date() })
    .eq('id', announcementId);

  return { statusCode: 200, body: 'Announcement sent' };
};
```
- Deploy at `/api/send-announcement`.

### Notes
- **Targeting**: Fetches tenants via `properties` → `units` → `leases` → `tenants` for property targets, or directly from `tenants` for tenant targets.
- **Active Leases**: Filters leases by `status = 'Active'` to target current tenants only.
- **WhatsApp Opt-in**: Checks `whatsapp_opt_in` before sending WhatsApp messages.

---

## 8. Scheduling Announcements

### Supabase Function (Check Schedules)
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.handler = async () => {
  const now = new Date().toISOString();
  const { data: schedules } = await supabase
    .from('announcement_schedules')
    .select('announcement_id, repeat_frequency, next_run')
    .lte('next_run', now)
    .eq('announcements.status', 'scheduled')
    .join('announcements', 'announcement_schedules.announcement_id = announcements.id');

  for (const schedule of schedules) {
    // Send announcement
    await fetch('/api/send-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId: schedule.announcement_id })
    });

    // Update next_run
    let nextRun;
    if (schedule.repeat_frequency === 'once') {
      await supabase.from('announcements').update({ status: 'sent' }).eq('id', schedule.announcement_id);
      continue;
    } else if (schedule.repeat_frequency === 'daily') {
      nextRun = new Date(new Date(schedule.next_run).getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (schedule.repeat_frequency === 'weekly') {
      nextRun = new Date(new Date(schedule.next_run).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    // Add other frequencies as needed

    await supabase.from('announcement_schedules').update({ next_run: nextRun }).eq('announcement_id', schedule.announcement_id);
  }

  return { statusCode: 200, body: 'Schedules processed' };
};
```
- Deploy at `/api/check-schedules` and run via a cron job (e.g., every minute).

### Notes
- Handles `repeat_frequency` and updates `next_run` for recurring announcements.
- Sets status to `sent` for one-time announcements.

---

## 9. Integration with React Application

### React Component
```typescript
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('your-supabase-url', 'your-supabase-key');

const AnnouncementForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [methods, setMethods] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState('');

  const handleSubmit = async () => {
    // Insert announcement
    const { data: announcement } = await supabase.from('announcements').insert({
      title,
      content,
      communication_method: methods,
      is_scheduled: false,
      status: 'draft',
      author_id: 'user-id',
      organization_id: 'org-id',
      type: 'community event'
    }).select().single();

    // Insert target
    await supabase.from('announcement_targets').insert({
      announcement_id: announcement.id,
      target_type: 'property',
      target_id: propertyId,
      property_id: propertyId,
      target_name: 'Property Name'
    });

    // Send immediately if not scheduled
    await fetch('/api/send-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId: announcement.id })
    });

    alert('Announcement sent!');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
      <select multiple onChange={(e) => setMethods(Array.from(e.target.selectedOptions, option => option.value))}>
        <option value="sms">SMS</option>
        <option value="email">Email</option>
        <option value="whatsapp">WhatsApp</option>
      </select>
      <input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="Property ID" />
      <button type="submit">Send Announcement</button>
    </form>
  );
};
```

---

## Additional Notes
- **Targeting**: Uses the `properties` → `units` → `leases` → `tenants` relationship to fetch tenants for property targets, ensuring only active leases are considered.
- **Compliance**: Ensures WhatsApp messages are sent only to opted-in tenants.
- **Testing**: Use Infobip’s free trial to test all channels.
- **Monitoring**: Use Infobip’s dashboard for delivery tracking.