# Supabase Database Schema Documentation

This document provides an overview of the database schema for the PropEase property management system.
Last updated: Wed Mar 12 11:24:53 PM +03 2025

## Tables
### activity_logs                                                                    +
- **organization_id**: uuid, required                                                +
- **unit_id**: uuid                                                                  +
- **property_id**: uuid                                                              +
- **activity_type**: character varying(100), required                                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **description**: text, required                                                    +
- **user_id**: uuid                                                                  +
- **metadata**: jsonb                                                                +
- **created_at**: timestamp with time zone, default now()                            +

### announcement_schedules                                                           +
- **announcement_id**: uuid, required                                                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **repeat_on**: jsonb                                                               +
- **next_run**: timestamp with time zone, required                                   +
- **time_of_day**: time without time zone, required                                  +
- **repeat_frequency**: text                                                         +
- **created_at**: timestamp with time zone, required, default now()                  +
- **end_date**: timestamp with time zone                                             +
- **updated_at**: timestamp with time zone, required, default now()                  +
- **start_date**: timestamp with time zone, required                                 +

### announcement_targets                                                             +
- **updated_at**: timestamp with time zone, required, default now()                  +
- **target_id**: uuid                                                                +
- **created_at**: timestamp with time zone, required, default now()                  +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **announcement_id**: uuid, required                                                +
- **target_type**: text, required                                                    +
- **target_name**: text                                                              +

### announcement_types                                                               +
- **name**: text, required                                                           +
- **created_at**: timestamp with time zone, required, default now()                  +
- **updated_at**: timestamp with time zone, required, default now()                  +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **description**: text                                                              +
- **organization_id**: uuid, required                                                +

### announcements                                                                    +
- **is_scheduled**: boolean, required, default false                                 +
- **created_at**: timestamp with time zone, required, default now()                  +
- **announcement_type_id**: uuid                                                     +
- **title**: text, required                                                          +
- **organization_id**: uuid, required                                                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **content**: text, required                                                        +
- **communication_method**: ARRAY, required                                          +
- **status**: text, required, default 'draft'text                                    +
- **author_id**: uuid, required                                                      +
- **updated_at**: timestamp with time zone, required, default now()                  +
- **issue_date**: timestamp with time zone                                           +
- **property_id**: uuid                                                              +

### bank_account_types                                                               +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **organization_id**: uuid, required                                                +
- **name**: character varying(100), required                                         +
- **description**: text                                                              +
- **is_predefined**: boolean, default false                                          +

### bank_accounts                                                                    +
- **balance_current**: numeric(12,2), default 0                                      +
- **external_id**: character varying(255)                                            +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **account_name**: character varying(255), required                                 +
- **balance_available**: numeric(12,2), default 0                                    +
- **account_type_id**: uuid, required                                                +
- **bank_name**: character varying(255), required                                    +
- **currency**: character varying(10), default 'USD'character varying                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **status**: character varying(50), default 'active'character varying               +
- **last_synced**: timestamp with time zone                                          +
- **created_by**: uuid, required                                                     +
- **is_default**: boolean, default false                                             +
- **organization_id**: uuid, required                                                +
- **metadata**: jsonb                                                                +
- **institution_id**: character varying(255)                                         +
- **account_number**: character varying(255), required                               +
- **routing_number**: character varying(50)                                          +

### communication_logs                                                               +
- **method**: text, required                                                         +
- **delivered_at**: timestamp with time zone                                         +
- **sender_id**: uuid                                                                +
- **announcement_id**: uuid                                                          +
- **sent_at**: timestamp with time zone                                              +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **status**: text, required, default 'queued'text                                   +
- **recipient_type**: text, required                                                 +
- **organization_id**: uuid, required                                                +
- **subject**: text                                                                  +
- **error_message**: text                                                            +
- **message_type**: text, required                                                   +
- **read_at**: timestamp with time zone                                              +
- **recipient_id**: uuid, required                                                   +
- **created_at**: timestamp with time zone, required, default now()                  +
- **updated_at**: timestamp with time zone, required, default now()                  +
- **content**: text, required                                                        +

