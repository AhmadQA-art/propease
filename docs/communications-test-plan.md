# Communication Features Test Plan

## 1. Prerequisites

Before running tests, ensure:

- Supabase Edge Functions are deployed
- WhatsApp templates are registered and approved
- Test tenant records exist with valid contact details
- Test properties with units and active leases are configured

## 2. Individual Channel Tests

### 2.1. Email Communication Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| EM-01 | Send email to single tenant | 1. Create announcement with email method only<br>2. Target a single tenant<br>3. Send immediately | Email delivered to tenant with correct subject, greeting, and content |
| EM-02 | Send email to multiple tenants via property | 1. Create announcement with email method only<br>2. Target a property with multiple active leases<br>3. Send immediately | Multiple emails delivered, one to each tenant associated with the property |
| EM-03 | Email formatting test | 1. Create announcement with HTML formatting<br>2. Send email | Email displays with correct formatting |
| EM-04 | Email with long content | 1. Create announcement with content >1000 characters<br>2. Send email | Email delivered with complete content intact |

### 2.2. SMS Communication Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| SMS-01 | Send SMS to single tenant | 1. Create announcement with SMS method only<br>2. Target a single tenant<br>3. Send immediately | SMS delivered to tenant's phone with correct content |
| SMS-02 | Send SMS to multiple tenants | 1. Create announcement with SMS method only<br>2. Target a property with multiple active leases<br>3. Send immediately | Multiple SMS messages delivered, one to each tenant's phone |
| SMS-03 | SMS with special characters | 1. Create announcement with emojis and special characters<br>2. Send SMS | SMS delivered with special characters intact |
| SMS-04 | SMS with long content | 1. Create content exceeding single SMS limit<br>2. Send SMS | Message either truncated or split according to provider's behavior |

### 2.3. WhatsApp Communication Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| WA-01 | Send WhatsApp to opted-in tenant | 1. Use a tenant with whatsapp_opt_in=true<br>2. Create announcement with WhatsApp method<br>3. Send immediately | WhatsApp message delivered using correct template |
| WA-02 | Send to non-opted-in tenant | 1. Use tenant with whatsapp_opt_in=false<br>2. Create announcement with WhatsApp method<br>3. Send immediately | WhatsApp message not sent, appears in failed messages list |
| WA-03 | Community event template test | 1. Create "community event" announcement<br>2. Send via WhatsApp | Message uses community_event template with correct placeholders |
| WA-04 | General announcement template test | 1. Create "maintenance notice" announcement<br>2. Send via WhatsApp | Message uses general_announcement template with correct placeholders |
| WA-05 | WhatsApp opt-in flow | 1. Send SMS with opt-in link<br>2. Respond with "I agree to receive messages"<br>3. Check tenant record | Tenant's whatsapp_opt_in field updated to true |

## 3. Multi-Channel Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| MC-01 | Send via all channels simultaneously | 1. Create announcement with all methods (email, SMS, WhatsApp)<br>2. Send immediately | Message delivered via all selected channels to eligible tenants |
| MC-02 | Mixed eligibility test | 1. Target tenants with varying contact details<br>2. Select all channels<br>3. Send announcement | Messages sent only through available channels (e.g., email sent to tenants with email, SMS sent to tenants with phone numbers) |

## 4. Scheduling Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| SCH-01 | Schedule for future date | 1. Create announcement<br>2. Enable scheduling<br>3. Set date/time 5 minutes in future<br>4. Save | Announcement saved with 'scheduled' status, sent after scheduled time |
| SCH-02 | One-time schedule execution | 1. Schedule one-time announcement<br>2. Wait for execution<br>3. Check status | Status changes to 'sent', next_run becomes null |
| SCH-03 | Daily schedule | 1. Create announcement with daily repeat<br>2. Set initial time<br>3. Wait for execution | Message sent, next_run updated to next day |
| SCH-04 | Weekly schedule | 1. Create announcement with weekly repeat<br>2. Set initial time<br>3. Wait for execution | Message sent, next_run updated to next week |
| SCH-05 | Schedule cancellation | 1. Schedule announcement<br>2. Cancel before execution time | Announcement not sent, status remains as draft or is deleted |

