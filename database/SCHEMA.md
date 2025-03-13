# Supabase Database Schema Documentation

This document provides an overview of the database schema for the PropEase property management system.
Last updated: Thu Mar 13 05:04:35 AM +03 2025

## Tables
### activity_logs                                                                       +
- **organization_id**: uuid, required                                                   +
- **activity_type**: character varying(100), required                                   +
- **created_at**: timestamp with time zone, default now()                               +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **user_id**: uuid                                                                     +
- **metadata**: jsonb                                                                   +
- **unit_id**: uuid                                                                     +
- **property_id**: uuid                                                                 +
- **description**: text, required                                                       +

### announcement_schedules                                                              +
- **created_at**: timestamp with time zone, required, default now()                     +
- **end_date**: timestamp with time zone                                                +
- **announcement_id**: uuid, required                                                   +
- **time_of_day**: time without time zone, required                                     +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **start_date**: timestamp with time zone, required                                    +
- **next_run**: timestamp with time zone, required                                      +
- **repeat_on**: jsonb                                                                  +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **repeat_frequency**: text                                                            +

### announcement_targets                                                                +
- **created_at**: timestamp with time zone, required, default now()                     +
- **target_type**: text, required                                                       +
- **target_name**: text                                                                 +
- **target_id**: uuid                                                                   +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **announcement_id**: uuid, required                                                   +
- **id**: uuid, required, default gen_random_uuid()                                     +

### announcement_types                                                                  +
- **description**: text                                                                 +
- **created_at**: timestamp with time zone, required, default now()                     +
- **organization_id**: uuid, required                                                   +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **name**: text, required                                                              +

### announcements                                                                       +
- **property_id**: uuid                                                                 +
- **content**: text, required                                                           +
- **is_scheduled**: boolean, required, default false                                    +
- **issue_date**: timestamp with time zone                                              +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **communication_method**: ARRAY, required                                             +
- **status**: text, required, default 'draft'text                                       +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **announcement_type_id**: uuid                                                        +
- **created_at**: timestamp with time zone, required, default now()                     +
- **organization_id**: uuid, required                                                   +
- **author_id**: uuid, required                                                         +
- **title**: text, required                                                             +

### bank_account_types                                                                  +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **is_predefined**: boolean, default false                                             +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **organization_id**: uuid, required                                                   +
- **description**: text                                                                 +
- **name**: character varying(100), required                                            +

### bank_accounts                                                                       +
- **created_by**: uuid, required                                                        +
- **account_name**: character varying(255), required                                    +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **routing_number**: character varying(50)                                             +
- **currency**: character varying(10), default 'USD'character varying                   +
- **balance_available**: numeric(12,2), default 0                                       +
- **external_id**: character varying(255)                                               +
- **institution_id**: character varying(255)                                            +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **bank_name**: character varying(255), required                                       +
- **balance_current**: numeric(12,2), default 0                                         +
- **last_synced**: timestamp with time zone                                             +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **account_number**: character varying(255), required                                  +
- **is_default**: boolean, default false                                                +
- **account_type_id**: uuid, required                                                   +
- **status**: character varying(50), default 'active'character varying                  +
- **organization_id**: uuid, required                                                   +
- **metadata**: jsonb                                                                   +

### communication_logs                                                                  +
- **message_type**: text, required                                                      +
- **method**: text, required                                                            +
- **subject**: text                                                                     +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **read_at**: timestamp with time zone                                                 +
- **organization_id**: uuid, required                                                   +
- **content**: text, required                                                           +
- **delivered_at**: timestamp with time zone                                            +
- **recipient_id**: uuid, required                                                      +
- **recipient_type**: text, required                                                    +
- **announcement_id**: uuid                                                             +
- **sent_at**: timestamp with time zone                                                 +
- **created_at**: timestamp with time zone, required, default now()                     +
- **status**: text, required, default 'queued'text                                      +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **sender_id**: uuid                                                                   +
- **error_message**: text                                                               +