### demo_requests                                                                    +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **company_size**: character varying(50)                                            +
- **phone**: character varying(50)                                                   +
- **demo_preferences**: text                                                         +
- **company_name**: character varying(255), required                                 +
- **job_title**: character varying(100)                                              +
- **country**: character varying(100)                                                +
- **full_name**: character varying(255), required                                    +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **email**: character varying(255), required                                        +
- **industry**: character varying(100)                                               +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **additional_comments**: text                                                      +

### documents                                                                        +
- **document_url**: text, required                                                   +
- **updated_at**: timestamp without time zone, default now()                         +
- **document_type**: character varying(100), required                                +
- **created_at**: timestamp without time zone, default now()                         +
- **document_name**: character varying(255), required                                +
- **related_to_type**: character varying(50), required                               +
- **related_to_id**: uuid, required                                                  +
- **uploaded_by**: uuid                                                              +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **organization_id**: uuid                                                          +

### expenses                                                                         +
- **description**: text                                                              +
- **property_id**: uuid                                                              +
- **unit_id**: uuid                                                                  +
- **payee**: character varying(255), required                                        +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **organization_id**: uuid, required                                                +
- **payment_method_id**: uuid                                                        +
- **created_by**: uuid, required                                                     +
- **category_id**: uuid, required                                                    +
- **receipt_url**: text                                                              +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **status**: character varying(50), default 'recorded'character varying             +
- **amount**: numeric(12,2), required                                                +
- **expense_date**: date, required                                                   +

### financial_summaries                                                              +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **property_id**: uuid                                                              +
- **net_revenue**: numeric(12,2)                                                     +
- **total_expenses**: numeric(12,2), default 0                                       +
- **total_income**: numeric(12,2), default 0                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **outstanding_invoices**: numeric(12,2), default 0                                 +
- **period_start**: date, required                                                   +
- **period_end**: date, required                                                     +
- **organization_id**: uuid, required                                                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **upcoming_payables**: numeric(12,2), default 0                                    +

### invoice_items                                                                    +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **quantity**: numeric(10,2), required, default 1                                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **invoice_id**: uuid, required                                                     +
- **tax_amount**: numeric(12,2), default 0                                           +
- **description**: text, required                                                    +
- **tax_rate**: numeric(5,2), default 0                                              +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **amount**: numeric(12,2), required                                                +
- **unit_price**: numeric(12,2), required                                            +

### invoice_payments                                                                 +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **payment_id**: uuid, required                                                     +
- **amount_applied**: numeric(12,2), required                                        +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **invoice_id**: uuid, required                                                     +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +

### invoices                                                                         +
- **status**: character varying(50), required, default 'draft'character varying      +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **client_id**: uuid                                                                +
- **pdf_url**: text                                                                  +
- **property_id**: uuid                                                              +
- **due_date**: date, required                                                       +
- **invoice_number**: character varying(50), required                                +
- **client_type**: character varying(50), required                                   +
- **unit_id**: uuid                                                                  +
- **client_name**: character varying(255), required                                  +
- **amount_paid**: numeric(12,2), default 0                                          +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **created_by**: uuid, required                                                     +
- **amount_due**: numeric(12,2)                                                      +
- **organization_id**: uuid, required                                                +
- **notes**: text                                                                    +
- **amount_total**: numeric(12,2), required                                          +
- **issue_date**: date, required                                                     +

### lease_addendums                                                                  +
- **created_by**: uuid                                                               +
- **created_at**: timestamp without time zone, default now()                         +
- **updated_at**: timestamp without time zone, default now()                         +
- **lease_id**: uuid, required                                                       +
- **document_url**: text                                                             +
- **description**: text                                                              +
- **effective_date**: date, required                                                 +
- **title**: character varying(255), required                                        +
- **id**: uuid, required, default uuid_generate_v4()                                 +

