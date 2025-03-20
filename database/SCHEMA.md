# Supabase Database Schema Documentation

This document provides an overview of the database schema for the PropEase property management system.
Last updated: Thu Mar 20 04:04:38 PM +03 2025

## Tables
### activity_logs                                                                           +
- **unit_id**: uuid                                                                         +
- **organization_id**: uuid, required                                                       +
- **metadata**: jsonb                                                                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **property_id**: uuid                                                                     +
- **activity_type**: character varying(100), required                                       +
- **user_id**: uuid                                                                         +
- **description**: text, required                                                           +
- **created_at**: timestamp with time zone, default now()                                   +

### announcement_schedules                                                                  +
- **end_date**: timestamp with time zone                                                    +
- **next_run**: timestamp with time zone, required                                          +
- **time_of_day**: time without time zone, required                                         +
- **repeat_frequency**: text                                                                +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **repeat_on**: jsonb                                                                      +
- **announcement_id**: uuid, required                                                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **start_date**: timestamp with time zone, required                                        +
- **created_at**: timestamp with time zone, required, default now()                         +

### announcement_targets                                                                    +
- **announcement_id**: uuid, required                                                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **target_id**: uuid                                                                       +
- **target_type**: text, required                                                           +
- **target_name**: text                                                                     +
- **created_at**: timestamp with time zone, required, default now()                         +

### announcement_types                                                                      +
- **description**: text                                                                     +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **name**: text, required                                                                  +
- **created_at**: timestamp with time zone, required, default now()                         +
- **organization_id**: uuid, required                                                       +

### announcements                                                                           +
- **author_id**: uuid, required                                                             +
- **property_id**: uuid                                                                     +
- **created_at**: timestamp with time zone, required, default now()                         +
- **announcement_type_id**: uuid                                                            +
- **title**: text, required                                                                 +
- **content**: text, required                                                               +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **organization_id**: uuid, required                                                       +
- **status**: text, required, default 'draft'text                                           +
- **communication_method**: ARRAY, required                                                 +
- **is_scheduled**: boolean, required, default false                                        +
- **issue_date**: timestamp with time zone                                                  +
- **id**: uuid, required, default gen_random_uuid()                                         +

### bank_account_types                                                                      +
- **description**: text                                                                     +
- **name**: character varying(100), required                                                +
- **organization_id**: uuid, required                                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **is_predefined**: boolean, default false                                                 +

### bank_accounts                                                                           +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **created_by**: uuid, required                                                            +
- **account_number**: character varying(255), required                                      +
- **metadata**: jsonb                                                                       +
- **institution_id**: character varying(255)                                                +
- **bank_name**: character varying(255), required                                           +
- **routing_number**: character varying(50)                                                 +
- **organization_id**: uuid, required                                                       +
- **account_name**: character varying(255), required                                        +
- **status**: character varying(50), default 'active'character varying                      +
- **last_synced**: timestamp with time zone                                                 +
- **balance_current**: numeric(12,2), default 0                                             +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **currency**: character varying(10), default 'USD'character varying                       +
- **balance_available**: numeric(12,2), default 0                                           +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **is_default**: boolean, default false                                                    +
- **account_type_id**: uuid, required                                                       +
- **external_id**: character varying(255)                                                   +

### communication_logs                                                                      +
- **read_at**: timestamp with time zone                                                     +
- **announcement_id**: uuid                                                                 +
- **subject**: text                                                                         +
- **delivered_at**: timestamp with time zone                                                +
- **sender_id**: uuid                                                                       +
- **created_at**: timestamp with time zone, required, default now()                         +
- **recipient_type**: text, required                                                        +
- **recipient_id**: uuid, required                                                          +
- **method**: text, required                                                                +
- **updated_at**: timestamp with time zone, required, default now()                         +
- **status**: text, required, default 'queued'text                                          +
- **sent_at**: timestamp with time zone                                                     +
- **organization_id**: uuid, required                                                       +
- **message_type**: text, required                                                          +
- **error_message**: text                                                                   +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **content**: text, required                                                               +

### demo_requests                                                                           +
- **full_name**: character varying(255), required                                           +
- **email**: character varying(255), required                                               +
- **industry**: character varying(100)                                                      +
- **country**: character varying(100)                                                       +
- **phone**: character varying(50)                                                          +
- **company_name**: character varying(255), required                                        +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **company_size**: character varying(50)                                                   +
- **additional_comments**: text                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **demo_preferences**: text                                                                +
- **job_title**: character varying(100)                                                     +

