# Supabase Database Schema Documentation

This document provides an overview of the database schema for the PropEase property management system.
Last updated: Sat Mar 22 03:05:55 PM +03 2025

## Tables
### activity_logs                                                                           +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **property_id**: uuid                                                                     +
- **created_at**: timestamp with time zone, default now()                                   +
- **unit_id**: uuid                                                                         +
- **organization_id**: uuid, required                                                       +
- **description**: text, required                                                           +
- **activity_type**: character varying(100), required                                       +
- **metadata**: jsonb                                                                       +
- **user_id**: uuid                                                                         +

### announcement_schedules                                                                  +
- **start_date**: timestamp with time zone, required                                        +
- **repeat_on**: jsonb                                                                      +
- **time_of_day**: time without time zone, required                                         +
- **announcement_id**: uuid, required                                                       +
- **end_date**: timestamp with time zone                                                    +
- **created_at**: timestamp with time zone, required, default now()                         +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **next_run**: timestamp with time zone, required                                          +
- **repeat_frequency**: text                                                                +
- **id**: uuid, required, default gen_random_uuid()                                         +

### announcement_targets                                                                    +
- **target_type**: text, required                                                           +
- **created_at**: timestamp with time zone, required, default now()                         +
- **target_name**: text                                                                     +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **announcement_id**: uuid, required                                                       +
- **target_id**: uuid                                                                       +

### announcement_types                                                                      +
- **created_at**: timestamp with time zone, required, default now()                         +
- **organization_id**: uuid, required                                                       +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **description**: text                                                                     +
- **name**: text, required                                                                  +

### announcements                                                                           +
- **property_id**: uuid                                                                     +
- **content**: text, required                                                               +
- **created_at**: timestamp with time zone, required, default now()                         +
- **announcement_type_id**: uuid                                                            +
- **issue_date**: timestamp with time zone                                                  +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **author_id**: uuid, required                                                             +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **organization_id**: uuid, required                                                       +
- **is_scheduled**: boolean, required, default false                                        +
- **title**: text, required                                                                 +
- **communication_method**: ARRAY, required                                                 +
- **status**: text, required, default 'draft'text                                           +

### bank_account_types                                                                      +
- **description**: text                                                                     +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **organization_id**: uuid, required                                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **name**: character varying(100), required                                                +
- **is_predefined**: boolean, default false                                                 +

### bank_accounts                                                                           +
- **external_id**: character varying(255)                                                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **account_name**: character varying(255), required                                        +
- **routing_number**: character varying(50)                                                 +
- **institution_id**: character varying(255)                                                +
- **created_by**: uuid, required                                                            +
- **balance_current**: numeric(12,2), default 0                                             +
- **organization_id**: uuid, required                                                       +
- **currency**: character varying(10), default 'USD'character varying                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **bank_name**: character varying(255), required                                           +
- **last_synced**: timestamp with time zone                                                 +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **account_number**: character varying(255), required                                      +
- **is_default**: boolean, default false                                                    +
- **account_type_id**: uuid, required                                                       +
- **status**: character varying(50), default 'active'character varying                      +
- **balance_available**: numeric(12,2), default 0                                           +
- **metadata**: jsonb                                                                       +

### communication_logs                                                                      +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **sent_at**: timestamp with time zone                                                     +
- **recipient_type**: text, required                                                        +
- **message_type**: text, required                                                          +
- **recipient_id**: uuid, required                                                          +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **organization_id**: uuid, required                                                       +
- **error_message**: text                                                                   +
- **content**: text, required                                                               +
- **created_at**: timestamp with time zone, required, default now()                         +
- **read_at**: timestamp with time zone                                                     +
- **status**: text, required, default 'queued'text                                          +
- **announcement_id**: uuid                                                                 +
- **method**: text, required                                                                +
- **subject**: text                                                                         +
- **sender_id**: uuid                                                                       +
- **delivered_at**: timestamp with time zone                                                +

### demo_requests                                                                           +
- **industry**: character varying(100)                                                      +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **job_title**: character varying(100)                                                     +
- **additional_comments**: text                                                             +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **phone**: character varying(50)                                                          +
- **company_size**: character varying(50)                                                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **company_name**: character varying(255), required                                        +
- **demo_preferences**: text                                                                +
- **full_name**: character varying(255), required                                           +
- **email**: character varying(255), required                                               +
- **country**: character varying(100)                                                       +

