# PropEase Communication Management System

The PropEase Communication Management System provides a comprehensive solution for managing all property-related communications. This system centralizes announcements, tenant notifications, and communication tracking, enabling property managers to effectively reach their audience through multiple channels while maintaining detailed records of all interactions.

## Core Components

The communication system consists of five integrated tables:

1. **announcement_types** - Categorizes announcements for better organization and filtering
2. **announcements** - The central table storing announcement details including title, content, and delivery methods
3. **announcement_targets** - Defines recipients for each announcement with flexible targeting
4. **announcement_schedules** - Manages one-time and recurring announcement schedules
5. **communication_logs** - Tracks every communication sent through the system

## Communication Management Tables

### announcement_types

**Purpose:** Standardizes announcement categories for consistent organization and reporting.

**Key Fields:**

- **id** - Unique identifier for each announcement type
- **name** - Descriptive name (e.g., "Maintenance Alert", "Rent Reminder")
- **description** - Detailed explanation of the category purpose
- **organization_id** - References the owning organization

**Workflow:**

1. Create standard announcement types for your organization
2. Use these types when creating new announcements
3. Filter and report on communications by type
```sql
-- Example: Creating standard announcement types
INSERT INTO announcement_types (name, description, organization_id)
VALUES ('Maintenance Alert', 'Notifications about scheduled maintenance', 'org-uuid');

INSERT INTO announcement_types (name, description, organization_id)
VALUES ('Community Reminder', 'Updates about community events and policies', 'org-uuid');
```


### announcements

**Purpose:** Stores the core announcement information including content, delivery method, and status.

**Key Fields:**

- **id** - Unique identifier for each announcement
- **title** - Subject line or headline of the announcement
- **content** - Main message body
- **property_id** - Property the announcement relates to
- **communication_method** - Array of delivery methods (email, SMS, in-app)
- **is_scheduled** - Whether the announcement follows a schedule
- **status** - Current state (draft, scheduled, sent, cancelled)
- **issue_date** - When the announcement was or will be issued
- **author_id** - User who created the announcement
- **announcement_type_id** - References the announcement category

**Workflow:**

1. Create announcement with title, content, and delivery methods
2. Set status to "draft" while preparing
3. Define targets (who should receive it)
4. Schedule if needed or send immediately
5. System updates status as the announcement progresses
```sql
-- Example: Creating a maintenance announcement
INSERT INTO announcements (
    title, 
    content, 
    property_id, 
    communication_method, 
    author_id, 
    announcement_type_id, 
    organization_id
)
VALUES (
    'Water Shutdown Notice', 
    'The water will be shut off on March 15th from 9am-12pm for scheduled maintenance.', 
    'property-uuid', 
    ARRAY['email', 'sms', 'in-app'], 
    'author-uuid', 
    'announcement-type-uuid', 
    'org-uuid'
);
```


### announcement_targets

**Purpose:** Defines the recipients of each announcement with a flexible targeting system.

**Key Fields:**

- **id** - Unique identifier for each target record
- **announcement_id** - References the announcement being targeted
- **target_type** - Type of recipient (e.g., "property", "unit", "tenant", "individual")
- **target_id** - ID of the specific target entity
- **target_name** - Optional human-readable name for reference

**Workflow:**

1. After creating an announcement, define who should receive it
2. Add multiple targets for broader distribution
3. Target specific individuals or entire properties
```sql
-- Example: Targeting a specific property
INSERT INTO announcement_targets (announcement_id, target_type, target_id, target_name)
VALUES ('announcement-uuid', 'property', 'property-uuid', 'Sunset Apartments');

-- Example: Targeting a specific individual
INSERT INTO announcement_targets (announcement_id, target_type, target_id, target_name)
VALUES ('announcement-uuid', 'individual', 'user-uuid', 'John Smith');
```


### announcement_schedules

**Purpose:** Manages timing for one-time and recurring announcements.

**Key Fields:**

