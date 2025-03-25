# PropEase Database Documentation

This document provides an overview of the key lease management tables and how to interact with them.

## Lease Management Tables

### leases

**Purpose**: Stores the core lease agreement information between tenants and property units.

**Key Fields**:

- `id`: Unique identifier for each lease
- `tenant_id`: References the tenant
- `unit_id`: References the property unit
- `start_date`: When the lease begins
- `end_date`: When the lease expires
- `rent_amount`: Monthly rent
- `security_deposit`: Security deposit amount
- `lease_terms`: Text describing specific terms
- `document_status`: Tracks the status of the lease document ('draft', 'sent', 'signed', etc.)
- `current_balance`: Running balance for the tenant
- `payment_day`: Day of month when rent is due
- `late_fee_amount`: Amount charged for late payments
- `late_fee_days`: Days after due date when late fees are assessed

**Workflow**:

1. Create a lease when a tenant agrees to rent a unit
2. Update document_status as the lease progresses through signing
3. Update payment fields (last_payment_date, next_payment_date) when payments are made
4. Track current_balance for financial reporting
```sql
-- Example: Creating a new lease
INSERT INTO leases (
  tenant_id, unit_id, start_date, end_date, 
  rent_amount, security_deposit, payment_day,
  document_status
) VALUES (
  'tenant-uuid', 'unit-uuid', '2025-04-01', '2026-03-31', 
  1500.00, 1500.00, 1, 'draft'
);
```


### lease_addendums

**Purpose**: Records modifications to existing lease agreements without creating entirely new leases.

**Key Fields**:

- `id`: Unique identifier for each addendum
- `lease_id`: References the original lease being modified
- `title`: Short description of the addendum
- `description`: Full details of the modification
- `effective_date`: When the changes take effect
- `document_url`: Link to the signed addendum document
- `created_by`: User who created the addendum

**Workflow**:

1. Create an addendum when lease terms need modification
2. Store the signed document URL after signatures are collected
3. Update the effective_date when the changes become active
```sql
-- Example: Adding a pet policy addendum
INSERT INTO lease_addendums (
  lease_id, title, description, effective_date, created_by
) VALUES (
  'lease-uuid', 
  'Pet Policy Update', 
  'Tenant is permitted to have one cat with additional pet deposit of $300', 
  '2025-05-01',
  'admin-user-uuid'
);
```


### lease_renewals

**Purpose**: Tracks the history of lease renewals, connecting original leases to their renewals.

**Key Fields**:

- `id`: Unique identifier for each renewal record
- `original_lease_id`: References the expiring lease
- `new_lease_id`: References the new renewal lease
- `renewal_date`: When the renewal was processed
- `rent_change`: Amount of increase/decrease in rent
- `renewal_term`: Duration of the new lease in months
- `status`: Tracks the renewal process ('pending', 'approved', 'declined')

**Workflow**:

1. Create renewal record when approaching end_date of original lease
2. Set status to 'pending' when offering renewal to tenant
3. Update status to 'approved' when tenant accepts
4. Create a new lease record, then link it via new_lease_id
5. Set status to 'declined' if tenant rejects renewal
```sql
-- Example: Starting the renewal process
INSERT INTO lease_renewals (
  original_lease_id, renewal_date, rent_change, renewal_term, status
) VALUES (
  'original-lease-uuid', '2025-03-01', 50.00, 12, 'pending'
);

-- After tenant accepts and new lease is created:
UPDATE lease_renewals
SET status = 'approved', new_lease_id = 'new-lease-uuid'
WHERE id = 'renewal-record-uuid';
```