### documents                                                                               +
- **related_to_id**: uuid, required                                                         +
- **uploaded_by**: uuid                                                                     +
- **related_to_type**: character varying(50), required                                      +
- **document_type**: character varying(100), required                                       +
- **document_url**: text, required                                                          +
- **updated_at**: timestamp without time zone, default now()                                +
- **organization_id**: uuid                                                                 +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp without time zone, default now()                                +
- **document_name**: character varying(255), required                                       +

### expenses                                                                                +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **receipt_url**: text                                                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **expense_date**: date, required                                                          +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **payment_method_id**: uuid                                                               +
- **created_by**: uuid, required                                                            +
- **payee**: character varying(255), required                                               +
- **category_id**: uuid, required                                                           +
- **organization_id**: uuid, required                                                       +
- **property_id**: uuid                                                                     +
- **amount**: numeric(12,2), required                                                       +
- **status**: character varying(50), default 'recorded'character varying                    +
- **description**: text                                                                     +
- **unit_id**: uuid                                                                         +

### financial_summaries                                                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **upcoming_payables**: numeric(12,2), default 0                                           +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **net_revenue**: numeric(12,2)                                                            +
- **period_end**: date, required                                                            +
- **period_start**: date, required                                                          +
- **outstanding_invoices**: numeric(12,2), default 0                                        +
- **organization_id**: uuid, required                                                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **total_expenses**: numeric(12,2), default 0                                              +
- **property_id**: uuid                                                                     +
- **total_income**: numeric(12,2), default 0                                                +

### invoice_items                                                                           +
- **invoice_id**: uuid, required                                                            +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **tax_rate**: numeric(5,2), default 0                                                     +
- **tax_amount**: numeric(12,2), default 0                                                  +
- **description**: text, required                                                           +
- **quantity**: numeric(10,2), required, default 1                                          +
- **unit_price**: numeric(12,2), required                                                   +
- **amount**: numeric(12,2), required                                                       +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **id**: uuid, required, default gen_random_uuid()                                         +

### invoice_payments                                                                        +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **payment_id**: uuid, required                                                            +
- **invoice_id**: uuid, required                                                            +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **amount_applied**: numeric(12,2), required                                               +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### invoices                                                                                +
- **pdf_url**: text                                                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **client_id**: uuid                                                                       +
- **due_date**: date, required                                                              +
- **client_type**: character varying(50), required                                          +
- **unit_id**: uuid                                                                         +
- **property_id**: uuid                                                                     +
- **client_name**: character varying(255), required                                         +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **invoice_number**: character varying(50), required                                       +
- **organization_id**: uuid, required                                                       +
- **amount_paid**: numeric(12,2), default 0                                                 +
- **status**: character varying(50), required, default 'draft'character varying             +
- **notes**: text                                                                           +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **created_by**: uuid, required                                                            +
- **amount_total**: numeric(12,2), required                                                 +
- **amount_due**: numeric(12,2)                                                             +
- **issue_date**: date, required                                                            +

### lease_addendums                                                                         +
- **created_at**: timestamp without time zone, default now()                                +
- **created_by**: uuid                                                                      +
- **title**: character varying(255), required                                               +
- **lease_id**: uuid, required                                                              +
- **effective_date**: date, required                                                        +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **description**: text                                                                     +
- **document_url**: text                                                                    +
- **updated_at**: timestamp without time zone, default now()                                +

### lease_renewals                                                                          +
- **original_lease_id**: uuid, required                                                     +
- **renewal_date**: date, required                                                          +
- **notes**: text                                                                           +
- **created_at**: timestamp without time zone, default now()                                +
- **new_lease_id**: uuid                                                                    +
- **rent_change**: numeric                                                                  +
- **renewal_term**: integer(32,0)                                                           +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **status**: character varying(50), default 'pending'character varying                     +
- **updated_at**: timestamp without time zone, default now()                                +

### leases                                                                                  +
- **current_balance**: numeric, default 0                                                   +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **document_status**: character varying(50), default 'draft'character varying              +
- **late_fee_days**: integer(32,0), default 5                                               +
- **late_fee_amount**: numeric, default 0                                                   +
- **lease_document_url**: text                                                              +
- **end_date**: date, required                                                              +
- **security_deposit**: numeric(10,2)                                                       +
- **tenant_id**: uuid, required                                                             +
- **created_at**: timestamp without time zone, default now()                                +
- **next_payment_date**: date                                                               +
- **start_date**: date, required, default now()                                             +
- **lease_terms**: text                                                                     +
- **rent_amount**: numeric(12,2), required                                                  +
- **is_auto_renew**: boolean, default false                                                 +
- **last_payment_date**: date                                                               +
- **notice_period_days**: integer(32,0), default 30                                         +
- **updated_at**: timestamp without time zone, default now()                                +
- **payment_day**: integer(32,0)                                                            +
- **unit_id**: uuid, required                                                               +
- **status**: character varying(50), default 'Pending'character varying                     +