### documents                                                                               +
- **updated_at**: timestamp without time zone, default now()                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **related_to_id**: uuid, required                                                         +
- **document_url**: text, required                                                          +
- **document_name**: character varying(255), required                                       +
- **uploaded_by**: uuid                                                                     +
- **created_at**: timestamp without time zone, default now()                                +
- **organization_id**: uuid                                                                 +
- **related_to_type**: character varying(50), required                                      +
- **document_type**: character varying(100), required                                       +

### expenses                                                                                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **payee**: character varying(255), required                                               +
- **organization_id**: uuid, required                                                       +
- **status**: character varying(50), default 'recorded'character varying                    +
- **receipt_url**: text                                                                     +
- **unit_id**: uuid                                                                         +
- **created_by**: uuid, required                                                            +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **expense_date**: date, required                                                          +
- **payment_method_id**: uuid                                                               +
- **description**: text                                                                     +
- **category_id**: uuid, required                                                           +
- **amount**: numeric(12,2), required                                                       +
- **property_id**: uuid                                                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### financial_summaries                                                                     +
- **period_start**: date, required                                                          +
- **outstanding_invoices**: numeric(12,2), default 0                                        +
- **upcoming_payables**: numeric(12,2), default 0                                           +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **organization_id**: uuid, required                                                       +
- **total_income**: numeric(12,2), default 0                                                +
- **property_id**: uuid                                                                     +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **total_expenses**: numeric(12,2), default 0                                              +
- **net_revenue**: numeric(12,2)                                                            +
- **period_end**: date, required                                                            +

### invoice_items                                                                           +
- **tax_rate**: numeric(5,2), default 0                                                     +
- **amount**: numeric(12,2), required                                                       +
- **quantity**: numeric(10,2), required, default 1                                          +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **unit_price**: numeric(12,2), required                                                   +
- **invoice_id**: uuid, required                                                            +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **description**: text, required                                                           +
- **tax_amount**: numeric(12,2), default 0                                                  +

### invoice_payments                                                                        +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **amount_applied**: numeric(12,2), required                                               +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **invoice_id**: uuid, required                                                            +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **payment_id**: uuid, required                                                            +

### invoices                                                                                +
- **organization_id**: uuid, required                                                       +
- **amount_due**: numeric(12,2)                                                             +
- **notes**: text                                                                           +
- **property_id**: uuid                                                                     +
- **invoice_number**: character varying(50), required                                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **issue_date**: date, required                                                            +
- **pdf_url**: text                                                                         +
- **amount_total**: numeric(12,2), required                                                 +
- **client_id**: uuid                                                                       +
- **status**: character varying(50), required, default 'draft'character varying             +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **client_type**: character varying(50), required                                          +
- **due_date**: date, required                                                              +
- **created_by**: uuid, required                                                            +
- **unit_id**: uuid                                                                         +
- **amount_paid**: numeric(12,2), default 0                                                 +
- **client_name**: character varying(255), required                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### lease_addendums                                                                         +
- **updated_at**: timestamp without time zone, default now()                                +
- **created_by**: uuid                                                                      +
- **document_url**: text                                                                    +
- **created_at**: timestamp without time zone, default now()                                +
- **lease_id**: uuid, required                                                              +
- **effective_date**: date, required                                                        +
- **title**: character varying(255), required                                               +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **description**: text                                                                     +

### lease_renewals                                                                          +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **notes**: text                                                                           +
- **renewal_date**: date, required                                                          +
- **new_lease_id**: uuid                                                                    +
- **status**: character varying(50), default 'pending'character varying                     +
- **rent_change**: numeric                                                                  +
- **updated_at**: timestamp without time zone, default now()                                +
- **created_at**: timestamp without time zone, default now()                                +
- **original_lease_id**: uuid, required                                                     +
- **renewal_term**: integer(32,0)                                                           +

### leases                                                                                  +
- **current_balance**: numeric, default 0                                                   +
- **created_at**: timestamp without time zone, default now()                                +
- **lease_terms**: text                                                                     +
- **late_fee_amount**: numeric, default 0                                                   +
- **is_auto_renew**: boolean, default false                                                 +
- **payment_day**: integer(32,0)                                                            +
- **updated_at**: timestamp without time zone, default now()                                +
- **next_payment_date**: date                                                               +
- **status**: character varying(50), default 'Pending'character varying                     +
- **rent_amount**: numeric(12,2), required                                                  +
- **late_fee_days**: integer(32,0), default 5                                               +
- **security_deposit**: numeric(10,2)                                                       +
- **lease_document_url**: text                                                              +
- **unit_id**: uuid, required                                                               +
- **end_date**: date, required                                                              +
- **document_status**: character varying(50), default 'draft'character varying              +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **tenant_id**: uuid, required                                                             +
- **start_date**: date, required, default now()                                             +
- **last_payment_date**: date                                                               +
- **notice_period_days**: integer(32,0), default 30                                         +

