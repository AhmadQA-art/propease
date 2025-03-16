# Supabase Database Schema Documentation

This document provides an overview of the database schema for the PropEase property management system.
Last updated: Sun Mar 16 02:06:14 PM +03 2025

## Tables
### activity_logs                                                                       +
- **description**: text, required                                                       +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **activity_type**: character varying(100), required                                   +
- **metadata**: jsonb                                                                   +
- **property_id**: uuid                                                                 +
- **organization_id**: uuid, required                                                   +
- **user_id**: uuid                                                                     +
- **unit_id**: uuid                                                                     +
- **created_at**: timestamp with time zone, default now()                               +

### announcement_schedules                                                              +
- **next_run**: timestamp with time zone, required                                      +
- **time_of_day**: time without time zone, required                                     +
- **start_date**: timestamp with time zone, required                                    +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **repeat_on**: jsonb                                                                  +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **announcement_id**: uuid, required                                                   +
- **created_at**: timestamp with time zone, required, default now()                     +
- **end_date**: timestamp with time zone                                                +
- **repeat_frequency**: text                                                            +

### announcement_targets                                                                +
- **target_name**: text                                                                 +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **created_at**: timestamp with time zone, required, default now()                     +
- **target_id**: uuid                                                                   +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **target_type**: text, required                                                       +
- **announcement_id**: uuid, required                                                   +

### announcement_types                                                                  +
- **created_at**: timestamp with time zone, required, default now()                     +
- **name**: text, required                                                              +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **organization_id**: uuid, required                                                   +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **description**: text                                                                 +

### announcements                                                                       +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **organization_id**: uuid, required                                                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **communication_method**: ARRAY, required                                             +
- **content**: text, required                                                           +
- **title**: text, required                                                             +
- **announcement_type_id**: uuid                                                        +
- **author_id**: uuid, required                                                         +
- **status**: text, required, default 'draft'text                                       +
- **created_at**: timestamp with time zone, required, default now()                     +
- **issue_date**: timestamp with time zone                                              +
- **property_id**: uuid                                                                 +
- **is_scheduled**: boolean, required, default false                                    +

### bank_account_types                                                                  +
- **description**: text                                                                 +
- **name**: character varying(100), required                                            +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **is_predefined**: boolean, default false                                             +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **organization_id**: uuid, required                                                   +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### bank_accounts                                                                       +
- **status**: character varying(50), default 'active'character varying                  +
- **created_by**: uuid, required                                                        +
- **currency**: character varying(10), default 'USD'character varying                   +
- **balance_available**: numeric(12,2), default 0                                       +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **last_synced**: timestamp with time zone                                             +
- **account_number**: character varying(255), required                                  +
- **account_name**: character varying(255), required                                    +
- **account_type_id**: uuid, required                                                   +
- **organization_id**: uuid, required                                                   +
- **institution_id**: character varying(255)                                            +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **metadata**: jsonb                                                                   +
- **is_default**: boolean, default false                                                +
- **balance_current**: numeric(12,2), default 0                                         +
- **bank_name**: character varying(255), required                                       +
- **routing_number**: character varying(50)                                             +
- **external_id**: character varying(255)                                               +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### communication_logs                                                                  +
- **announcement_id**: uuid                                                             +
- **sent_at**: timestamp with time zone                                                 +
- **status**: text, required, default 'queued'text                                      +
- **method**: text, required                                                            +
- **created_at**: timestamp with time zone, required, default now()                     +
- **recipient_id**: uuid, required                                                      +
- **subject**: text                                                                     +
- **updated_at**: timestamp with time zone, required, default now()                     +
- **error_message**: text                                                               +
- **content**: text, required                                                           +
- **sender_id**: uuid                                                                   +
- **read_at**: timestamp with time zone                                                 +
- **delivered_at**: timestamp with time zone                                            +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **recipient_type**: text, required                                                    +
- **organization_id**: uuid, required                                                   +
- **message_type**: text, required                                                      +

### demo_requests                                                                       +
- **company_size**: character varying(50)                                               +
- **country**: character varying(100)                                                   +
- **company_name**: character varying(255), required                                    +
- **additional_comments**: text                                                         +
- **email**: character varying(255), required                                           +
- **full_name**: character varying(255), required                                       +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **demo_preferences**: text                                                            +
- **industry**: character varying(100)                                                  +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **phone**: character varying(50)                                                      +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **job_title**: character varying(100)                                                 +