### maintenance_comments                                                                    +
- **created_at**: timestamp without time zone, default now()                                +
- **commented_by**: uuid                                                                    +
- **updated_at**: timestamp without time zone, default now()                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **ticket_id**: uuid, required                                                             +
- **comment**: text, required                                                               +

### maintenance_requests                                                                    +
- **assigned_to**: uuid                                                                     +
- **scheduled_date**: timestamp without time zone                                           +
- **status**: character varying(50), default 'pending'character varying                     +
- **completed_at**: timestamp with time zone                                                +
- **tenant_id**: uuid                                                                       +
- **priority**: character varying(50), required                                             +
- **property_id**: uuid                                                                     +
- **due_date**: timestamp without time zone                                                 +
- **unit_id**: uuid                                                                         +
- **related_to_type**: character varying(50)                                                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **maintenance_type**: character varying(100)                                              +
- **description**: text, required                                                           +
- **maintenance_type_id**: uuid                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **owner_id**: uuid                                                                        +
- **title**: character varying(255), required                                               +
- **related_to_id**: uuid                                                                   +

### maintenance_ticket_history                                                              +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **changed_by**: uuid                                                                      +
- **new_status**: character varying(50)                                                     +
- **change_description**: text, required                                                    +
- **ticket_id**: uuid, required                                                             +
- **created_at**: timestamp without time zone, default now()                                +
- **previous_status**: character varying(50)                                                +

### maintenance_types                                                                       +
- **estimated_resolution_time**: integer(32,0)                                              +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **organization_id**: uuid, required                                                       +
- **is_emergency**: boolean, default false                                                  +
- **created_at**: timestamp without time zone, default now()                                +
- **name**: character varying(100), required                                                +
- **updated_at**: timestamp without time zone, default now()                                +
- **description**: text                                                                     +

### notifications                                                                           +
- **type**: character varying(50), required                                                 +
- **title**: character varying(255), required                                               +
- **user_id**: uuid                                                                         +
- **read**: boolean, default false                                                          +
- **message**: text, required                                                               +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### organization_invitations                                                                +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **status**: character varying(20), default 'pending'character varying                     +
- **expires_at**: timestamp with time zone, required                                        +
- **role_id**: uuid, required                                                               +
- **organization_id**: uuid, required                                                       +
- **updated_at**: timestamp with time zone, default now()                                   +
- **invited_by**: uuid, required                                                            +
- **token**: character varying(255)                                                         +
- **email**: character varying(255), required                                               +
- **created_at**: timestamp with time zone, default now()                                   +

### organizations                                                                           +
- **name**: character varying(255), required                                                +
- **date_format**: character varying(20), default 'YYYY-MM-DD'character varying             +
- **active**: boolean, default true                                                         +
- **timezone**: character varying(50), default 'UTC'character varying                       +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **subscription_plan**: character varying(50)                                              +
- **email**: character varying(255)                                                         +
- **website**: character varying(255)                                                       +
- **currency**: character varying(10), default 'USD'character varying                       +
- **subscription_status**: character varying(50), default 'inactive'character varying       +
- **phone**: character varying(50)                                                          +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **billing_address**: text                                                                 +
- **logo_url**: text                                                                        +
- **tax_id**: character varying(50)                                                         +
- **billing_cycle**: character varying(20)                                                  +

### owner_properties                                                                        +
- **property_id**: uuid, required                                                           +
- **owner_id**: uuid, required                                                              +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### owners                                                                                  +
- **taxpayer_id**: character varying(50)                                                    +
- **address**: text                                                                         +
- **organization_id**: uuid, required                                                       +
- **email**: character varying(255)                                                         +
- **created_at**: timestamp without time zone, default now()                                +
- **status**: character varying(50), default 'active'character varying                      +
- **tax_id**: character varying(50)                                                         +
- **payment_method**: character varying(50)                                                 +
- **notes**: text                                                                           +
- **company_name**: character varying(255)                                                  +
- **phone**: character varying(50)                                                          +
- **bank_account_id**: uuid                                                                 +
- **last_name**: character varying(100)                                                     +
- **payment_schedule**: character varying(50), default 'monthly'character varying           +
- **user_id**: uuid                                                                         +
- **updated_at**: timestamp without time zone, default now()                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **owner_type**: character varying(50)                                                     +
- **first_name**: character varying(100)                                                    +