### maintenance_comments                                                                    +
- **updated_at**: timestamp without time zone, default now()                                +
- **comment**: text, required                                                               +
- **commented_by**: uuid                                                                    +
- **ticket_id**: uuid, required                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp without time zone, default now()                                +

### maintenance_requests                                                                    +
- **property_id**: uuid                                                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **due_date**: timestamp without time zone                                                 +
- **description**: text, required                                                           +
- **tenant_id**: uuid                                                                       +
- **status**: character varying(50), default 'pending'character varying                     +
- **completed_at**: timestamp with time zone                                                +
- **related_to_type**: character varying(50)                                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **related_to_id**: uuid                                                                   +
- **maintenance_type_id**: uuid                                                             +
- **priority**: character varying(50), required                                             +
- **scheduled_date**: timestamp without time zone                                           +
- **assigned_to**: uuid                                                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **owner_id**: uuid                                                                        +
- **title**: character varying(255), required                                               +
- **unit_id**: uuid                                                                         +
- **maintenance_type**: character varying(100)                                              +

### maintenance_ticket_history                                                              +
- **previous_status**: character varying(50)                                                +
- **ticket_id**: uuid, required                                                             +
- **created_at**: timestamp without time zone, default now()                                +
- **change_description**: text, required                                                    +
- **new_status**: character varying(50)                                                     +
- **changed_by**: uuid                                                                      +
- **id**: uuid, required, default uuid_generate_v4()                                        +

### maintenance_types                                                                       +
- **description**: text                                                                     +
- **organization_id**: uuid, required                                                       +
- **updated_at**: timestamp without time zone, default now()                                +
- **is_emergency**: boolean, default false                                                  +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp without time zone, default now()                                +
- **estimated_resolution_time**: integer(32,0)                                              +
- **name**: character varying(100), required                                                +

### notifications                                                                           +
- **user_id**: uuid                                                                         +
- **type**: character varying(50), required                                                 +
- **title**: character varying(255), required                                               +
- **read**: boolean, default false                                                          +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **message**: text, required                                                               +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### organization_invitations                                                                +
- **email**: character varying(255), required                                               +
- **created_at**: timestamp with time zone, default now()                                   +
- **role_id**: uuid, required                                                               +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **expires_at**: timestamp with time zone, required                                        +
- **status**: character varying(20), default 'pending'character varying                     +
- **updated_at**: timestamp with time zone, default now()                                   +
- **invited_by**: uuid, required                                                            +
- **organization_id**: uuid, required                                                       +
- **token**: character varying(255)                                                         +

### organizations                                                                           +
- **billing_cycle**: character varying(20)                                                  +
- **subscription_plan**: character varying(50)                                              +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **subscription_status**: character varying(50), default 'inactive'character varying       +
- **website**: character varying(255)                                                       +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **phone**: character varying(50)                                                          +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **logo_url**: text                                                                        +
- **currency**: character varying(10), default 'USD'character varying                       +
- **timezone**: character varying(50), default 'UTC'character varying                       +
- **active**: boolean, default true                                                         +
- **billing_address**: text                                                                 +
- **tax_id**: character varying(50)                                                         +
- **date_format**: character varying(20), default 'YYYY-MM-DD'character varying             +
- **email**: character varying(255)                                                         +
- **name**: character varying(255), required                                                +

### owner_properties                                                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **property_id**: uuid, required                                                           +
- **owner_id**: uuid, required                                                              +

### owners                                                                                  +
- **tax_id**: character varying(50)                                                         +
- **first_name**: character varying(100)                                                    +
- **created_at**: timestamp without time zone, default now()                                +
- **email**: character varying(255)                                                         +
- **taxpayer_id**: character varying(50)                                                    +
- **user_id**: uuid                                                                         +
- **organization_id**: uuid, required                                                       +
- **last_name**: character varying(100)                                                     +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **bank_account_id**: uuid                                                                 +
- **payment_schedule**: character varying(50), default 'monthly'character varying           +
- **notes**: text                                                                           +
- **status**: character varying(50), default 'active'character varying                      +
- **updated_at**: timestamp without time zone, default now()                                +
- **company_name**: character varying(255)                                                  +
- **business_type**: character varying(50)                                                  +
- **address**: text                                                                         +
- **payment_method**: character varying(50)                                                 +
- **phone**: character varying(50)                                                          +

