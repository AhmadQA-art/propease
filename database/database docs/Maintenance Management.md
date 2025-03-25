# PropEase Maintenance Management System

The PropEase Maintenance Management System is a comprehensive computerized maintenance management solution designed to efficiently track, assign, and resolve maintenance issues across your property portfolio. This system centralizes all maintenance activities, providing real-time visibility into work orders, resource allocation, and maintenance history.

## Core Components

The maintenance system consists of four integrated tables:

1. **maintenance_requests**: The central table storing ticket details including title, description, priority, status, due dates, and assignments.
2. **maintenance_ticket_history**: Tracks all changes to tickets, creating an audit trail of status updates, assignments, and modifications.
3. **maintenance_comments**: Enables communication between stakeholders (tenants, staff, vendors) on specific tickets.
4. **maintenance_types**: Standardizes maintenance categories with estimated resolution times and emergency flags.

## Using the Maintenance System

### Creating Maintenance Tickets

```sql
-- Example: Creating a new maintenance ticket
INSERT INTO maintenance_requests (
  title, description, priority, status, 
  opened_date, due_date, scheduled_date,
  owner_id, unit_id, property_id, organization_id,
  maintenance_type_id
) VALUES (
  'Leaking Bathroom Faucet', 'Constant dripping from sink faucet', 
  'medium', 'open', NOW(), NOW() + INTERVAL '2 days',
  NOW() + INTERVAL '3 days', 'tenant-uuid', 'unit-uuid',
  'property-uuid', 'org-uuid', 'plumbing-type-uuid'
);
```


### Tracking Ticket Changes

When any significant change occurs to a ticket (status update, reassignment), record it in the history table:

```sql
-- Example: Recording a status change
INSERT INTO maintenance_ticket_history (
  ticket_id, changed_by, change_description,
  previous_status, new_status
) VALUES (
  'ticket-uuid', 'staff-uuid', 
  'Assigned to maintenance vendor',
  'open', 'in_progress'
);
```


### Communication on Tickets

All stakeholders can add comments to facilitate communication:

```sql
-- Example: Adding a comment to a ticket
INSERT INTO maintenance_comments (
  ticket_id, commented_by, comment
) VALUES (
  'ticket-uuid', 'vendor-uuid',
  'Parts ordered, scheduled repair for Thursday'
);
```


## Benefits

1. **Centralized Tracking**: All maintenance activities are stored in one system, eliminating information silos
2. **Improved Communication**: The comments system creates a documented conversation thread accessible to all stakeholders
3. **Historical Records**: Complete maintenance history provides insights for property management decisions
4. **Accountability**: Clear tracking of who is responsible for each ticket and all status changes
5. **Analytics Capabilities**: The structured data model enables reporting on maintenance performance, costs, and trends

## Best Practices

1. **Categorize Properly**: Use the maintenance_types table consistently to enable better reporting
2. **Document All Changes**: Record all significant updates in the ticket history table
3. **Set Realistic Due Dates**: Consider maintenance type and priority when scheduling
4. **Regular Monitoring**: Use the system to track aging tickets and identify bottlenecks
5. **Preventive Maintenance**: Schedule recurring maintenance tasks to prevent costly emergency repairs

The PropEase Maintenance Management System transforms reactive maintenance into a strategic process, improving tenant satisfaction while optimizing operational efficiency across your property portfolio.