### documents                                                                           +
- **document_url**: text, required                                                      +
- **related_to_type**: character varying(50), required                                  +
- **document_name**: character varying(255), required                                   +
- **updated_at**: timestamp without time zone, default now()                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **organization_id**: uuid                                                             +
- **document_type**: character varying(100), required                                   +
- **created_at**: timestamp without time zone, default now()                            +
- **related_to_id**: uuid, required                                                     +
- **uploaded_by**: uuid                                                                 +

### expenses                                                                            +
- **description**: text                                                                 +
- **payee**: character varying(255), required                                           +
- **amount**: numeric(12,2), required                                                   +
- **expense_date**: date, required                                                      +
- **property_id**: uuid                                                                 +
- **status**: character varying(50), default 'recorded'character varying                +
- **payment_method_id**: uuid                                                           +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **category_id**: uuid, required                                                       +
- **unit_id**: uuid                                                                     +
- **organization_id**: uuid, required                                                   +
- **created_by**: uuid, required                                                        +
- **receipt_url**: text                                                                 +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### financial_summaries                                                                 +
- **upcoming_payables**: numeric(12,2), default 0                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **period_start**: date, required                                                      +
- **total_income**: numeric(12,2), default 0                                            +
- **organization_id**: uuid, required                                                   +
- **property_id**: uuid                                                                 +
- **period_end**: date, required                                                        +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **total_expenses**: numeric(12,2), default 0                                          +
- **net_revenue**: numeric(12,2)                                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **outstanding_invoices**: numeric(12,2), default 0                                    +

### invoice_items                                                                       +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **unit_price**: numeric(12,2), required                                               +
- **description**: text, required                                                       +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **quantity**: numeric(10,2), required, default 1                                      +
- **invoice_id**: uuid, required                                                        +
- **amount**: numeric(12,2), required                                                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **tax_amount**: numeric(12,2), default 0                                              +
- **tax_rate**: numeric(5,2), default 0                                                 +

### invoice_payments                                                                    +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **payment_id**: uuid, required                                                        +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **invoice_id**: uuid, required                                                        +
- **amount_applied**: numeric(12,2), required                                           +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### invoices                                                                            +
- **unit_id**: uuid                                                                     +
- **amount_paid**: numeric(12,2), default 0                                             +
- **status**: character varying(50), required, default 'draft'character varying         +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **issue_date**: date, required                                                        +
- **invoice_number**: character varying(50), required                                   +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **amount_due**: numeric(12,2)                                                         +
- **pdf_url**: text                                                                     +
- **amount_total**: numeric(12,2), required                                             +
- **client_name**: character varying(255), required                                     +
- **created_by**: uuid, required                                                        +
- **notes**: text                                                                       +
- **client_id**: uuid                                                                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **property_id**: uuid                                                                 +
- **organization_id**: uuid, required                                                   +
- **due_date**: date, required                                                          +
- **client_type**: character varying(50), required                                      +

### lease_addendums                                                                     +
- **created_at**: timestamp without time zone, default now()                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **title**: character varying(255), required                                           +
- **description**: text                                                                 +
- **updated_at**: timestamp without time zone, default now()                            +
- **lease_id**: uuid, required                                                          +
- **effective_date**: date, required                                                    +
- **document_url**: text                                                                +
- **created_by**: uuid                                                                  +

### lease_renewals                                                                      +
- **renewal_date**: date, required                                                      +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **created_at**: timestamp without time zone, default now()                            +
- **new_lease_id**: uuid                                                                +
- **original_lease_id**: uuid, required                                                 +
- **renewal_term**: integer(32,0)                                                       +
- **notes**: text                                                                       +
- **rent_change**: numeric                                                              +
- **updated_at**: timestamp without time zone, default now()                            +
- **status**: character varying(50), default 'pending'character varying                 +