### demo_requests                                                                       +
- **email**: character varying(255), required                                           +
- **phone**: character varying(50)                                                      +
- **industry**: character varying(100)                                                  +
- **full_name**: character varying(255), required                                       +
- **country**: character varying(100)                                                   +
- **demo_preferences**: text                                                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **job_title**: character varying(100)                                                 +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **additional_comments**: text                                                         +
- **company_name**: character varying(255), required                                    +
- **company_size**: character varying(50)                                               +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### documents                                                                           +
- **organization_id**: uuid                                                             +
- **related_to_id**: uuid, required                                                     +
- **document_type**: character varying(100), required                                   +
- **uploaded_by**: uuid                                                                 +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **created_at**: timestamp without time zone, default now()                            +
- **document_url**: text, required                                                      +
- **document_name**: character varying(255), required                                   +
- **updated_at**: timestamp without time zone, default now()                            +
- **related_to_type**: character varying(50), required                                  +

### expenses                                                                            +
- **created_by**: uuid, required                                                        +
- **payment_method_id**: uuid                                                           +
- **expense_date**: date, required                                                      +
- **unit_id**: uuid                                                                     +
- **amount**: numeric(12,2), required                                                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **payee**: character varying(255), required                                           +
- **property_id**: uuid                                                                 +
- **category_id**: uuid, required                                                       +
- **organization_id**: uuid, required                                                   +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **description**: text                                                                 +
- **receipt_url**: text                                                                 +
- **status**: character varying(50), default 'recorded'character varying                +

### financial_summaries                                                                 +
- **period_start**: date, required                                                      +
- **property_id**: uuid                                                                 +
- **net_revenue**: numeric(12,2)                                                        +
- **outstanding_invoices**: numeric(12,2), default 0                                    +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **total_income**: numeric(12,2), default 0                                            +
- **upcoming_payables**: numeric(12,2), default 0                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **total_expenses**: numeric(12,2), default 0                                          +
- **organization_id**: uuid, required                                                   +
- **period_end**: date, required                                                        +

### invoice_items                                                                       +
- **amount**: numeric(12,2), required                                                   +
- **tax_amount**: numeric(12,2), default 0                                              +
- **unit_price**: numeric(12,2), required                                               +
- **description**: text, required                                                       +
- **tax_rate**: numeric(5,2), default 0                                                 +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **invoice_id**: uuid, required                                                        +
- **quantity**: numeric(10,2), required, default 1                                      +

### invoice_payments                                                                    +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **amount_applied**: numeric(12,2), required                                           +
- **invoice_id**: uuid, required                                                        +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **payment_id**: uuid, required                                                        +

### invoices                                                                            +
- **created_by**: uuid, required                                                        +
- **amount_due**: numeric(12,2)                                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **client_id**: uuid                                                                   +
- **client_type**: character varying(50), required                                      +
- **unit_id**: uuid                                                                     +
- **pdf_url**: text                                                                     +
- **client_name**: character varying(255), required                                     +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **due_date**: date, required                                                          +
- **property_id**: uuid                                                                 +
- **organization_id**: uuid, required                                                   +
- **invoice_number**: character varying(50), required                                   +
- **notes**: text                                                                       +
- **amount_total**: numeric(12,2), required                                             +
- **issue_date**: date, required                                                        +
- **amount_paid**: numeric(12,2), default 0                                             +
- **status**: character varying(50), required, default 'draft'character varying         +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### lease_addendums                                                                     +
- **created_at**: timestamp without time zone, default now()                            +
- **document_url**: text                                                                +
- **title**: character varying(255), required                                           +
- **updated_at**: timestamp without time zone, default now()                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **description**: text                                                                 +
- **effective_date**: date, required                                                    +
- **lease_id**: uuid, required                                                          +
- **created_by**: uuid                                                                  +