### payment_categories                                                                      +
- **organization_id**: uuid, required                                                       +
- **is_predefined**: boolean, default false                                                 +
- **name**: character varying(100), required                                                +
- **description**: text                                                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **id**: uuid, required, default gen_random_uuid()                                         +

### payment_methods                                                                         +
- **name**: character varying(100), required                                                +
- **description**: text                                                                     +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **organization_id**: uuid, required                                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### payment_schedules                                                                       +
- **created_by**: uuid, required                                                            +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **day_of_month**: integer(32,0)                                                           +
- **organization_id**: uuid, required                                                       +
- **last_run_date**: date                                                                   +
- **active**: boolean, default true                                                         +
- **amount**: numeric(10,2), required                                                       +
- **description**: text                                                                     +
- **end_date**: date                                                                        +
- **frequency**: character varying(50), required                                            +
- **bank_account_id**: uuid, required                                                       +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **category_id**: uuid                                                                     +
- **lease_id**: uuid                                                                        +
- **start_date**: date, required                                                            +
- **next_schedule_date**: date, required                                                    +

### payment_transactions                                                                    +
- **organization_id**: uuid, required                                                       +
- **status**: character varying(50), default 'pending'character varying                     +
- **transaction_date**: timestamp with time zone, default CURRENT_TIMESTAMP                 +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **external_id**: character varying(255)                                                   +
- **amount**: numeric(10,2), required                                                       +
- **payment_id**: uuid, required                                                            +
- **gateway_response**: jsonb                                                               +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### payments                                                                                +
- **payment_date**: date, required                                                          +
- **lease_id**: uuid                                                                        +
- **next_scheduled_date**: date                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **payment_method_id**: uuid                                                               +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **category_id**: uuid                                                                     +
- **recipient_id**: uuid                                                                    +
- **recipient_type**: character varying(50)                                                 +
- **status**: character varying(50), default 'pending'character varying                     +
- **created_by**: uuid                                                                      +
- **payment_type**: character varying(50), default 'one-time'character varying              +
- **amount**: numeric(12,2), required                                                       +
- **organization_id**: uuid, required                                                       +
- **bank_account_id**: uuid                                                                 +
- **transaction_id**: character varying(255)                                                +
- **invoice_id**: uuid                                                                      +

### properties                                                                              +
- **property_type**: character varying(50), required, default 'residential'character varying+
- **last_activity_date**: timestamp with time zone                                          +
- **occupancy_rate**: numeric, default 0                                                    +
- **state**: character varying(100), required                                               +
- **city**: character varying(100), required                                                +
- **zip_code**: character varying(20), required                                             +
- **owner_id**: uuid                                                                        +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp without time zone, default now()                                +
- **status**: character varying(50), default 'active'character varying                      +
- **monthly_revenue**: numeric, default 0                                                   +
- **active_leases**: integer(32,0), default 0                                               +
- **organization_id**: uuid, required                                                       +
- **address**: text, required                                                               +
- **total_units**: integer(32,0), required                                                  +
- **name**: character varying(255), required                                                +
- **updated_at**: timestamp without time zone, default now()                                +

### property_images                                                                         +
- **property_id**: uuid, required                                                           +
- **image_url**: text, required                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### property_inspections                                                                    +
- **status**: text, required, default 'scheduled'text                                       +
- **inspector_id**: uuid                                                                    +
- **report_url**: text                                                                      +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **notes**: text                                                                           +
- **unit_id**: uuid                                                                         +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **organization_id**: uuid, required                                                       +
- **property_id**: uuid                                                                     +
- **inspection_date**: timestamp with time zone, required                                   +

### property_managers                                                                       +
- **user_id**: uuid                                                                         +
- **organization_id**: uuid                                                                 +
- **updated_at**: timestamp without time zone, default now()                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **assigned_properties**: ARRAY, default '{}'uuid[]                                        +
- **created_at**: timestamp without time zone, default now()                                +