### lease_renewals                                                                   +
- **notes**: text                                                                    +
- **renewal_date**: date, required                                                   +
- **status**: character varying(50), default 'pending'character varying              +
- **renewal_term**: integer(32,0)                                                    +
- **original_lease_id**: uuid, required                                              +
- **updated_at**: timestamp without time zone, default now()                         +
- **created_at**: timestamp without time zone, default now()                         +
- **rent_change**: numeric                                                           +
- **new_lease_id**: uuid                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                 +

### leases                                                                           +
- **unit_id**: uuid                                                                  +
- **late_fee_amount**: numeric, default 0                                            +
- **current_balance**: numeric, default 0                                            +
- **created_at**: timestamp without time zone, default now()                         +
- **lease_terms**: text                                                              +
- **is_auto_renew**: boolean, default false                                          +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **updated_at**: timestamp without time zone, default now()                         +
- **payment_day**: integer(32,0)                                                     +
- **next_payment_date**: date                                                        +
- **start_date**: date, required, default now()                                      +
- **lease_document_url**: text                                                       +
- **last_payment_date**: date                                                        +
- **status**: character varying(50), default 'Pending'character varying              +
- **rent_amount**: numeric(12,2), required                                           +
- **security_deposit**: numeric(10,2)                                                +
- **late_fee_days**: integer(32,0), default 5                                        +
- **end_date**: date, required                                                       +
- **document_status**: character varying(50), default 'draft'character varying       +
- **tenant_id**: uuid                                                                +
- **notice_period_days**: integer(32,0), default 30                                  +

### maintenance_comments                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **commented_by**: uuid                                                             +
- **created_at**: timestamp without time zone, default now()                         +
- **updated_at**: timestamp without time zone, default now()                         +
- **comment**: text, required                                                        +
- **ticket_id**: uuid, required                                                      +

### maintenance_requests                                                             +
- **description**: text, required                                                    +
- **unit_id**: uuid                                                                  +
- **scheduled_date**: timestamp without time zone                                    +
- **title**: character varying(255), required                                        +
- **owner_id**: uuid                                                                 +
- **tenant_id**: uuid                                                                +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **related_to_id**: uuid                                                            +
- **status**: character varying(50), default 'pending'character varying              +
- **due_date**: timestamp without time zone                                          +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **property_id**: uuid                                                              +
- **maintenance_type**: character varying(100)                                       +
- **maintenance_type_id**: uuid                                                      +
- **priority**: character varying(50), required                                      +
- **assigned_to**: uuid                                                              +
- **related_to_type**: character varying(50)                                         +
- **completed_at**: timestamp with time zone                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +

### maintenance_ticket_history                                                       +
- **ticket_id**: uuid, required                                                      +
- **change_description**: text, required                                             +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **changed_by**: uuid                                                               +
- **created_at**: timestamp without time zone, default now()                         +
- **previous_status**: character varying(50)                                         +
- **new_status**: character varying(50)                                              +

### maintenance_types                                                                +
- **is_emergency**: boolean, default false                                           +
- **description**: text                                                              +
- **updated_at**: timestamp without time zone, default now()                         +
- **estimated_resolution_time**: integer(32,0)                                       +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **name**: character varying(100), required                                         +
- **created_at**: timestamp without time zone, default now()                         +
- **organization_id**: uuid, required                                                +

### notifications                                                                    +
- **read**: boolean, default false                                                   +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **user_id**: uuid                                                                  +
- **message**: text, required                                                        +
- **type**: character varying(50), required                                          +
- **title**: character varying(255), required                                        +
- **id**: uuid, required, default uuid_generate_v4()                                 +

### organization_invitations                                                         +
- **organization_id**: uuid, required                                                +
- **role_id**: uuid, required                                                        +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **email**: character varying(255), required                                        +
- **created_at**: timestamp with time zone, default now()                            +
- **status**: character varying(20), default 'pending'character varying              +
- **expires_at**: timestamp with time zone, required                                 +
- **token**: character varying(255), required                                        +
- **invited_by**: uuid, required                                                     +
- **updated_at**: timestamp with time zone, default now()                            +