### lease_renewals                                                                      +
- **new_lease_id**: uuid                                                                +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **original_lease_id**: uuid, required                                                 +
- **updated_at**: timestamp without time zone, default now()                            +
- **notes**: text                                                                       +
- **rent_change**: numeric                                                              +
- **status**: character varying(50), default 'pending'character varying                 +
- **renewal_term**: integer(32,0)                                                       +
- **renewal_date**: date, required                                                      +
- **created_at**: timestamp without time zone, default now()                            +

### leases                                                                              +
- **status**: character varying(50), default 'Pending'character varying                 +
- **tenant_id**: uuid                                                                   +
- **lease_terms**: text                                                                 +
- **next_payment_date**: date                                                           +
- **document_status**: character varying(50), default 'draft'character varying          +
- **lease_document_url**: text                                                          +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **security_deposit**: numeric(10,2)                                                   +
- **last_payment_date**: date                                                           +
- **is_auto_renew**: boolean, default false                                             +
- **payment_day**: integer(32,0)                                                        +
- **end_date**: date, required                                                          +
- **current_balance**: numeric, default 0                                               +
- **updated_at**: timestamp without time zone, default now()                            +
- **late_fee_days**: integer(32,0), default 5                                           +
- **late_fee_amount**: numeric, default 0                                               +
- **created_at**: timestamp without time zone, default now()                            +
- **start_date**: date, required, default now()                                         +
- **unit_id**: uuid                                                                     +
- **rent_amount**: numeric(12,2), required                                              +
- **notice_period_days**: integer(32,0), default 30                                     +

### maintenance_comments                                                                +
- **ticket_id**: uuid, required                                                         +
- **updated_at**: timestamp without time zone, default now()                            +
- **commented_by**: uuid                                                                +
- **created_at**: timestamp without time zone, default now()                            +
- **comment**: text, required                                                           +
- **id**: uuid, required, default uuid_generate_v4()                                    +

### maintenance_requests                                                                +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **related_to_id**: uuid                                                               +
- **property_id**: uuid                                                                 +
- **status**: character varying(50), default 'pending'character varying                 +
- **owner_id**: uuid                                                                    +
- **tenant_id**: uuid                                                                   +
- **title**: character varying(255), required                                           +
- **description**: text, required                                                       +
- **due_date**: timestamp without time zone                                             +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **assigned_to**: uuid                                                                 +
- **unit_id**: uuid                                                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **priority**: character varying(50), required                                         +
- **completed_at**: timestamp with time zone                                            +
- **maintenance_type_id**: uuid                                                         +
- **related_to_type**: character varying(50)                                            +
- **scheduled_date**: timestamp without time zone                                       +
- **maintenance_type**: character varying(100)                                          +

### maintenance_ticket_history                                                          +
- **previous_status**: character varying(50)                                            +
- **new_status**: character varying(50)                                                 +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **created_at**: timestamp without time zone, default now()                            +
- **changed_by**: uuid                                                                  +
- **change_description**: text, required                                                +
- **ticket_id**: uuid, required                                                         +

### maintenance_types                                                                   +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **description**: text                                                                 +
- **organization_id**: uuid, required                                                   +
- **estimated_resolution_time**: integer(32,0)                                          +
- **is_emergency**: boolean, default false                                              +
- **name**: character varying(100), required                                            +
- **updated_at**: timestamp without time zone, default now()                            +
- **created_at**: timestamp without time zone, default now()                            +

### notifications                                                                       +
- **read**: boolean, default false                                                      +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **message**: text, required                                                           +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **title**: character varying(255), required                                           +
- **type**: character varying(50), required                                             +
- **user_id**: uuid                                                                     +

### organization_invitations                                                            +
- **updated_at**: timestamp with time zone, default now()                               +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **expires_at**: timestamp with time zone, required                                    +
- **invited_by**: uuid, required                                                        +
- **status**: character varying(20), default 'pending'character varying                 +
- **role_id**: uuid, required                                                           +
- **created_at**: timestamp with time zone, default now()                               +
- **organization_id**: uuid, required                                                   +
- **token**: character varying(255), required                                           +
- **email**: character varying(255), required                                           +