### leases                                                                              +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **start_date**: date, required, default now()                                         +
- **rent_amount**: numeric(12,2), required                                              +
- **late_fee_days**: integer(32,0), default 5                                           +
- **current_balance**: numeric, default 0                                               +
- **next_payment_date**: date                                                           +
- **end_date**: date, required                                                          +
- **lease_document_url**: text                                                          +
- **is_auto_renew**: boolean, default false                                             +
- **lease_terms**: text                                                                 +
- **created_at**: timestamp without time zone, default now()                            +
- **unit_id**: uuid                                                                     +
- **document_status**: character varying(50), default 'draft'character varying          +
- **notice_period_days**: integer(32,0), default 30                                     +
- **updated_at**: timestamp without time zone, default now()                            +
- **last_payment_date**: date                                                           +
- **payment_day**: integer(32,0)                                                        +
- **tenant_id**: uuid                                                                   +
- **status**: character varying(50), default 'Pending'character varying                 +
- **security_deposit**: numeric(10,2)                                                   +
- **late_fee_amount**: numeric, default 0                                               +

### maintenance_comments                                                                +
- **created_at**: timestamp without time zone, default now()                            +
- **ticket_id**: uuid, required                                                         +
- **commented_by**: uuid                                                                +
- **updated_at**: timestamp without time zone, default now()                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **comment**: text, required                                                           +

### maintenance_requests                                                                +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **owner_id**: uuid                                                                    +
- **description**: text, required                                                       +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **tenant_id**: uuid                                                                   +
- **priority**: character varying(50), required                                         +
- **maintenance_type_id**: uuid                                                         +
- **status**: character varying(50), default 'pending'character varying                 +
- **title**: character varying(255), required                                           +
- **related_to_id**: uuid                                                               +
- **completed_at**: timestamp with time zone                                            +
- **unit_id**: uuid                                                                     +
- **scheduled_date**: timestamp without time zone                                       +
- **assigned_to**: uuid                                                                 +
- **due_date**: timestamp without time zone                                             +
- **maintenance_type**: character varying(100)                                          +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **property_id**: uuid                                                                 +
- **related_to_type**: character varying(50)                                            +

### maintenance_ticket_history                                                          +
- **new_status**: character varying(50)                                                 +
- **ticket_id**: uuid, required                                                         +
- **created_at**: timestamp without time zone, default now()                            +
- **change_description**: text, required                                                +
- **changed_by**: uuid                                                                  +
- **previous_status**: character varying(50)                                            +
- **id**: uuid, required, default uuid_generate_v4()                                    +

### maintenance_types                                                                   +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **is_emergency**: boolean, default false                                              +
- **description**: text                                                                 +
- **created_at**: timestamp without time zone, default now()                            +
- **updated_at**: timestamp without time zone, default now()                            +
- **name**: character varying(100), required                                            +
- **estimated_resolution_time**: integer(32,0)                                          +
- **organization_id**: uuid, required                                                   +

### notifications                                                                       +
- **message**: text, required                                                           +
- **read**: boolean, default false                                                      +
- **type**: character varying(50), required                                             +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **user_id**: uuid                                                                     +
- **title**: character varying(255), required                                           +

### organization_invitations                                                            +
- **organization_id**: uuid, required                                                   +
- **role_id**: uuid, required                                                           +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **email**: character varying(255), required                                           +
- **created_at**: timestamp with time zone, default now()                               +
- **status**: character varying(20), default 'pending'character varying                 +
- **expires_at**: timestamp with time zone, required                                    +
- **token**: character varying(255)                                                     +
- **invited_by**: uuid, required                                                        +
- **updated_at**: timestamp with time zone, default now()                               +

### organizations                                                                       +
- **website**: character varying(255)                                                   +
- **tax_id**: character varying(50)                                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **subscription_status**: character varying(50), default 'inactive'character varying   +
- **active**: boolean, default true                                                     +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **billing_cycle**: character varying(20)                                              +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **date_format**: character varying(20), default 'YYYY-MM-DD'character varying         +
- **email**: character varying(255)                                                     +
- **subscription_plan**: character varying(50)                                          +
- **logo_url**: text                                                                    +
- **billing_address**: text                                                             +
- **name**: character varying(255), required                                            +
- **phone**: character varying(50)                                                      +
- **currency**: character varying(10), default 'USD'character varying                   +
- **timezone**: character varying(50), default 'UTC'character varying                   +