## 5. Announcement Types Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| TYP-01 | Maintenance notice | 1. Create "maintenance notice" announcement<br>2. Send immediately | Content formatted according to maintenance type, appropriate template used for WhatsApp |
| TYP-02 | Rent payment reminder | 1. Create "rent payment reminder" announcement<br>2. Send immediately | Content formatted according to reminder type, appropriate template used for WhatsApp |
| TYP-03 | Community event | 1. Create "community event" announcement<br>2. Send immediately | Content formatted according to event type, community_event template used for WhatsApp |

## 6. Error Handling Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| ERR-01 | Invalid email address | 1. Set up tenant with invalid email<br>2. Send email announcement | Error handled gracefully, other tenants' messages still sent |
| ERR-02 | Invalid phone number | 1. Set up tenant with invalid phone<br>2. Send SMS announcement | Error handled gracefully, other tenants' messages still sent |
| ERR-03 | Infobip API unavailable | 1. Simulate API unavailability<br>2. Send announcement | Appropriate error message shown, status updated accordingly |
| ERR-04 | Missing tenant contact info | 1. Set up tenant with no contact details<br>2. Send multi-channel announcement | Tenant skipped, announcement sent to other tenants |

## 7. Database and UI Validation Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| DB-01 | Announcement record creation | 1. Create and send announcement<br>2. Check announcements table | Record created with correct data |
| DB-02 | Targets association | 1. Create announcement with multiple targets<br>2. Check announcement_targets table | Targets correctly associated with announcement |
| DB-03 | Schedule record creation | 1. Create scheduled announcement<br>2. Check announcement_schedules table | Schedule record created with correct timing data |
| UI-01 | Status display | 1. Create announcements with different statuses<br>2. View announcements list | Correct status displayed with appropriate styling |
| UI-02 | Sent confirmation | 1. Send announcement immediately<br>2. Observe UI feedback | Success message shown, announcement appears in list with 'sent' status |

## 8. Performance and Load Tests

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| PERF-01 | Large tenant list | 1. Target property with 50+ tenants<br>2. Send announcement | All messages delivered without system degradation |
| PERF-02 | Multiple simultaneous announcements | 1. Schedule multiple announcements for same time<br>2. Wait for execution | All announcements processed and sent correctly |

## 9. Test Execution Checklist

For each test:
1. Prepare test data (tenants, properties, etc.)
2. Execute test steps
3. Verify expected results
4. Document any issues encountered
5. If failure, investigate logs (Supabase, Infobip, application)
6. Reset test environment for next test

## 10. Test Monitoring

During testing, monitor:
- Supabase function logs for errors
- Infobip dashboard for message delivery status
- Database for correct record updates
- Application logs for any frontend errors

## 11. Test Data Preparation

### Test Tenant Profiles

| ID | Name | Email | Phone | WhatsApp | Opt-In |
|----|------|-------|-------|----------|--------|
| T1 | John Doe | john@example.com | 1234567890 | 1234567890 | Yes |
| T2 | Jane Smith | jane@example.com | 0987654321 | 0987654321 | No |
| T3 | Sam Brown | sam@example.com | 5555555555 | null | No |
| T4 | Alex Johnson | null | 6666666666 | 6666666666 | Yes |
| T5 | Morgan Lee | morgan@example.com | null | null | No |
| T6 | Invalid Contact | invalid@email | 1234 | 1234 | Yes |

### Test Properties

| ID | Name | Units | Active Leases | Tenants |
|----|------|-------|---------------|---------|
| P1 | Sunset Apartments | 3 | 3 | T1, T2, T3 |
| P2 | Ocean View Complex | 5 | 2 | T4, T5 |
| P3 | Mountain Residences | 10 | 0 | None |
| P4 | Large Residence | 50 | 50 | Multiple |

## 12. Test Results Template

| Test ID | Date | Tester | Status | Issues | Notes |
|---------|------|--------|--------|--------|-------|
| EM-01 | | | Pass/Fail | | |
| EM-02 | | | Pass/Fail | | |
| ... | | | | | | 