### organizations                                                                       +
- **active**: boolean, default true                                                     +
- **subscription_status**: character varying(50), default 'inactive'character varying   +
- **email**: character varying(255)                                                     +
- **billing_address**: text                                                             +
- **subscription_plan**: character varying(50)                                          +
- **website**: character varying(255)                                                   +
- **phone**: character varying(50)                                                      +
- **timezone**: character varying(50), default 'UTC'character varying                   +
- **currency**: character varying(10), default 'USD'character varying                   +
- **billing_cycle**: character varying(20)                                              +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **tax_id**: character varying(50)                                                     +
- **name**: character varying(255), required                                            +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **date_format**: character varying(20), default 'YYYY-MM-DD'character varying         +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **logo_url**: text                                                                    +

### owners                                                                              +
- **updated_at**: timestamp without time zone, default now()                            +
- **payment_schedule**: character varying(50), default 'monthly'character varying       +
- **business_type**: character varying(50)                                              +
- **tax_id**: character varying(50)                                                     +
- **taxpayer_id**: character varying(50)                                                +
- **bank_account_id**: uuid                                                             +
- **user_id**: uuid                                                                     +
- **notes**: text                                                                       +
- **payment_method**: character varying(50)                                             +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **company_name**: character varying(255)                                              +
- **status**: character varying(50), default 'active'character varying                  +
- **created_at**: timestamp without time zone, default now()                            +
- **email**: character varying(255)                                                     +
- **address**: text                                                                     +

### payment_categories                                                                  +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **description**: text                                                                 +
- **name**: character varying(100), required                                            +
- **is_predefined**: boolean, default false                                             +
- **organization_id**: uuid, required                                                   +

### payment_methods                                                                     +
- **name**: character varying(100), required                                            +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **organization_id**: uuid, required                                                   +
- **description**: text                                                                 +
- **id**: uuid, required, default gen_random_uuid()                                     +

### payment_schedules                                                                   +
- **amount**: numeric(10,2), required                                                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **bank_account_id**: uuid, required                                                   +
- **last_run_date**: date                                                               +
- **active**: boolean, default true                                                     +
- **category_id**: uuid                                                                 +
- **start_date**: date, required                                                        +
- **description**: text                                                                 +
- **next_schedule_date**: date, required                                                +
- **created_by**: uuid, required                                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **frequency**: character varying(50), required                                        +
- **day_of_month**: integer(32,0)                                                       +
- **lease_id**: uuid                                                                    +
- **organization_id**: uuid, required                                                   +
- **end_date**: date                                                                    +

### payment_transactions                                                                +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **status**: character varying(50), default 'pending'character varying                 +
- **gateway_response**: jsonb                                                           +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **external_id**: character varying(255)                                               +
- **payment_id**: uuid, required                                                        +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **transaction_date**: timestamp with time zone, default CURRENT_TIMESTAMP             +
- **organization_id**: uuid, required                                                   +
- **amount**: numeric(10,2), required                                                   +

### payments                                                                            +
- **status**: character varying(50), default 'pending'character varying                 +
- **payment_date**: date, required                                                      +
- **amount**: numeric(12,2), required                                                   +
- **created_by**: uuid                                                                  +
- **category_id**: uuid                                                                 +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **invoice_id**: uuid                                                                  +
- **organization_id**: uuid, required                                                   +
- **lease_id**: uuid                                                                    +
- **bank_account_id**: uuid                                                             +
- **transaction_id**: character varying(255)                                            +
- **payment_method_id**: uuid                                                           +
- **recipient_type**: character varying(50)                                             +
- **payment_type**: character varying(50), default 'one-time'character varying          +
- **recipient_id**: uuid                                                                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **next_scheduled_date**: date                                                         +