### property_metrics                                                                        +
- **property_id**: uuid, required                                                           +
- **active_leases**: integer(32,0), default 0                                               +
- **net_revenue**: numeric(12,2)                                                            +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **maintenance_costs**: numeric, default 0                                                 +
- **outstanding_rent**: numeric, default 0                                                  +
- **total_income**: numeric(12,2), default 0                                                +
- **created_at**: timestamp with time zone, default now()                                   +
- **outstanding_invoices**: numeric(12,2), default 0                                        +
- **collected_rent**: numeric, default 0                                                    +
- **monthly_revenue**: numeric, default 0                                                   +
- **metric_date**: date, required                                                           +
- **operational_costs**: numeric, default 0                                                 +
- **total_expenses**: numeric(12,2), default 0                                              +
- **occupancy_rate**: numeric, default 0                                                    +

### property_stakeholders                                                                   +
- **start_date**: date, required                                                            +
- **stakeholder_type**: character varying(50), required                                     +
- **user_id**: uuid, required                                                               +
- **notes**: text                                                                           +
- **end_date**: date                                                                        +
- **is_primary**: boolean, default false                                                    +
- **ownership_percentage**: numeric, default 100                                            +
- **created_at**: timestamp with time zone, default now()                                   +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **property_id**: uuid, required                                                           +
- **updated_at**: timestamp with time zone, default now()                                   +

### rental_application_documents                                                            +
- **file_name**: text, required                                                             +
- **rental_application_id**: uuid, required                                                 +
- **uploaded_by**: uuid, required                                                           +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **file_path**: text, required                                                             +
- **file_type**: text, required                                                             +
- **uploaded_at**: timestamp with time zone, default now()                                  +

### rental_applications                                                                     +
- **property_id**: uuid                                                                     +
- **monthly_income**: numeric                                                               +
- **rejection_reason**: text                                                                +
- **organization_id**: uuid, required                                                       +
- **lease_term**: integer(32,0)                                                             +
- **desired_move_in_date**: date                                                            +
- **is_employed**: boolean, required, default false                                         +
- **credit_check_status**: character varying(50)                                            +
- **created_at**: timestamp with time zone, default now()                                   +
- **vehicle_details**: jsonb                                                                +
- **id_type**: character varying(50)                                                        +
- **expiry_date**: date                                                                     +
- **application_date**: timestamp with time zone, default now()                             +
- **unit_id**: uuid                                                                         +
- **updated_at**: timestamp with time zone, default now()                                   +
- **notes**: text                                                                           +
- **applicant_id**: bigint(64,0), required                                                  +
- **review_date**: timestamp with time zone                                                 +
- **applicant_name**: character varying(255), required                                      +
- **applicant_email**: character varying(255)                                               +
- **employment_info**: jsonb                                                                +
- **preferred_contact_method**: ARRAY                                                       +
- **status**: character varying(50), default 'pending'character varying                     +
- **application_fee_paid**: boolean, default false                                          +
- **applicant_phone_number**: character varying(20)                                         +
- **previous_address**: text                                                                +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **pet_details**: jsonb                                                                    +
- **emergency_contact**: jsonb                                                              +
- **background_check_status**: character varying(50)                                        +
- **has_pets**: boolean, default false                                                      +
- **reviewed_by**: uuid                                                                     +
- **has_vehicles**: boolean, default false                                                  +

### roles                                                                                   +
- **updated_at**: timestamp with time zone, default now()                                   +
- **is_system_role**: boolean, default false                                                +
- **permissions**: jsonb                                                                    +
- **name**: character varying(50), required                                                 +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **description**: text                                                                     +

### tasks                                                                                   +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **owner_id**: uuid                                                                        +
- **priority**: character varying(50), required                                             +
- **title**: character varying(255), required                                               +
- **related_to_id**: uuid                                                                   +
- **assigned_to**: uuid                                                                     +
- **due_date**: timestamp without time zone                                                 +
- **organization_id**: uuid                                                                 +
- **status**: character varying(50), required, default 'pending'character varying           +
- **description**: text                                                                     +
- **type**: character varying(50)                                                           +
- **created_at**: timestamp without time zone, default now()                                +
- **updated_at**: timestamp without time zone, default now()                                +

### team_members                                                                            +
- **job_title**: character varying(100)                                                     +
- **department**: character varying(100)                                                    +
- **updated_at**: timestamp with time zone, default now()                                   +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **created_at**: timestamp with time zone, default now()                                   +
- **user_id**: uuid, required                                                               +
- **role_id**: uuid                                                                         +