### organizations                                                                    +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **phone**: character varying(50)                                                   +
- **billing_cycle**: character varying(20)                                           +
- **website**: character varying(255)                                                +
- **billing_address**: text                                                          +
- **name**: character varying(255), required                                         +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **subscription_plan**: character varying(50)                                       +
- **active**: boolean, default true                                                  +
- **date_format**: character varying(20), default 'YYYY-MM-DD'character varying      +
- **tax_id**: character varying(50)                                                  +
- **email**: character varying(255)                                                  +
- **logo_url**: text                                                                 +
- **currency**: character varying(10), default 'USD'character varying                +
- **subscription_status**: character varying(50), default 'inactive'character varying+
- **timezone**: character varying(50), default 'UTC'character varying                +

### owners                                                                           +
- **updated_at**: timestamp without time zone, default now()                         +
- **user_id**: uuid                                                                  +
- **created_at**: timestamp without time zone, default now()                         +
- **organization_id**: uuid                                                          +
- **id**: uuid, required, default uuid_generate_v4()                                 +

### payment_categories                                                               +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **name**: character varying(100), required                                         +
- **is_predefined**: boolean, default false                                          +
- **description**: text                                                              +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **organization_id**: uuid, required                                                +

### payment_methods                                                                  +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **organization_id**: uuid, required                                                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **description**: text                                                              +
- **name**: character varying(100), required                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +

### payment_schedules                                                                +
- **frequency**: character varying(50), required                                     +
- **description**: text                                                              +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **created_by**: uuid, required                                                     +
- **end_date**: date                                                                 +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **bank_account_id**: uuid, required                                                +
- **category_id**: uuid                                                              +
- **organization_id**: uuid, required                                                +
- **amount**: numeric(10,2), required                                                +
- **lease_id**: uuid                                                                 +
- **last_run_date**: date                                                            +
- **active**: boolean, default true                                                  +
- **day_of_month**: integer(32,0)                                                    +
- **next_schedule_date**: date, required                                             +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **start_date**: date, required                                                     +

### payment_transactions                                                             +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **organization_id**: uuid, required                                                +
- **transaction_date**: timestamp with time zone, default CURRENT_TIMESTAMP          +
- **status**: character varying(50), default 'pending'character varying              +
- **amount**: numeric(10,2), required                                                +
- **payment_id**: uuid, required                                                     +
- **external_id**: character varying(255)                                            +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **gateway_response**: jsonb                                                        +

### payments                                                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **payment_method_id**: uuid                                                        +
- **next_scheduled_date**: date                                                      +
- **organization_id**: uuid, required                                                +
- **lease_id**: uuid                                                                 +
- **category_id**: uuid                                                              +
- **transaction_id**: character varying(255)                                         +
- **recipient_type**: character varying(50)                                          +
- **status**: character varying(50), default 'pending'character varying              +
- **recipient_id**: uuid                                                             +
- **payment_type**: character varying(50), default 'one-time'character varying       +
- **invoice_id**: uuid                                                               +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **amount**: numeric(12,2), required                                                +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **bank_account_id**: uuid                                                          +
- **payment_date**: date, required                                                   +
- **created_by**: uuid                                                               +

### properties                                                                       +
- **last_activity_date**: timestamp with time zone                                   +
- **occupancy_rate**: numeric, default 0                                             +
- **active_leases**: integer(32,0), default 0                                        +
- **state**: character varying(100), required                                        +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **property_manager_id**: uuid                                                      +
- **city**: character varying(100), required                                         +
- **total_units**: integer(32,0), required                                           +
- **monthly_revenue**: numeric, default 0                                            +
- **owner_id**: uuid                                                                 +
- **property_status**: character varying(50), default 'active'character varying      +
- **created_at**: timestamp without time zone, default now()                         +
- **name**: character varying(255), required                                         +
- **zip_code**: character varying(20), required                                      +
- **address**: text, required                                                        +
- **updated_at**: timestamp without time zone, default now()                         +
- **organization_id**: uuid                                                          +