### properties                                                                          +
- **owner_id**: uuid                                                                    +
- **organization_id**: uuid                                                             +
- **last_activity_date**: timestamp with time zone                                      +
- **occupancy_rate**: numeric, default 0                                                +
- **state**: character varying(100), required                                           +
- **total_units**: integer(32,0), required                                              +
- **property_manager_id**: uuid                                                         +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **zip_code**: character varying(20), required                                         +
- **address**: text, required                                                           +
- **property_status**: character varying(50), default 'active'character varying         +
- **active_leases**: integer(32,0), default 0                                           +
- **updated_at**: timestamp without time zone, default now()                            +
- **city**: character varying(100), required                                            +
- **name**: character varying(255), required                                            +
- **monthly_revenue**: numeric, default 0                                               +
- **created_at**: timestamp without time zone, default now()                            +

### property_inspections                                                                +
- **notes**: text                                                                       +
- **inspector_id**: uuid                                                                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **property_id**: uuid                                                                 +
- **status**: text, required, default 'scheduled'text                                   +
- **unit_id**: uuid                                                                     +
- **organization_id**: uuid, required                                                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **report_url**: text                                                                  +
- **inspection_date**: timestamp with time zone, required                               +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### property_managers                                                                   +
- **created_at**: timestamp without time zone, default now()                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **user_id**: uuid                                                                     +
- **updated_at**: timestamp without time zone, default now()                            +
- **assigned_properties**: ARRAY, default '{}'uuid[]                                    +
- **organization_id**: uuid                                                             +

### property_metrics                                                                    +
- **outstanding_invoices**: numeric(12,2), default 0                                    +
- **maintenance_costs**: numeric, default 0                                             +
- **net_revenue**: numeric(12,2)                                                        +
- **occupancy_rate**: numeric, default 0                                                +
- **monthly_revenue**: numeric, default 0                                               +
- **collected_rent**: numeric, default 0                                                +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **total_expenses**: numeric(12,2), default 0                                          +
- **created_at**: timestamp with time zone, default now()                               +
- **metric_date**: date, required                                                       +
- **operational_costs**: numeric, default 0                                             +
- **property_id**: uuid, required                                                       +
- **active_leases**: integer(32,0), default 0                                           +
- **outstanding_rent**: numeric, default 0                                              +
- **total_income**: numeric(12,2), default 0                                            +

### property_stakeholders                                                               +
- **created_at**: timestamp with time zone, default now()                               +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **end_date**: date                                                                    +
- **notes**: text                                                                       +
- **is_primary**: boolean, default false                                                +
- **start_date**: date, required                                                        +
- **user_id**: uuid, required                                                           +
- **stakeholder_type**: character varying(50), required                                 +
- **property_id**: uuid, required                                                       +
- **updated_at**: timestamp with time zone, default now()                               +
- **ownership_percentage**: numeric, default 100                                        +

### rental_applications                                                                 +
- **desired_move_in_date**: date                                                        +
- **application_date**: timestamp with time zone, default now()                         +
- **reviewed_by**: uuid                                                                 +
- **has_vehicles**: boolean, default false                                              +
- **monthly_income**: numeric                                                           +
- **created_at**: timestamp with time zone, default now()                               +
- **emergency_contact**: jsonb                                                          +
- **updated_at**: timestamp with time zone, default now()                               +
- **notes**: text                                                                       +
- **unit_id**: uuid                                                                     +
- **has_pets**: boolean, default false                                                  +
- **background_check_status**: character varying(50)                                    +
- **rejection_reason**: text                                                            +
- **application_fee_paid**: boolean, default false                                      +
- **employment_info**: jsonb                                                            +
- **review_date**: timestamp with time zone                                             +
- **pet_details**: jsonb                                                                +
- **applicant_id**: uuid                                                                +
- **credit_check_status**: character varying(50)                                        +
- **previous_address**: text                                                            +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **property_id**: uuid                                                                 +
- **vehicle_details**: jsonb                                                            +
- **status**: character varying(50), default 'pending'character varying                 +
- **lease_term**: integer(32,0)                                                         +

