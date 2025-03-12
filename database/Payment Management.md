# PropEase Payment Management System

The PropEase Payment Management System provides a comprehensive solution for tracking, processing, and managing all financial transactions within your property management operations. This system centralizes payment processing, bank account management, and transaction history, enabling property managers to effectively handle both one-time and recurring payments.

## Core Components

The payment system consists of six integrated tables:

1. **bank_account_types** - Categorizes different types of banking accounts with customizable classifications
2. **bank_accounts** - Stores banking information for processing payments and tracking balances
3. **payment_categories** - Organizes payments into standardized or custom categories
4. **payment_methods** - Tracks various payment methods accepted by your organization
5. **payments** - The central table recording all payment transactions
6. **payment_schedules** - Manages recurring payment configurations

## Payment Management Tables

### bank_account_types

**Purpose**: Provides a classification system for different types of bank accounts.

**Key Fields**:

- `id` - Unique identifier for each account type
- `name` - Type name (Operations, Trust Account, Deposit Account, etc.)
- `description` - Detailed explanation of the account type's purpose
- `organization_id` - References the owning organization
- `is_predefined` - Indicates if it's a system-defined type or custom

**Workflow**:

1. System comes with predefined account types (Operations, Trust, Deposit, Reserve)
2. Users can create custom account types for specialized banking needs
```sql
-- Example: Creating a custom account type
INSERT INTO bank_account_types (name, description, organization_id, is_predefined)
VALUES ('Utility Escrow', 'For holding utility payment reserves', 'org-uuid', false);
```


### bank_accounts

**Purpose**: Stores details of all bank accounts connected to the property management system.

**Key Fields**:

- `id` - Unique identifier for each bank account
- `account_name` - Descriptive name for the account
- `bank_name` - Name of the banking institution
- `account_number` - Bank account number (stored securely)
- `routing_number` - Bank routing number
- `account_type_id` - References the account type
- `balance_available` - Available balance
- `balance_current` - Current balance including pending transactions
- `last_synced` - When account was last synchronized with banking data
- `status` - Current status (active, inactive, pending)
- `organization_id` - References the owning organization

**Workflow**:

1. Connect bank accounts to the system
2. Assign appropriate account types
3. Use for sending and receiving payments
4. Track balances and reconcile transactions
```sql
-- Example: Adding a new bank account
INSERT INTO bank_accounts (
  organization_id, account_name, account_number, routing_number, 
  bank_name, account_type_id, created_by, status
)
VALUES (
  'org-uuid', 'Main Operations Account', '1234567890', '021000021',
  'Chase Bank', 'operations-type-uuid', 'admin-uuid', 'active'
);
```


### payment_categories

**Purpose**: Standardizes payment categories for better organization and reporting.

**Key Fields**:

- `id` - Unique identifier for each category
- `name` - Category name (Rent, Security Deposit, Maintenance, etc.)
- `description` - Detailed explanation of the category
- `organization_id` - References the owning organization
- `is_predefined` - Indicates if it's a system-defined category or custom

**Workflow**:

1. System comes with predefined categories (Rent, Security Deposit, Maintenance)
2. Users can create custom categories for specialized payment types
3. Use categories when recording payments for accurate financial reporting
```sql
-- Example: Creating a custom payment category
INSERT INTO payment_categories (name, description, organization_id, is_predefined)
VALUES ('Pet Fees', 'Monthly fees for tenant pets', 'org-uuid', false);
```


### payment_methods

**Purpose**: Tracks different methods used for processing payments.

**Key Fields**:

- `id` - Unique identifier for each payment method
- `name` - Method name (Bank Transfer, Credit Card, Check, etc.)
- `description` - Detailed explanation of the payment method
- `organization_id` - References the owning organization

**Workflow**:

1. Define accepted payment methods for your organization
2. Reference these methods when recording payments
3. Track usage patterns for different payment methods
```sql
-- Example: Adding a payment method
INSERT INTO payment_methods (name, description, organization_id)
VALUES ('ACH Transfer', 'Direct bank-to-bank ACH payment', 'org-uuid');
```


### payments

**Purpose**: Records all payment transactions in the system.

**Key Fields**:

- `id` - Unique identifier for each payment
- `payment_date` - When the payment occurred
- `amount` - Payment amount
- `payment_type` - One-time or recurring
- `category_id` - References the payment category
- `bank_account_id` - References the bank account used
- `payment_method_id` - References the payment method used
- `lease_id` - Associated lease (if applicable)
- `transaction_id` - External transaction reference
- `status` - Payment status (pending, completed, failed, etc.)
- `next_scheduled_date` - For recurring payments
- `recipient_type` - Type of payment recipient
- `recipient_id` - ID of the recipient
- `organization_id` - References the owning organization

**Workflow**:

1. Create payment records for all financial transactions
2. Link to appropriate related entities (leases, bank accounts)
3. Update status as payment progresses
4. Track payment history for reporting
```sql
-- Example: Recording a rent payment
INSERT INTO payments (
  payment_date, amount, payment_type, category_id, bank_account_id,
  payment_method_id, lease_id, status, organization_id
)
VALUES (
  CURRENT_DATE, 1500.00, 'one-time', 'rent-category-uuid', 
  'bank-account-uuid', 'ach-method-uuid', 'lease-uuid', 'completed', 'org-uuid'
);
```


### payment_schedules

**Purpose**: Manages recurring payment configurations.