### payment_categories                                                                      +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **name**: character varying(100), required                                                +
- **description**: text                                                                     +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **organization_id**: uuid, required                                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **is_predefined**: boolean, default false                                                 +

### payment_methods                                                                         +
- **description**: text                                                                     +
- **organization_id**: uuid, required                                                       +
- **name**: character varying(100), required                                                +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### payment_schedules                                                                       +
- **lease_id**: uuid                                                                        +
- **created_by**: uuid, required                                                            +
- **amount**: numeric(10,2), required                                                       +
- **day_of_month**: integer(32,0)                                                           +
- **category_id**: uuid                                                                     +
- **start_date**: date, required                                                            +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **organization_id**: uuid, required                                                       +
- **bank_account_id**: uuid, required                                                       +
- **last_run_date**: date                                                                   +
- **active**: boolean, default true                                                         +
- **next_schedule_date**: date, required                                                    +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **description**: text                                                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **end_date**: date                                                                        +
- **frequency**: character varying(50), required                                            +

### payment_transactions                                                                    +
- **status**: character varying(50), default 'pending'character varying                     +
- **amount**: numeric(10,2), required                                                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **payment_id**: uuid, required                                                            +
- **external_id**: character varying(255)                                                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **transaction_date**: timestamp with time zone, default CURRENT_TIMESTAMP                 +
- **organization_id**: uuid, required                                                       +
- **gateway_response**: jsonb                                                               +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +

### payments                                                                                +
- **payment_method_id**: uuid                                                               +
- **payment_type**: character varying(50), default 'one-time'character varying              +
- **amount**: numeric(12,2), required                                                       +
- **next_scheduled_date**: date                                                             +
- **created_by**: uuid                                                                      +
- **bank_account_id**: uuid                                                                 +
- **status**: character varying(50), default 'pending'character varying                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **lease_id**: uuid                                                                        +
- **category_id**: uuid                                                                     +
- **recipient_id**: uuid                                                                    +
- **transaction_id**: character varying(255)                                                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **organization_id**: uuid, required                                                       +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **payment_date**: date, required                                                          +
- **recipient_type**: character varying(50)                                                 +
- **invoice_id**: uuid                                                                      +

### properties                                                                              +
- **monthly_revenue**: numeric, default 0                                                   +
- **occupancy_rate**: numeric, default 0                                                    +
- **state**: character varying(100), required                                               +
- **created_at**: timestamp without time zone, default now()                                +
- **property_type**: character varying(50), required, default 'residential'character varying+
- **name**: character varying(255), required                                                +
- **updated_at**: timestamp without time zone, default now()                                +
- **status**: character varying(50), default 'active'character varying                      +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **last_activity_date**: timestamp with time zone                                          +
- **city**: character varying(100), required                                                +
- **organization_id**: uuid, required                                                       +
- **total_units**: integer(32,0), required                                                  +
- **address**: text, required                                                               +
- **active_leases**: integer(32,0), default 0                                               +
- **owner_id**: uuid                                                                        +
- **zip_code**: character varying(20), required                                             +

### property_images                                                                         +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **property_id**: uuid, required                                                           +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **image_url**: text, required                                                             +

### property_inspections                                                                    +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **inspection_date**: timestamp with time zone, required                                   +
- **property_id**: uuid                                                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **unit_id**: uuid                                                                         +
- **notes**: text                                                                           +
- **organization_id**: uuid, required                                                       +
- **inspector_id**: uuid                                                                    +
- **status**: text, required, default 'scheduled'text                                       +
- **report_url**: text                                                                      +

### property_managers                                                                       +
- **created_at**: timestamp without time zone, default now()                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **organization_id**: uuid                                                                 +
- **assigned_properties**: ARRAY, default '{}'uuid[]                                        +
- **user_id**: uuid                                                                         +
- **updated_at**: timestamp without time zone, default now()                                +