### tenants                                                                                 +
- **background_check_passed**: boolean                                                      +
- **backgroundcheckdate**: date                                                             +
- **user_id**: uuid                                                                         +
- **eviction_history**: boolean, default false                                              +
- **organization_id**: uuid, required                                                       +
- **current_property_id**: uuid                                                             +
- **email**: character varying(255)                                                         +
- **vehicles**: jsonb                                                                       +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **phone**: character varying(50)                                                          +
- **pets**: jsonb                                                                           +
- **last_name**: character varying(100)                                                     +
- **status**: character varying(50), default 'active'character varying                      +
- **emergency_contact**: jsonb                                                              +
- **preferred_contact_methods**: ARRAY                                                      +
- **background_check_date**: date                                                           +
- **special_accommodations**: text                                                          +
- **created_at**: timestamp without time zone, default now()                                +
- **payment_history**: jsonb                                                                +
- **background_check_status**: character varying(50), default 'pending'character varying    +
- **language_preference**: character varying(50), default 'English'character varying        +
- **emergency_contact_phone**: character varying(50)                                        +
- **updated_at**: timestamp without time zone, default now()                                +
- **emergency_contact_relationship**: character varying(100)                                +
- **first_name**: character varying(100)                                                    +

### units                                                                                   +
- **property_id**: uuid, required                                                           +
- **floor_plan**: character varying(100)                                                    +
- **bathrooms**: numeric(2,1)                                                               +
- **bedrooms**: integer(32,0)                                                               +
- **maintenance_history**: jsonb                                                            +
- **status**: character varying(50), default 'vacant'character varying                      +
- **last_inspection_date**: date                                                            +
- **next_inspection_date**: date                                                            +
- **unit_number**: character varying(50)                                                    +
- **smart_lock_enabled**: boolean, default false                                            +
- **updated_at**: timestamp without time zone, default now()                                +
- **smart_lock_details**: jsonb                                                             +
- **created_at**: timestamp without time zone, default now()                                +
- **maintenance**: boolean, required, default false                                         +
- **utility_meters**: jsonb                                                                 +
- **organization_id**: uuid, required                                                       +
- **area**: integer(32,0)                                                                   +
- **rent_amount**: numeric(10,2)                                                            +
- **id**: uuid, required, default uuid_generate_v4()                                        +

### user_profiles                                                                           +
- **last_name**: character varying(100), required                                           +
- **phone**: character varying(50)                                                          +
- **email**: character varying(255), required                                               +
- **default_organization_id**: uuid                                                         +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **two_factor_enabled**: boolean, default false                                            +
- **time_zone**: character varying(50), default 'UTC'character varying                      +
- **profile_image_url**: text                                                               +
- **organization_id**: uuid                                                                 +
- **first_name**: character varying(100), required                                          +
- **phone_verified**: boolean, default false                                                +
- **id**: uuid, required                                                                    +
- **preferred_contact_time**: character varying(50)                                         +
- **email_verified**: boolean, default false                                                +
- **notification_preferences**: jsonb                                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **verification_status**: character varying(20), default 'unverified'character varying     +
- **preferred_contact_methods**: ARRAY, default ARRAY['email'text]                          +
- **status**: character varying(20), default 'active'character varying                      +
- **last_login_at**: timestamp with time zone                                               +

### user_roles                                                                              +
- **updated_at**: timestamp with time zone, default now()                                   +
- **organization_id**: uuid                                                                 +
- **created_at**: timestamp with time zone, default now()                                   +
- **role_id**: uuid                                                                         +
- **user_id**: uuid                                                                         +
- **id**: uuid, required, default uuid_generate_v4()                                        +

### vendors                                                                                 +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **preferred_bank_account_id**: uuid                                                       +
- **hourly_rate**: numeric                                                                  +
- **updated_at**: timestamp without time zone, default now()                                +
- **contact_person_email**: text                                                            +
- **contact_person_phone**: character varying(50)                                           +
- **user_id**: uuid                                                                         +
- **notes**: text                                                                           +
- **business_type**: character varying(100)                                                 +
- **organization_id**: uuid, required                                                       +
- **emergency_service**: boolean, default false                                             +
- **service_type**: character varying(100), required                                        +
- **email**: character varying(255)                                                         +
- **service_areas**: jsonb                                                                  +
- **performance_rating**: numeric(3,2)                                                      +
- **service_availability**: jsonb                                                           +
- **contact_person_name**: text                                                             +
- **vendor_name**: text                                                                     +
- **payment_terms**: character varying(100)                                                 +
- **created_at**: timestamp without time zone, default now()                                +
- **phone**: character varying(50)                                                          +