### property_inspections                                                             +
- **organization_id**: uuid, required                                                +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **report_url**: text                                                               +
- **inspector_id**: uuid                                                             +
- **property_id**: uuid                                                              +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **inspection_date**: timestamp with time zone, required                            +
- **unit_id**: uuid                                                                  +
- **notes**: text                                                                    +
- **status**: text, required, default 'scheduled'text                                +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +

### property_managers                                                                +
- **user_id**: uuid                                                                  +
- **updated_at**: timestamp without time zone, default now()                         +
- **assigned_properties**: ARRAY, default '{}'uuid[]                                 +
- **organization_id**: uuid                                                          +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **created_at**: timestamp without time zone, default now()                         +

### property_metrics                                                                 +
- **total_expenses**: numeric(12,2), default 0                                       +
- **outstanding_rent**: numeric, default 0                                           +
- **created_at**: timestamp with time zone, default now()                            +
- **property_id**: uuid, required                                                    +
- **operational_costs**: numeric, default 0                                          +
- **outstanding_invoices**: numeric(12,2), default 0                                 +
- **collected_rent**: numeric, default 0                                             +
- **active_leases**: integer(32,0), default 0                                        +
- **total_income**: numeric(12,2), default 0                                         +
- **maintenance_costs**: numeric, default 0                                          +
- **metric_date**: date, required                                                    +
- **occupancy_rate**: numeric, default 0                                             +
- **net_revenue**: numeric(12,2)                                                     +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **monthly_revenue**: numeric, default 0                                            +

### property_stakeholders                                                            +
- **start_date**: date, required                                                     +
- **end_date**: date                                                                 +
- **is_primary**: boolean, default false                                             +
- **ownership_percentage**: numeric, default 100                                     +
- **updated_at**: timestamp with time zone, default now()                            +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **created_at**: timestamp with time zone, default now()                            +
- **stakeholder_type**: character varying(50), required                              +
- **property_id**: uuid, required                                                    +
- **notes**: text                                                                    +
- **user_id**: uuid, required                                                        +

### rental_applications                                                              +
- **notes**: text                                                                    +
- **id**: uuid, required, default gen_random_uuid()                                  +
- **application_fee_paid**: boolean, default false                                   +
- **property_id**: uuid                                                              +
- **rejection_reason**: text                                                         +
- **application_date**: timestamp with time zone, default now()                      +
- **updated_at**: timestamp with time zone, default now()                            +
- **previous_address**: text                                                         +
- **review_date**: timestamp with time zone                                          +
- **desired_move_in_date**: date                                                     +
- **reviewed_by**: uuid                                                              +
- **applicant_id**: uuid                                                             +
- **status**: character varying(50), default 'pending'character varying              +
- **created_at**: timestamp with time zone, default now()                            +
- **emergency_contact**: jsonb                                                       +
- **monthly_income**: numeric                                                        +
- **lease_term**: integer(32,0)                                                      +
- **pet_details**: jsonb                                                             +
- **credit_check_status**: character varying(50)                                     +
- **unit_id**: uuid                                                                  +
- **has_vehicles**: boolean, default false                                           +
- **has_pets**: boolean, default false                                               +
- **vehicle_details**: jsonb                                                         +
- **background_check_status**: character varying(50)                                 +
- **employment_info**: jsonb                                                         +

### roles                                                                            +
- **is_system_role**: boolean, default false                                         +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **permissions**: jsonb                                                             +
- **description**: text                                                              +
- **name**: character varying(50), required                                          +
- **updated_at**: timestamp with time zone, default now()                            +

### tasks                                                                            +
- **title**: character varying(255), required                                        +
- **assigned_to**: uuid                                                              +
- **due_date**: timestamp without time zone                                          +
- **organization_id**: uuid                                                          +
- **related_to_type**: character varying(50)                                         +
- **created_at**: timestamp without time zone, default now()                         +
- **owner_id**: uuid                                                                 +
- **description**: text                                                              +
- **status**: character varying(50), required, default 'pending'character varying    +
- **updated_at**: timestamp without time zone, default now()                         +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **priority**: character varying(50), required                                      +
- **related_to_id**: uuid                                                            +