### property_metrics                                                                        +
- **outstanding_rent**: numeric, default 0                                                  +
- **total_income**: numeric(12,2), default 0                                                +
- **net_revenue**: numeric(12,2)                                                            +
- **property_id**: uuid, required                                                           +
- **active_leases**: integer(32,0), default 0                                               +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **monthly_revenue**: numeric, default 0                                                   +
- **occupancy_rate**: numeric, default 0                                                    +
- **metric_date**: date, required                                                           +
- **collected_rent**: numeric, default 0                                                    +
- **created_at**: timestamp with time zone, default now()                                   +
- **maintenance_costs**: numeric, default 0                                                 +
- **outstanding_invoices**: numeric(12,2), default 0                                        +
- **total_expenses**: numeric(12,2), default 0                                              +
- **operational_costs**: numeric, default 0                                                 +

### property_stakeholders                                                                   +
- **end_date**: date                                                                        +
- **created_at**: timestamp with time zone, default now()                                   +
- **start_date**: date, required                                                            +
- **user_id**: uuid, required                                                               +
- **is_primary**: boolean, default false                                                    +
- **property_id**: uuid, required                                                           +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **notes**: text                                                                           +
- **stakeholder_type**: character varying(50), required                                     +
- **ownership_percentage**: numeric, default 100                                            +
- **updated_at**: timestamp with time zone, default now()                                   +

### rental_application_documents                                                            +
- **file_name**: text, required                                                             +
- **file_type**: text, required                                                             +
- **rental_application_id**: uuid, required                                                 +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **file_path**: text, required                                                             +
- **uploaded_by**: uuid, required                                                           +
- **uploaded_at**: timestamp with time zone, default now()                                  +

### rental_applications                                                                     +
- **expiry_date**: date                                                                     +
- **organization_id**: uuid, required                                                       +
- **id_type**: character varying(50)                                                        +
- **lease_term**: integer(32,0)                                                             +
- **monthly_income**: numeric                                                               +
- **review_date**: timestamp with time zone                                                 +
- **updated_at**: timestamp with time zone, default now()                                   +
- **applicant_id**: bigint(64,0), required                                                  +
- **credit_check_status**: character varying(50)                                            +
- **reviewed_by**: uuid                                                                     +
- **is_employed**: boolean, required, default false                                         +
- **vehicle_details**: jsonb                                                                +
- **employment_info**: jsonb                                                                +
- **pet_details**: jsonb                                                                    +
- **preferred_contact_method**: ARRAY                                                       +
- **emergency_contact**: jsonb                                                              +
- **property_id**: uuid                                                                     +
- **application_date**: timestamp with time zone, default now()                             +
- **applicant_name**: character varying(255), required                                      +
- **application_fee_paid**: boolean, default false                                          +
- **notes**: text                                                                           +
- **background_check_status**: character varying(50)                                        +
- **unit_id**: uuid                                                                         +
- **previous_address**: text                                                                +
- **applicant_phone_number**: character varying(20)                                         +
- **id**: uuid, required, default gen_random_uuid()                                         +
- **has_pets**: boolean, default false                                                      +
- **has_vehicles**: boolean, default false                                                  +
- **desired_move_in_date**: date                                                            +
- **applicant_email**: character varying(255)                                               +
- **created_at**: timestamp with time zone, default now()                                   +
- **rejection_reason**: text                                                                +
- **status**: character varying(50), default 'pending'character varying                     +

### roles                                                                                   +
- **description**: text                                                                     +
- **name**: character varying(50), required                                                 +
- **is_system_role**: boolean, default false                                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **permissions**: jsonb                                                                    +
- **updated_at**: timestamp with time zone, default now()                                   +

### tasks                                                                                   +
- **owner_id**: uuid                                                                        +
- **title**: character varying(255), required                                               +
- **type**: character varying(50)                                                           +
- **organization_id**: uuid                                                                 +
- **updated_at**: timestamp without time zone, default now()                                +
- **status**: character varying(50), required, default 'pending'character varying           +
- **description**: text                                                                     +
- **priority**: character varying(50), required                                             +
- **related_to_id**: uuid                                                                   +
- **due_date**: timestamp without time zone                                                 +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **created_at**: timestamp without time zone, default now()                                +
- **assigned_to**: uuid                                                                     +

### team_members                                                                            +
- **role_id**: uuid                                                                         +
- **created_at**: timestamp with time zone, default now()                                   +
- **job_title**: character varying(100)                                                     +
- **user_id**: uuid, required                                                               +
- **department**: character varying(100)                                                    +
- **updated_at**: timestamp with time zone, default now()                                   +
- **id**: uuid, required, default gen_random_uuid()                                         +