## Constraints

### Primary Keys
- **activity_logs**: id
- **announcement_schedules**: id
- **announcement_targets**: id
- **announcement_types**: id
- **announcements**: id
- **bank_account_types**: id
- **bank_accounts**: id
- **communication_logs**: id
- **demo_requests**: id
- **documents**: id
- **expenses**: id
- **financial_summaries**: id
- **invoice_items**: id
- **invoice_payments**: id
- **invoices**: id
- **lease_addendums**: id
- **lease_renewals**: id
- **leases**: id
- **maintenance_comments**: id
- **maintenance_requests**: id
- **maintenance_ticket_history**: id
- **maintenance_types**: id
- **notifications**: id
- **organization_invitations**: id
- **organizations**: id
- **owner_properties**: owner_id, property_id
- **owners**: id
- **payment_categories**: id
- **payment_methods**: id
- **payment_schedules**: id
- **payment_transactions**: id
- **payments**: id
- **properties**: id
- **property_images**: id
- **property_inspections**: id
- **property_managers**: id
- **property_metrics**: id
- **property_stakeholders**: id
- **rental_application_documents**: id
- **rental_applications**: id
- **roles**: id
- **tasks**: id
- **team_members**: id
- **tenants**: id
- **units**: id
- **user_profiles**: id
- **user_roles**: id
- **vendors**: id


### Foreign Keys
- **activity_logs.organization_id** references **organizations.id**
- **activity_logs.property_id** references **properties.id**
- **activity_logs.unit_id** references **units.id**
- **activity_logs.user_id** references **user_profiles.id**
- **announcement_schedules.announcement_id** references **announcements.id**
- **announcement_targets.announcement_id** references **announcements.id**
- **announcement_types.organization_id** references **organizations.id**
- **announcements.announcement_type_id** references **announcement_types.id**
- **announcements.organization_id** references **organizations.id**
- **announcements.property_id** references **properties.id**
- **bank_account_types.organization_id** references **organizations.id**
- **bank_accounts.account_type_id** references **bank_account_types.id**
- **bank_accounts.created_by** references **user_profiles.id**
- **bank_accounts.organization_id** references **organizations.id**
- **communication_logs.announcement_id** references **announcements.id**
- **communication_logs.organization_id** references **organizations.id**
- **documents.organization_id** references **organizations.id**
- **documents.uploaded_by** references **user_profiles.id**
- **expenses.category_id** references **payment_categories.id**
- **expenses.created_by** references **user_profiles.id**
- **expenses.organization_id** references **organizations.id**
- **expenses.payment_method_id** references **payment_methods.id**
- **expenses.property_id** references **properties.id**
- **financial_summaries.organization_id** references **organizations.id**
- **financial_summaries.property_id** references **properties.id**
- **invoice_items.invoice_id** references **invoices.id**
- **invoice_payments.invoice_id** references **invoices.id**
- **invoice_payments.payment_id** references **payments.id**
- **invoices.created_by** references **user_profiles.id**
- **invoices.organization_id** references **organizations.id**
- **invoices.property_id** references **properties.id**
- **invoices.unit_id** references **units.id**
- **lease_addendums.created_by** references **user_profiles.id**
- **lease_addendums.lease_id** references **leases.id**
- **lease_renewals.new_lease_id** references **leases.id**
- **lease_renewals.original_lease_id** references **leases.id**
- **leases.tenant_id** references **tenants.id**
- **leases.unit_id** references **units.id**
- **maintenance_comments.commented_by** references **user_profiles.id**
- **maintenance_comments.ticket_id** references **maintenance_requests.id**
- **maintenance_requests.assigned_to** references **user_profiles.id**
- **maintenance_requests.maintenance_type_id** references **maintenance_types.id**
- **maintenance_requests.owner_id** references **user_profiles.id**
- **maintenance_requests.property_id** references **properties.id**
- **maintenance_requests.tenant_id** references **user_profiles.id**
- **maintenance_ticket_history.changed_by** references **user_profiles.id**
- **maintenance_ticket_history.ticket_id** references **maintenance_requests.id**
- **maintenance_types.organization_id** references **organizations.id**
- **notifications.user_id** references **user_profiles.id**
- **organization_invitations.invited_by** references **user_profiles.id**
- **organization_invitations.organization_id** references **organizations.id**
- **organization_invitations.role_id** references **roles.id**
- **owner_properties.owner_id** references **owners.id**
- **owner_properties.property_id** references **properties.id**
- **owners.bank_account_id** references **bank_accounts.id**
- **owners.organization_id** references **organizations.id**
- **owners.user_id** references **user_profiles.id**
- **payment_categories.organization_id** references **organizations.id**
- **payment_methods.organization_id** references **organizations.id**
- **payment_schedules.bank_account_id** references **bank_accounts.id**
- **payment_schedules.category_id** references **payment_categories.id**
- **payment_schedules.created_by** references **user_profiles.id**
- **payment_schedules.lease_id** references **leases.id**
- **payment_schedules.organization_id** references **organizations.id**
- **payment_transactions.organization_id** references **organizations.id**
- **payment_transactions.payment_id** references **payments.id**
- **payments.bank_account_id** references **bank_accounts.id**
- **payments.category_id** references **payment_categories.id**
- **payments.created_by** references **user_profiles.id**
- **payments.invoice_id** references **invoices.id**
- **payments.lease_id** references **leases.id**
- **payments.organization_id** references **organizations.id**
- **payments.payment_method_id** references **payment_methods.id**
- **properties.organization_id** references **organizations.id**
- **properties.owner_id** references **owners.id**
- **property_images.property_id** references **properties.id**
- **property_inspections.inspector_id** references **user_profiles.id**
- **property_inspections.organization_id** references **organizations.id**
- **property_inspections.property_id** references **properties.id**
- **property_inspections.unit_id** references **units.id**
- **property_managers.organization_id** references **organizations.id**
- **property_managers.user_id** references **user_profiles.id**
- **property_metrics.property_id** references **properties.id**
- **property_stakeholders.property_id** references **properties.id**
- **property_stakeholders.user_id** references **user_profiles.id**
- **rental_application_documents.rental_application_id** references **rental_applications.id**
- **rental_application_documents.uploaded_by** references **user_profiles.id**
- **rental_applications.organization_id** references **organizations.id**
- **rental_applications.property_id** references **properties.id**
- **rental_applications.reviewed_by** references **user_profiles.id**
- **rental_applications.unit_id** references **units.id**
- **tasks.assigned_to** references **user_profiles.id**
- **tasks.organization_id** references **organizations.id**
- **tasks.owner_id** references **user_profiles.id**
- **team_members.role_id** references **roles.id**
- **team_members.user_id** references **user_profiles.id**
- **tenants.current_property_id** references **properties.id**
- **tenants.organization_id** references **organizations.id**
- **tenants.user_id** references **user_profiles.id**
- **units.organization_id** references **organizations.id**
- **units.property_id** references **properties.id**
- **user_profiles.default_organization_id** references **organizations.id**
- **user_profiles.organization_id** references **organizations.id**
- **user_roles.organization_id** references **organizations.id**
- **user_roles.role_id** references **roles.id**
- **user_roles.user_id** references **user_profiles.id**
- **vendors.organization_id** references **organizations.id**
- **vendors.preferred_bank_account_id** references **bank_accounts.id**
- **vendors.user_id** references **user_profiles.id**