### roles                                                                               +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **permissions**: jsonb                                                                +
- **name**: character varying(50), required                                             +
- **updated_at**: timestamp with time zone, default now()                               +
- **description**: text                                                                 +
- **is_system_role**: boolean, default false                                            +

### tasks                                                                               +
- **title**: character varying(255), required                                           +
- **status**: character varying(50), required, default 'pending'character varying       +
- **owner_id**: uuid                                                                    +
- **priority**: character varying(50), required                                         +
- **updated_at**: timestamp without time zone, default now()                            +
- **assigned_to**: uuid                                                                 +
- **due_date**: timestamp without time zone                                             +
- **organization_id**: uuid                                                             +
- **description**: text                                                                 +
- **related_to_type**: character varying(50)                                            +
- **created_at**: timestamp without time zone, default now()                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **related_to_id**: uuid                                                               +

### team_members                                                                        +
- **updated_at**: timestamp with time zone, default now()                               +
- **job_title**: character varying(100)                                                 +
- **user_id**: uuid, required                                                           +
- **department**: character varying(100)                                                +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **created_at**: timestamp with time zone, default now()                               +
- **role_id**: uuid                                                                     +

### tenants                                                                             +
- **current_property_id**: uuid                                                         +
- **rent_amount**: numeric                                                              +
- **emergency_contact_relationship**: character varying(100)                            +
- **special_accommodations**: text                                                      +
- **vehicles**: jsonb                                                                   +
- **pets**: jsonb                                                                       +
- **background_check_passed**: boolean                                                  +
- **lease_start_date**: date, required                                                  +
- **move_in_date**: date                                                                +
- **backgroundcheckdate**: date                                                         +
- **status**: character varying(50), default 'active'character varying                  +
- **emergency_contact**: jsonb                                                          +
- **emergency_contact_phone**: character varying(50)                                    +
- **created_at**: timestamp without time zone, default now()                            +
- **background_check_status**: character varying(50), default 'pending'character varying+
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **current_unit_id**: uuid                                                             +
- **background_check_date**: date                                                       +
- **payment_history**: jsonb                                                            +
- **language_preference**: character varying(50), default 'English'character varying    +
- **preferred_contact_methods**: ARRAY, default ARRAY['email'text]                      +
- **eviction_history**: boolean, default false                                          +
- **user_id**: uuid                                                                     +
- **updated_at**: timestamp without time zone, default now()                            +
- **lease_end_date**: date                                                              +

### units                                                                               +
- **square_feet**: integer(32,0)                                                        +
- **smart_lock_enabled**: boolean, default false                                        +
- **status**: character varying(50), default 'Available'character varying               +
- **bedrooms**: integer(32,0)                                                           +
- **maintenance_history**: jsonb                                                        +
- **floor_plan**: character varying(100)                                                +
- **created_at**: timestamp without time zone, default now()                            +
- **smart_lock_details**: jsonb                                                         +
- **current_tenant_id**: uuid                                                           +
- **bathrooms**: numeric(2,1)                                                           +
- **lease_end_date**: date                                                              +
- **next_inspection_date**: date                                                        +
- **lease_start_date**: date                                                            +
- **rent_amount**: numeric(10,2)                                                        +
- **unit_number**: character varying(50), required                                      +
- **utility_meters**: jsonb                                                             +
- **last_inspection_date**: date                                                        +
- **updated_at**: timestamp without time zone, default now()                            +
- **property_id**: uuid                                                                 +
- **id**: uuid, required, default uuid_generate_v4()                                    +