### owners                                                                              +
- **tax_id**: character varying(50)                                                     +
- **company_name**: character varying(255)                                              +
- **payment_method**: character varying(50)                                             +
- **business_type**: character varying(50)                                              +
- **status**: character varying(50), default 'active'character varying                  +
- **notes**: text                                                                       +
- **name**: character varying(100)                                                      +
- **organization_id**: uuid, required                                                   +
- **email**: character varying(255)                                                     +
- **payment_schedule**: character varying(50), default 'monthly'character varying       +
- **bank_account_id**: uuid                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **user_id**: uuid                                                                     +
- **taxpayer_id**: character varying(50)                                                +
- **created_at**: timestamp without time zone, default now()                            +
- **address**: text                                                                     +
- **updated_at**: timestamp without time zone, default now()                            +

### payment_categories                                                                  +
- **description**: text                                                                 +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **organization_id**: uuid, required                                                   +
- **name**: character varying(100), required                                            +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **is_predefined**: boolean, default false                                             +

### payment_methods                                                                     +
- **description**: text                                                                 +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **name**: character varying(100), required                                            +
- **organization_id**: uuid, required                                                   +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### payment_schedules                                                                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **category_id**: uuid                                                                 +
- **end_date**: date                                                                    +
- **start_date**: date, required                                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **bank_account_id**: uuid, required                                                   +
- **lease_id**: uuid                                                                    +
- **description**: text                                                                 +
- **organization_id**: uuid, required                                                   +
- **last_run_date**: date                                                               +
- **active**: boolean, default true                                                     +
- **day_of_month**: integer(32,0)                                                       +
- **next_schedule_date**: date, required                                                +
- **frequency**: character varying(50), required                                        +
- **created_by**: uuid, required                                                        +
- **amount**: numeric(10,2), required                                                   +

### payment_transactions                                                                +
- **organization_id**: uuid, required                                                   +
- **transaction_date**: timestamp with time zone, default CURRENT_TIMESTAMP             +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **payment_id**: uuid, required                                                        +
- **external_id**: character varying(255)                                               +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **gateway_response**: jsonb                                                           +
- **amount**: numeric(10,2), required                                                   +
- **status**: character varying(50), default 'pending'character varying                 +

### payments                                                                            +
- **payment_date**: date, required                                                      +
- **transaction_id**: character varying(255)                                            +
- **invoice_id**: uuid                                                                  +
- **lease_id**: uuid                                                                    +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **organization_id**: uuid, required                                                   +
- **payment_method_id**: uuid                                                           +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **bank_account_id**: uuid                                                             +
- **recipient_type**: character varying(50)                                             +
- **category_id**: uuid                                                                 +
- **recipient_id**: uuid                                                                +
- **amount**: numeric(12,2), required                                                   +
- **created_by**: uuid                                                                  +
- **payment_type**: character varying(50), default 'one-time'character varying          +
- **next_scheduled_date**: date                                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **status**: character varying(50), default 'pending'character varying                 +

### properties                                                                          +
- **occupancy_rate**: numeric, default 0                                                +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **state**: character varying(100), required                                           +
- **active_leases**: integer(32,0), default 0                                           +
- **updated_at**: timestamp without time zone, default now()                            +
- **zip_code**: character varying(20), required                                         +
- **last_activity_date**: timestamp with time zone                                      +
- **created_at**: timestamp without time zone, default now()                            +
- **monthly_revenue**: numeric, default 0                                               +
- **name**: character varying(255), required                                            +
- **city**: character varying(100), required                                            +
- **owner_id**: uuid                                                                    +
- **address**: text, required                                                           +
- **property_manager_id**: uuid                                                         +
- **property_status**: character varying(50), default 'active'character varying         +
- **total_units**: integer(32,0), required                                              +
- **organization_id**: uuid                                                             +

### property_inspections                                                                +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **report_url**: text                                                                  +
- **property_id**: uuid                                                                 +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **unit_id**: uuid                                                                     +
- **organization_id**: uuid, required                                                   +
- **status**: text, required, default 'scheduled'text                                   +
- **notes**: text                                                                       +
- **inspection_date**: timestamp with time zone, required                               +
- **inspector_id**: uuid                                                                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +

### property_managers                                                                   +
- **user_id**: uuid                                                                     +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **assigned_properties**: ARRAY, default '{}'uuid[]                                    +
- **organization_id**: uuid                                                             +
- **updated_at**: timestamp without time zone, default now()                            +
- **created_at**: timestamp without time zone, default now()                            +