### Unique Constraints
- **financial_summaries**: period_end, organization_id, property_id, period_start
- **organization_invitations**: organization_id, email, status
- **organization_invitations**: token
- **property_metrics**: property_id, metric_date
- **property_stakeholders**: stakeholder_type, property_id, user_id
- **roles**: name
- **units**: property_id, unit_number
- **user_profiles**: email
- **user_roles**: role_id, organization_id, user_id
- **user_roles**: user_id, role_id, organization_id


## Row Level Security Policies
### organizations                                                                        +
- **Organizations are viewable by organization members**: For r                          +

### properties                                                                           +
- **Allow users with create property permission in organization**: For a to authenticated+

### property_images                                                                      +
- **Allow all operations for authenticated users**: For ALL to authenticated             +

### rental_application_documents                                                         +
- **Enable update for authenticated users only**: For w                                  +
- **Enable delete for authenticated users only**: For d                                  +
- **Enable insert for authenticated users only**: For a                                  +
- **Enable read access for all users**: For r                                            +

### rental_applications                                                                  +
- **Enable read access for all users**: For r                                            +
- **Enable update for authenticated users only**: For w                                  +
- **Enable delete for authenticated users only**: For d                                  +
- **Enable insert for authenticated users only**: For a                                  +

### user_profiles                                                                        +
- **Enable insert for authenticated users**: For a to authenticated                      +
- **Users can view profiles in their organization**: For r                               +