### tenants                                                                                 +
- **preferred_contact_methods**: ARRAY, default ARRAY['email'text]                          +
- **background_check_status**: character varying(50), default 'pending'character varying    +
- **background_check_date**: date                                                           +
- **eviction_history**: boolean, default false                                              +
- **background_check_passed**: boolean                                                      +
- **email**: character varying(255)                                                         +
- **pets**: jsonb                                                                           +
- **current_property_id**: uuid                                                             +
- **user_id**: uuid                                                                         +
- **phone**: character varying(50)                                                          +
- **organization_id**: uuid, required                                                       +
- **status**: character varying(50), default 'active'character varying                      +
- **vehicles**: jsonb                                                                       +
- **emergency_contact**: jsonb                                                              +
- **special_accommodations**: text                                                          +
- **created_at**: timestamp without time zone, default now()                                +
- **last_name**: character varying(100)                                                     +
- **payment_history**: jsonb                                                                +
- **language_preference**: character varying(50), default 'English'character varying        +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **backgroundcheckdate**: date                                                             +
- **first_name**: character varying(100)                                                    +
- **emergency_contact_phone**: character varying(50)                                        +
- **updated_at**: timestamp without time zone, default now()                                +
- **emergency_contact_relationship**: character varying(100)                                +

### units                                                                                   +
- **created_at**: timestamp without time zone, default now()                                +
- **bedrooms**: integer(32,0)                                                               +
- **unit_number**: character varying(50)                                                    +
- **maintenance_history**: jsonb                                                            +
- **utility_meters**: jsonb                                                                 +
- **next_inspection_date**: date                                                            +
- **area**: integer(32,0)                                                                   +
- **organization_id**: uuid, required                                                       +
- **status**: character varying(50), default 'Available'character varying                   +
- **updated_at**: timestamp without time zone, default now()                                +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **property_id**: uuid, required                                                           +
- **smart_lock_enabled**: boolean, default false                                            +
- **bathrooms**: numeric(2,1)                                                               +
- **floor_plan**: character varying(100)                                                    +
- **smart_lock_details**: jsonb                                                             +
- **rent_amount**: numeric(10,2)                                                            +
- **last_inspection_date**: date                                                            +

### user_profiles                                                                           +
- **first_name**: character varying(100), required                                          +
- **status**: character varying(20), default 'active'character varying                      +
- **default_organization_id**: uuid                                                         +
- **verification_status**: character varying(20), default 'unverified'character varying     +
- **email_verified**: boolean, default false                                                +
- **phone**: character varying(50)                                                          +
- **preferred_contact_time**: character varying(50)                                         +
- **last_name**: character varying(100), required                                           +
- **last_login_at**: timestamp with time zone                                               +
- **two_factor_enabled**: boolean, default false                                            +
- **profile_image_url**: text                                                               +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **notification_preferences**: jsonb                                                       +
- **time_zone**: character varying(50), default 'UTC'character varying                      +
- **email**: character varying(255), required                                               +
- **organization_id**: uuid                                                                 +
- **phone_verified**: boolean, default false                                                +
- **id**: uuid, required                                                                    +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                       +
- **preferred_contact_methods**: ARRAY, default ARRAY['email'text]                          +

### user_roles                                                                              +
- **created_at**: timestamp with time zone, default now()                                   +
- **role_id**: uuid                                                                         +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **organization_id**: uuid                                                                 +
- **user_id**: uuid                                                                         +
- **updated_at**: timestamp with time zone, default now()                                   +

### vendors                                                                                 +
- **phone**: character varying(50)                                                          +
- **payment_terms**: character varying(100)                                                 +
- **email**: character varying(255)                                                         +
- **updated_at**: timestamp without time zone, default now()                                +
- **contact_person_email**: text                                                            +
- **id**: uuid, required, default uuid_generate_v4()                                        +
- **emergency_service**: boolean, default false                                             +
- **performance_rating**: numeric(3,2)                                                      +
- **business_type**: character varying(100)                                                 +
- **vendor_name**: text                                                                     +
- **hourly_rate**: numeric                                                                  +
- **contact_person_name**: text                                                             +
- **notes**: text                                                                           +
- **preferred_bank_account_id**: uuid                                                       +
- **organization_id**: uuid, required                                                       +
- **created_at**: timestamp without time zone, default now()                                +
- **service_availability**: jsonb                                                           +
- **user_id**: uuid                                                                         +
- **service_areas**: jsonb                                                                  +
- **service_type**: character varying(100), required                                        +



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