**Key Fields**:

- `id` - Unique identifier for each schedule
- `organization_id` - References the owning organization
- `lease_id` - Associated lease (if applicable)
- `bank_account_id` - Bank account for processing
- `amount` - Payment amount
- `frequency` - How often payment recurs (monthly, weekly, etc.)
- `start_date` - When recurring payments begin
- `end_date` - When recurring payments end (optional)
- `next_schedule_date` - Next payment date
- `day_of_month` - For monthly payments, which day they occur
- `active` - Whether this schedule is currently active

**Workflow**:

1. Create schedules for recurring payments (like rent)
2. System generates payment records based on schedule
3. Update schedule if payment terms change
4. Deactivate schedule when it's no longer needed
```sql
-- Example: Setting up monthly rent payment schedule
INSERT INTO payment_schedules (
  organization_id, lease_id, bank_account_id, amount, frequency,
  start_date, day_of_month, next_schedule_date, category_id, created_by
)
VALUES (
  'org-uuid', 'lease-uuid', 'bank-account-uuid', 1500.00, 'monthly',
  '2025-04-01', 1, '2025-04-01', 'rent-category-uuid', 'admin-uuid'
);
```


## How the Tables Relate to Each Other

The payment system is designed with these key relationships:

1. **Bank Account Relationships**:
    - `bank_accounts` references `bank_account_types` to categorize accounts
    - `payments` references `bank_accounts` to track which account processed the payment
    - `payment_schedules` references `bank_accounts` for recurring payment processing
2. **Payment Classification**:
    - `payments` references `payment_categories` to categorize transactions
    - `payments` references `payment_methods` to track how payments were made
    - `payment_schedules` references `payment_categories` for consistent categorization
3. **Integration with Lease System**:
    - `payments` references `leases` to connect payments with rental agreements
    - `payment_schedules` references `leases` to set up recurring rent payments
4. **Organization Context**:
    - All tables include `organization_id` to support multi-tenant functionality
    - This enables organization-specific reporting and data segregation

## Common Payment Workflows

### Recording a One-Time Payment

1. **Manual Payment Entry**:

```sql
INSERT INTO payments (
  payment_date, amount, payment_type, category_id, bank_account_id,
  payment_method_id, lease_id, status, organization_id
)
VALUES (
  CURRENT_DATE, 1200.00, 'one-time', 'rent-category-uuid', 
  'bank-account-uuid', 'check-method-uuid', 'lease-uuid', 'completed', 'org-uuid'
);
```

2. **Update Lease Balance** (if applicable):

```sql
UPDATE leases 
SET currentbalance = currentbalance - 1200.00,
    lastpaymentdate = CURRENT_DATE,
    nextpaymentdate = CURRENT_DATE + INTERVAL '1 month'
WHERE id = 'lease-uuid';
```


### Setting Up Recurring Payments

1. **Create Payment Schedule**:

```sql
INSERT INTO payment_schedules (
  organization_id, lease_id, bank_account_id, amount, frequency,
  start_date, day_of_month, next_schedule_date, category_id, created_by
)
VALUES (
  'org-uuid', 'lease-uuid', 'bank-account-uuid', 1500.00, 'monthly',
  '2025-04-01', 1, '2025-04-01', 'rent-category-uuid', 'admin-uuid'
);
```

2. **System Automatically Creates Payments**:
When the scheduled date arrives, the system generates a payment record:

```sql
INSERT INTO payments (
  payment_date, amount, payment_type, category_id, bank_account_id,
  payment_method_id, lease_id, status, organization_id
)
VALUES (
  CURRENT_DATE, 1500.00, 'recurring', 'rent-category-uuid', 
  'bank-account-uuid', 'ach-method-uuid', 'lease-uuid', 'completed', 'org-uuid'
);
```

3. **Update Schedule for Next Payment**:

```sql
UPDATE payment_schedules
SET next_schedule_date = next_schedule_date + INTERVAL '1 month',
    last_run_date = CURRENT_DATE
WHERE id = 'schedule-uuid';
```


### Processing Security Deposits

1. **Record Initial Security Deposit**:

```sql
INSERT INTO payments (
  payment_date, amount, payment_type, category_id, bank_account_id,
  payment_method_id, lease_id, status, organization_id
)
VALUES (
  CURRENT_DATE, 1500.00, 'one-time', 'security-deposit-category-uuid', 
  'trust-account-uuid', 'check-method-uuid', 'lease-uuid', 'completed', 'org-uuid'
);
```

2. **Update Lease Record**:

```sql
UPDATE leases 
SET securitydeposit = 1500.00
WHERE id = 'lease-uuid';
```


## Best Practices

1. **Use Appropriate Categories** - Consistently categorize payments for accurate financial reporting.
2. **Separate Bank Accounts** - Use different account types for different purposes (operations vs. security deposits).
3. **Reconcile Regularly** - Compare bank statements with payment records for accuracy.
4. **Document Special Circumstances** - Use descriptions and metadata to explain unusual payment situations.
5. **Monitor Payment Schedules** - Regularly review active payment schedules to ensure they remain valid.
6. **Track Failed Payments** - Update payment status promptly and follow up on failed transactions.
7. **Security Considerations** - Implement encryption and access controls for sensitive banking information.

The PropEase Payment Management System transforms transaction processing from manual record-keeping into a streamlined, automated system that improves financial visibility while ensuring accurate payment tracking and reporting.