### tenants                                                                          +
- **rent_amount**: numeric                                                           +
- **move_in_date**: date                                                             +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **current_property_id**: uuid                                                      +
- **lease_end_date**: date                                                           +
- **current_unit_id**: uuid                                                          +
- **created_at**: timestamp without time zone, default now()                         +
- **organization_id**: uuid                                                          +
- **updated_at**: timestamp without time zone, default now()                         +
- **status**: character varying(50), default 'active'character varying               +
- **user_id**: uuid                                                                  +

### units                                                                            +
- **updated_at**: timestamp without time zone, default now()                         +
- **utility_meters**: jsonb                                                          +
- **rent_amount**: numeric(10,2)                                                     +
- **lease_end_date**: date                                                           +
- **property_id**: uuid                                                              +
- **next_inspection_date**: date                                                     +
- **smart_lock_enabled**: boolean, default false                                     +
- **bathrooms**: numeric(2,1)                                                        +
- **square_feet**: integer(32,0)                                                     +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **created_at**: timestamp without time zone, default now()                         +
- **floor_plan**: character varying(100)                                             +
- **current_tenant_id**: uuid                                                        +
- **lease_start_date**: date                                                         +
- **status**: character varying(50), default 'Available'character varying            +
- **smart_lock_details**: jsonb                                                      +
- **last_inspection_date**: date                                                     +
- **maintenance_history**: jsonb                                                     +
- **unit_number**: character varying(50), required                                   +
- **bedrooms**: integer(32,0)                                                        +

### user_profiles                                                                    +
- **email**: character varying(255), required                                        +
- **phone**: character varying(50)                                                   +
- **first_name**: character varying(100)                                             +
- **last_name**: character varying(100)                                              +
- **two_factor_enabled**: boolean, default false                                     +
- **profile_image_url**: text                                                        +
- **status**: character varying(20), default 'active'character varying               +
- **id**: uuid, required                                                             +
- **default_organization_id**: uuid                                                  +
- **phone_verified**: boolean, default false                                         +
- **updated_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +
- **notification_preferences**: jsonb                                                +
- **auth_id**: character varying(255)                                                +
- **email_verified**: boolean, default false                                         +
- **last_login_at**: timestamp with time zone                                        +
- **organization_id**: uuid                                                          +
- **created_at**: timestamp with time zone, default CURRENT_TIMESTAMP                +

### user_roles                                                                       +
- **organization_id**: uuid                                                          +
- **updated_at**: timestamp with time zone, default now()                            +
- **created_at**: timestamp with time zone, default now()                            +
- **user_id**: uuid                                                                  +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **role_id**: uuid                                                                  +

### vendors                                                                          +
- **service_type**: character varying(100), required                                 +
- **organization_id**: uuid                                                          +
- **user_id**: uuid                                                                  +
- **id**: uuid, required, default uuid_generate_v4()                                 +
- **contact_phone**: character varying(50)                                           +
- **is_approved**: boolean, default false                                            +
- **updated_at**: timestamp without time zone, default now()                         +
- **created_at**: timestamp without time zone, default now()                         +
- **hourly_rate**: numeric                                                           +
- **notes**: text                                                                    +
- **contact_email**: character varying(255)                                          +



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
- **vendors.user_id** references **user_profiles.id**


### Unique Constraints
- **financial_summaries**: period_end, organization_id, property_id, period_start
- **organization_invitations**: organization_id, email, status
- **organization_invitations**: token
- **property_metrics**: metric_date, property_id
- **property_stakeholders**: stakeholder_type, property_id, user_id
- **roles**: name
- **units**: property_id, unit_number
- **user_profiles**: auth_id
- **user_profiles**: email
- **user_roles**: organization_id, user_id, role_id
- **user_roles**: role_id, user_id, organization_id


## Row Level Security Policies
### organizations                                                  +
- **Organizations are viewable by organization members**: For r    +

### user_profiles                                                  +
- **Enable insert for authenticated users**: For a to authenticated+
- **Users can view profiles in their organization**: For r         +