- **id** - Unique identifier for each schedule
- **announcement_id** - References the announcement being scheduled
- **start_date** - When the announcement should first be sent
- **end_date** - Optional end date for recurring announcements
- **repeat_frequency** - How often to repeat (once, daily, weekly, etc.)
- **repeat_on** - JSON data with specific repetition details
- **time_of_day** - Time when the announcement should be sent
- **next_run** - Next scheduled delivery time

**Workflow:**

1. Create a schedule for an announcement that needs timed delivery
2. Set repeat_frequency for recurring announcements
3. System uses next_run to trigger delivery
4. After delivery, next_run is updated for recurring announcements
```sql
-- Example: Scheduling a one-time announcement
INSERT INTO announcement_schedules (
    announcement_id, 
    start_date, 
    repeat_frequency, 
    time_of_day, 
    next_run
)
VALUES (
    'announcement-uuid', 
    '2025-03-14 10:00:00', 
    'once', 
    '10:00:00', 
    '2025-03-14 10:00:00'
);

-- Example: Scheduling a monthly recurring announcement
INSERT INTO announcement_schedules (
    announcement_id, 
    start_date, 
    end_date,
    repeat_frequency, 
    repeat_on,
    time_of_day, 
    next_run
)
VALUES (
    'announcement-uuid', 
    '2025-03-01 09:00:00',
    '2025-12-31 09:00:00',
    'monthly', 
    '{"day": 1}',
    '09:00:00', 
    '2025-03-01 09:00:00'
);
```


### communication_logs

**Purpose:** Tracks all communications sent through the system for audit, analysis, and troubleshooting.

**Key Fields:**

- **id** - Unique identifier for each log entry
- **announcement_id** - References the related announcement (if applicable)
- **message_type** - Type of communication (announcement, direct message, etc.)
- **sender_id** - User or system that sent the communication
- **recipient_type** - Type of recipient (tenant, owner, etc.)
- **recipient_id** - ID of the recipient entity
- **method** - Delivery method used (email, SMS, in-app)
- **subject** - Subject line or title
- **content** - Actual message content
- **status** - Delivery status (queued, sent, delivered, read, failed)
- **error_message** - Details if delivery failed
- **sent_at** - When the message was sent
- **delivered_at** - When the message was delivered
- **read_at** - When the message was read (if applicable)

**Workflow:**

1. System automatically creates log entries when communications are sent
2. Status is updated as delivery progresses
3. Error details are captured if delivery fails
4. Read receipts update the record when applicable
```sql
-- Example: System generated log when an announcement is sent
INSERT INTO communication_logs (
    announcement_id,
    message_type,
    sender_id,
    recipient_type,
    recipient_id,
    method,
    subject,
    content,
    status,
    sent_at,
    organization_id
)
VALUES (
    'announcement-uuid',
    'announcement',
    'sender-uuid',
    'tenant',
    'tenant-uuid',
    'email',
    'Water Shutdown Notice',
    'The water will be shut off on March 15th from 9am-12pm for scheduled maintenance.',
    'sent',
    NOW(),
    'org-uuid'
);
```


## Benefits

1. **Multi-Channel Communication** - Reach tenants through their preferred methods (email, SMS, in-app)
2. **Targeted Messaging** - Send announcements to specific properties, units, or individuals
3. **Scheduled Delivery** - Set up announcements in advance with flexible scheduling options
4. **Complete Audit Trail** - Track all communications with detailed delivery status
5. **Organized Categories** - Group announcements by type for better organization
6. **Performance Analytics** - Analyze open rates, delivery success, and engagement

## Best Practices

1. **Use Announcement Types** - Categorize communications consistently for better reporting
2. **Target Carefully** - Be specific with targeting to avoid overwhelming recipients
3. **Schedule During Business Hours** - Schedule announcements during appropriate hours
4. **Keep Messages Clear** - Use concise titles and clear content
5. **Monitor Delivery Status** - Check communication logs to ensure successful delivery
6. **Balance Frequency** - Avoid sending too many announcements in a short period

The PropEase Communication Management System transforms property communications from ad-hoc messages into a strategic, tracked process that improves tenant satisfaction while ensuring important information is properly delivered and recorded.