### property_metrics                                                                    +
- **created_at**: timestamp with time zone, default now()                               +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **active_leases**: integer(32,0), default 0                                           +
- **operational_costs**: numeric, default 0                                             +
- **collected_rent**: numeric, default 0                                                +
- **occupancy_rate**: numeric, default 0                                                +
- **net_revenue**: numeric(12,2)                                                        +
- **monthly_revenue**: numeric, default 0                                               +
- **property_id**: uuid, required                                                       +
- **maintenance_costs**: numeric, default 0                                             +
- **metric_date**: date, required                                                       +
- **total_income**: numeric(12,2), default 0                                            +
- **outstanding_rent**: numeric, default 0                                              +
- **total_expenses**: numeric(12,2), default 0                                          +
- **outstanding_invoices**: numeric(12,2), default 0                                    +

### property_stakeholders                                                               +
- **is_primary**: boolean, default false                                                +
- **stakeholder_type**: character varying(50), required                                 +
- **created_at**: timestamp with time zone, default now()                               +
- **start_date**: date, required                                                        +
- **user_id**: uuid, required                                                           +
- **updated_at**: timestamp with time zone, default now()                               +
- **end_date**: date                                                                    +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **notes**: text                                                                       +
- **ownership_percentage**: numeric, default 100                                        +
- **property_id**: uuid, required                                                       +

### rental_applications                                                                 +
- **applicant_id**: uuid                                                                +
- **employment_info**: jsonb                                                            +
- **reviewed_by**: uuid                                                                 +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **updated_at**: timestamp with time zone, default now()                               +
- **status**: character varying(50), default 'pending'character varying                 +
- **rejection_reason**: text                                                            +
- **pet_details**: jsonb                                                                +
- **created_at**: timestamp with time zone, default now()                               +
- **has_vehicles**: boolean, default false                                              +
- **has_pets**: boolean, default false                                                  +
- **unit_id**: uuid                                                                     +
- **emergency_contact**: jsonb                                                          +
- **credit_check_status**: character varying(50)                                        +
- **background_check_status**: character varying(50)                                    +
- **lease_term**: integer(32,0)                                                         +
- **desired_move_in_date**: date                                                        +
- **monthly_income**: numeric                                                           +
- **property_id**: uuid                                                                 +
- **vehicle_details**: jsonb                                                            +
- **previous_address**: text                                                            +
- **review_date**: timestamp with time zone                                             +
- **application_date**: timestamp with time zone, default now()                         +
- **application_fee_paid**: boolean, default false                                      +
- **notes**: text                                                                       +

### roles                                                                               +
- **updated_at**: timestamp with time zone, default now()                               +
- **description**: text                                                                 +
- **permissions**: jsonb                                                                +
- **is_system_role**: boolean, default false                                            +
- **name**: character varying(50), required                                             +
- **id**: uuid, required, default uuid_generate_v4()                                    +

### tasks                                                                               +
- **due_date**: timestamp without time zone                                             +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **related_to_id**: uuid                                                               +
- **created_at**: timestamp without time zone, default now()                            +
- **related_to_type**: character varying(50)                                            +
- **organization_id**: uuid                                                             +
- **status**: character varying(50), required, default 'pending'character varying       +
- **updated_at**: timestamp without time zone, default now()                            +
- **assigned_to**: uuid                                                                 +
- **description**: text                                                                 +
- **owner_id**: uuid                                                                    +
- **title**: character varying(255), required                                           +
- **priority**: character varying(50), required                                         +

### team_members                                                                        +
- **job_title**: character varying(100)                                                 +
- **role_id**: uuid                                                                     +
- **id**: uuid, required, default gen_random_uuid()                                     +
- **user_id**: uuid, required                                                           +
- **updated_at**: timestamp with time zone, default now()                               +
- **created_at**: timestamp with time zone, default now()                               +
- **department**: character varying(100)                                                +

