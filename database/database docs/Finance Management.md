# PropEase Finance Management System

The PropEase Finance Management System provides a comprehensive solution for managing all property-related financial activities. This system centralizes income tracking, expense management, invoice generation, and financial reporting, enabling property managers to effectively monitor cash flow, track payments, and maintain accurate financial records across their property portfolio.

## Core Components

The finance management system consists of five integrated tables:

1. **invoices** - The central table storing invoice details including amounts, due dates, and status
2. **invoice_items** - Itemized entries for each invoice with detailed pricing information
3. **expenses** - Records all outgoing costs with categorization and property association
4. **invoice_payments** - Links payments to invoices, tracking partial and complete payments
5. **financial_summaries** - Provides period-based financial overviews for properties and organizations

## Finance Management Tables

### invoices

**Purpose**: Stores core invoice information including client details, amounts, and payment status.

**Key Fields**:

- id - Unique identifier for each invoice
- invoice_number - Human-readable invoice reference number
- organization_id - References the owning organization
- client_name - Name of the invoice recipient
- client_id - References the client entity (if in system)
- client_type - Categorizes recipient (tenant, vendor, other)
- issue_date - When the invoice was created
- due_date - When payment is required
- amount_total - Total amount to be paid
- amount_paid - Amount already received
- amount_due - Calculated remaining balance
- status - Current state (draft, sent, paid, overdue)
- pdf_url - Link to generated invoice document
- property_id - Property the invoice relates to (if applicable)

**Workflow**:

1. Create invoice with client information and due date
2. Add line items with descriptions and amounts
3. Generate PDF and update invoice status to "sent"
4. Record payments as they are received
5. System automatically updates status based on due date and payments
```sql
-- Example: Creating a new invoice
INSERT INTO invoices (
  invoice_number, organization_id, client_name, client_type, 
  issue_date, due_date, amount_total, status, property_id, created_by
) VALUES (
  'INV-2025-001', 'org-uuid', 'John Smith', 'tenant',
  '2025-03-11', '2025-03-25', 1200.00, 'draft', 'property-uuid', 'user-uuid'
);
```


### invoice_items

**Purpose**: Itemizes individual line items within each invoice for detailed financial tracking.

**Key Fields**:

- id - Unique identifier for each line item
- invoice_id - References the parent invoice
- description - Details of the item or service
- quantity - Number of units
- unit_price - Price per unit
- amount - Total amount (quantity × unit_price)
- tax_rate - Applicable tax percentage
- tax_amount - Calculated tax amount

**Workflow**:

1. For each invoice, add all relevant items with descriptions
2. System calculates line item totals and updates invoice amount
3. Items are displayed on the generated invoice document
```sql
-- Example: Adding items to an invoice
INSERT INTO invoice_items (
  invoice_id, description, quantity, unit_price, amount, tax_rate, tax_amount
) VALUES (
  'invoice-uuid', 'Monthly Rent - April 2025', 1, 1000.00, 1000.00, 0, 0
), (
  'invoice-uuid', 'Utility Charges', 1, 200.00, 200.00, 0, 0
);
```


### expenses

**Purpose**: Tracks all organizational expenses with categorization and property association.

**Key Fields**:

- id - Unique identifier for each expense
- organization_id - References the owning organization
- expense_date - When the expense occurred
- payee - Who received the payment
- amount - Cost amount
- category_id - References expense category
- payment_method_id - How the expense was paid
- description - Details about the expense
- receipt_url - Link to receipt document
- property_id - Property the expense relates to (if applicable)

**Workflow**:

1. Record expenses as they occur with proper categorization
2. Attach receipt documentation for audit purposes
3. Associate expenses with properties for property-level financial tracking
4. Analyze expenses by category, property, and time period
```sql
-- Example: Recording a maintenance expense
INSERT INTO expenses (
  organization_id, expense_date, payee, amount, category_id, 
  description, property_id, created_by
) VALUES (
  'org-uuid', '2025-03-10', 'Acme Plumbing Services', 350.00, 'maintenance-category-uuid',
  'Emergency pipe repair in unit 203', 'property-uuid', 'user-uuid'
);
```


### invoice_payments

**Purpose**: Links payments to specific invoices, allowing for partial payments and payment tracking.

**Key Fields**:

- id - Unique identifier for each payment record
- invoice_id - References the invoice being paid
- payment_id - References the payment record
- amount_applied - Amount of payment applied to this invoice

**Workflow**:

1. When payments are received, create payment record in payments table
2. Link payment to specific invoice(s) through invoice_payments
3. Update invoice amount_paid based on linked payments
4. System recalculates amount_due and potentially updates status
```sql
-- Example: Recording a payment against an invoice
INSERT INTO invoice_payments (
  invoice_id, payment_id, amount_applied
) VALUES (
  'invoice-uuid', 'payment-uuid', 500.00
);
```


### financial_summaries

**Purpose**: Provides aggregated financial data for specific time periods and properties.

**Key Fields**:

- id - Unique identifier for each summary record
- organization_id - References the owning organization
- property_id - Property the summary relates to (optional)
- period_start - Beginning of the reporting period
- period_end - End of the reporting period
- total_income - Sum of all income during period
- total_expenses - Sum of all expenses during period
- net_revenue - Calculated income minus expenses
- outstanding_invoices - Total unpaid invoices at period end
- upcoming_payables - Expected future expenses

**Workflow**:

1. System generates summaries on scheduled intervals (monthly, quarterly)
2. Financial data is aggregated from invoices, payments, and expenses
3. Summaries provide high-level financial metrics for dashboard
4. Historical summaries enable trend analysis
```sql
-- Example: Creating a monthly financial summary
INSERT INTO financial_summaries (
  organization_id, property_id, period_start, period_end,
  total_income, total_expenses, outstanding_invoices, upcoming_payables
) VALUES (
  'org-uuid', 'property-uuid', '2025-03-01', '2025-03-31',
  15000.00, 6500.00, 1200.00, 800.00
);
```


## Benefits

1. **Complete Financial Tracking** - Track all income and expenses in one centralized system
2. **Detailed Invoicing** - Generate professional invoices with itemized line items
3. **Property-Level Reporting** - Associate financial data with specific properties
4. **Payment Monitoring** - Track outstanding amounts and upcoming due dates
5. **Financial Analysis** - Generate reports and visualize financial performance
6. **Integration with Banking** - Connect with payment systems and bank accounts
7. **Audit Trail** - Maintain comprehensive records for accounting and tax purposes

## Best Practices

1. **Consistent Categorization** - Use expense categories consistently for accurate reporting
2. **Regular Reconciliation** - Compare financial records with bank statements regularly
3. **Prompt Invoicing** - Create and send invoices promptly to improve cash flow
4. **Digital Documentation** - Attach receipts and supporting documents to all transactions
5. **Period Closings** - Perform monthly or quarterly financial reviews and generate summaries
6. **Data Validation** - Verify financial data accuracy with regular audits
7. **Tax Preparation** - Maintain organized records to simplify tax filing

The PropEase Finance Management System transforms financial operations from disconnected spreadsheets and paper records into a streamlined, integrated process that improves financial visibility while ensuring accurate record-keeping across your property portfolio.