### user_profiles                                                                       +
- **two_factor_enabled**: boolean, default false                                        +
- **first_name**: character varying(100), required                                      +
- **profile_image_url**: text                                                           +
- **phone_verified**: boolean, default false                                            +
- **last_login_at**: timestamp with time zone                                           +
- **organization_id**: uuid                                                             +
- **default_organization_id**: uuid                                                     +
- **time_zone**: character varying(50), default 'UTC'character varying                  +
- **email_verified**: boolean, default false                                            +
- **verification_status**: character varying(20), default 'unverified'character varying +
- **last_name**: character varying(100), required                                       +
- **phone**: character varying(50)                                                      +
- **status**: character varying(20), default 'active'character varying                  +
- **notification_preferences**: jsonb                                                   +
- **preferred_contact_time**: character varying(50)                                     +
- **id**: uuid, required                                                                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **preferred_contact_methods**: ARRAY, default ARRAY['email'text]                      +
- **email**: character varying(255), required                                           +

### user_roles                                                                          +
- **updated_at**: timestamp with time zone, default now()                               +
- **role_id**: uuid                                                                     +
- **user_id**: uuid                                                                     +
- **organization_id**: uuid                                                             +
- **created_at**: timestamp with time zone, default now()                               +
- **id**: uuid, required, default uuid_generate_v4()                                    +

### vendors                                                                             +
- **user_id**: uuid                                                                     +
- **hourly_rate**: numeric                                                              +
- **payment_terms**: character varying(100)                                             +
- **performance_rating**: numeric(3,2)                                                  +
- **preferred_bank_account_id**: uuid                                                   +
- **emergency_service**: boolean, default false                                         +
- **notes**: text                                                                       +
- **service_availability**: jsonb                                                       +
- **service_areas**: jsonb                                                              +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **service_type**: character varying(100), required                                    +
- **business_type**: character varying(50)                                              +
- **updated_at**: timestamp without time zone, default now()                            +
- **created_at**: timestamp without time zone, default now()                            +



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
- **owners**: id
- **payment_categories**: id
- **payment_methods**: id
- **payment_schedules**: id
- **payment_transactions**: id
- **payments**: id
- **properties**: id
- **property_inspections**: id
- **property_managers**: id
- **property_metrics**: id
- **property_stakeholders**: id
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
- **owners.bank_account_id** references **bank_accounts.id**
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
- **properties.property_manager_id** references **property_managers.id**
- **property_inspections.inspector_id** references **user_profiles.id**
- **property_inspections.organization_id** references **organizations.id**
- **property_inspections.property_id** references **properties.id**
- **property_inspections.unit_id** references **units.id**
- **property_managers.organization_id** references **organizations.id**
- **property_managers.user_id** references **user_profiles.id**
- **property_metrics.property_id** references **properties.id**
- **property_stakeholders.property_id** references **properties.id**
- **property_stakeholders.user_id** references **user_profiles.id**
- **rental_applications.applicant_id** references **user_profiles.id**
- **rental_applications.property_id** references **properties.id**
- **rental_applications.reviewed_by** references **user_profiles.id**
- **rental_applications.unit_id** references **units.id**
- **tasks.assigned_to** references **user_profiles.id**
- **tasks.organization_id** references **organizations.id**
- **tasks.owner_id** references **user_profiles.id**
- **team_members.role_id** references **roles.id**
- **team_members.user_id** references **user_profiles.id**
- **tenants.current_property_id** references **properties.id**
- **tenants.current_unit_id** references **units.id**
- **tenants.user_id** references **user_profiles.id**
- **units.current_tenant_id** references **user_profiles.id**
- **units.property_id** references **properties.id**
- **user_profiles.default_organization_id** references **organizations.id**
- **user_profiles.organization_id** references **organizations.id**
- **user_roles.organization_id** references **organizations.id**
- **user_roles.role_id** references **roles.id**
- **user_roles.user_id** references **user_profiles.id**
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
### organizations                                                  +
- **Organizations are viewable by organization members**: For r    +

### user_profiles                                                  +
- **Enable insert for authenticated users**: For a to authenticated+
- **Users can view profiles in their organization**: For r         +