### tenants                                                                             +
- **created_at**: timestamp without time zone, default now()                            +
- **move_in_date**: date                                                                +
- **updated_at**: timestamp without time zone, default now()                            +
- **emergency_contact_relationship**: character varying(100)                            +
- **background_check_status**: character varying(50), default 'pending'character varying+
- **phone**: character varying(50)                                                      +
- **organization_id**: uuid, required                                                   +
- **emergency_contact**: jsonb                                                          +
- **email**: character varying(255)                                                     +
- **rent_amount**: numeric                                                              +
- **pets**: jsonb                                                                       +
- **user_id**: uuid                                                                     +
- **background_check_date**: date                                                       +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **name**: character varying(100)                                                      +
- **status**: character varying(50), default 'active'character varying                  +
- **vehicles**: jsonb                                                                   +
- **preferred_contact_methods**: ARRAY, default ARRAY['email'text]                      +
- **special_accommodations**: text                                                      +
- **lease_start_date**: date                                                            +
- **current_property_id**: uuid                                                         +
- **eviction_history**: boolean, default false                                          +
- **payment_history**: jsonb                                                            +
- **language_preference**: character varying(50), default 'English'character varying    +
- **background_check_passed**: boolean                                                  +
- **backgroundcheckdate**: date                                                         +
- **current_unit_id**: uuid                                                             +
- **lease_end_date**: date                                                              +
- **emergency_contact_phone**: character varying(50)                                    +

### units                                                                               +
- **rent_amount**: numeric(10,2)                                                        +
- **last_inspection_date**: date                                                        +
- **bathrooms**: numeric(2,1)                                                           +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **current_tenant_id**: uuid                                                           +
- **maintenance_history**: jsonb                                                        +
- **lease_start_date**: date                                                            +
- **smart_lock_enabled**: boolean, default false                                        +
- **next_inspection_date**: date                                                        +
- **property_id**: uuid                                                                 +
- **square_feet**: integer(32,0)                                                        +
- **lease_end_date**: date                                                              +
- **updated_at**: timestamp without time zone, default now()                            +
- **status**: character varying(50), default 'Available'character varying               +
- **created_at**: timestamp without time zone, default now()                            +
- **bedrooms**: integer(32,0)                                                           +
- **smart_lock_details**: jsonb                                                         +
- **floor_plan**: character varying(100)                                                +
- **utility_meters**: jsonb                                                             +
- **unit_number**: character varying(50), required                                      +

### user_profiles                                                                       +
- **time_zone**: character varying(50), default 'UTC'character varying                  +
- **profile_image_url**: text                                                           +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **default_organization_id**: uuid                                                     +
- **verification_status**: character varying(20), default 'unverified'character varying +
- **organization_id**: uuid                                                             +
- **phone_verified**: boolean, default false                                            +
- **email_verified**: boolean, default false                                            +
- **last_login_at**: timestamp with time zone                                           +
- **first_name**: character varying(100), required                                      +
- **last_name**: character varying(100), required                                       +
- **status**: character varying(20), default 'active'character varying                  +
- **phone**: character varying(50)                                                      +
- **preferred_contact_time**: character varying(50)                                     +
- **id**: uuid, required                                                                +
- **email**: character varying(255), required                                           +
- **preferred_contact_methods**: ARRAY, default ARRAY['email'text]                      +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                   +
- **two_factor_enabled**: boolean, default false                                        +
- **notification_preferences**: jsonb                                                   +

### user_roles                                                                          +
- **created_at**: timestamp with time zone, default now()                               +
- **role_id**: uuid                                                                     +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **updated_at**: timestamp with time zone, default now()                               +
- **user_id**: uuid                                                                     +
- **organization_id**: uuid                                                             +

### vendors                                                                             +
- **service_availability**: jsonb                                                       +
- **email**: character varying(255)                                                     +
- **payment_terms**: character varying(100)                                             +
- **service_areas**: jsonb                                                              +
- **business_type**: character varying(50)                                              +
- **emergency_service**: boolean, default false                                         +
- **notes**: text                                                                       +
- **preferred_bank_account_id**: uuid                                                   +
- **id**: uuid, required, default uuid_generate_v4()                                    +
- **organization_id**: uuid, required                                                   +
- **performance_rating**: numeric(3,2)                                                  +
- **created_at**: timestamp without time zone, default now()                            +
- **user_id**: uuid                                                                     +
- **contact_name**: character varying(100)                                              +
- **hourly_rate**: numeric                                                              +
- **phone**: character varying(50)                                                      +
- **updated_at**: timestamp without time zone, default now()                            +
- **service_type**: character varying(100), required                                    +



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
- **tenants.organization_id** references **organizations.id**
- **tenants.user_id** references **user_profiles.id**
- **units.current_tenant_id** references **user_profiles.id**
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
### organizations                                                  +
- **Organizations are viewable by organization members**: For r    +

### user_profiles                                                  +
- **Enable insert for authenticated users**: For a to authenticated+
- **Users can view profiles in their organization**: For r         +


