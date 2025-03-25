-- Updated Supabase Database Schema
-- Last updated: Mon Mar 24 11:27:39 PM +03 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE activity_logs (  "property_id" uuid,\n  "user_id" uuid,\n  "created_at" timestamp with time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "metadata" jsonb,\n  "unit_id" uuid,\n  "description" text NOT NULL,\n  "activity_type" character varying(100) NOT NULL,\n  "organization_id" uuid NOT NULL\n);
CREATE TABLE announcement_schedules (  "created_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "end_date" timestamp with time zone,\n  "announcement_id" uuid NOT NULL,\n  "time_of_day" time without time zone NOT NULL,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "repeat_on" jsonb,\n  "start_date" timestamp with time zone NOT NULL,\n  "next_run" timestamp with time zone NOT NULL,\n  "repeat_frequency" text,\n  "updated_at" timestamp with time zone NOT NULL DEFAULT now()\n);
CREATE TABLE announcement_targets (  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "announcement_id" uuid NOT NULL,\n  "target_type" text NOT NULL,\n  "target_name" text,\n  "created_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "target_id" uuid\n);
CREATE TABLE announcement_types (  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "created_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "name" text NOT NULL,\n  "description" text,\n  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "organization_id" uuid NOT NULL\n);
CREATE TABLE announcements (  "status" text NOT NULL DEFAULT 'draft'::text,\n  "communication_method" ARRAY NOT NULL,\n  "property_id" uuid,\n  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "is_scheduled" boolean NOT NULL DEFAULT false,\n  "announcement_type_id" uuid,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "organization_id" uuid NOT NULL,\n  "created_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "issue_date" timestamp with time zone,\n  "author_id" uuid NOT NULL,\n  "title" text NOT NULL,\n  "content" text NOT NULL\n);
CREATE TABLE bank_account_types (  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "is_predefined" boolean DEFAULT false,\n  "description" text,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "organization_id" uuid NOT NULL,\n  "name" character varying(100) NOT NULL,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP\n);
CREATE TABLE bank_accounts (  "account_type_id" uuid NOT NULL,\n  "metadata" jsonb,\n  "institution_id" character varying(255),\n  "routing_number" character varying(50),\n  "created_by" uuid NOT NULL,\n  "balance_current" numeric(12,2) DEFAULT 0,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "organization_id" uuid NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "bank_name" character varying(255) NOT NULL,\n  "account_name" character varying(255) NOT NULL,\n  "last_synced" timestamp with time zone,\n  "status" character varying(50) DEFAULT 'active'::character varying,\n  "balance_available" numeric(12,2) DEFAULT 0,\n  "currency" character varying(10) DEFAULT 'USD'::character varying,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "account_number" character varying(255) NOT NULL,\n  "is_default" boolean DEFAULT false,\n  "external_id" character varying(255)\n);
CREATE TABLE communication_logs (  "created_at" timestamp with time zone NOT NULL DEFAULT now(),\n  "subject" text,\n  "organization_id" uuid NOT NULL,\n  "sender_id" uuid,\n  "error_message" text,\n  "recipient_id" uuid NOT NULL,\n  "message_type" text NOT NULL,\n  "sent_at" timestamp with time zone,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "read_at" timestamp with time zone,\n  "content" text NOT NULL,\n  "method" text NOT NULL,\n  "announcement_id" uuid,\n  "delivered_at" timestamp with time zone,\n  "recipient_type" text NOT NULL,\n  "status" text NOT NULL DEFAULT 'queued'::text,\n  "updated_at" timestamp with time zone NOT NULL DEFAULT now()\n);
CREATE TABLE demo_requests (  "additional_comments" text,\n  "email" character varying(255) NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "phone" character varying(50),\n  "country" character varying(100),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "industry" character varying(100),\n  "job_title" character varying(100),\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "company_name" character varying(255) NOT NULL,\n  "company_size" character varying(50),\n  "demo_preferences" text,\n  "full_name" character varying(255) NOT NULL\n);
CREATE TABLE departments (  "organization_id" uuid NOT NULL,\n  "created_at" timestamp with time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "role_id" uuid,\n  "name" character varying(100) NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT now()\n);
CREATE TABLE documents (  "related_to_id" uuid NOT NULL,\n  "document_url" text NOT NULL,\n  "related_to_type" character varying(50) NOT NULL,\n  "document_type" character varying(100) NOT NULL,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "created_at" timestamp without time zone DEFAULT now(),\n  "uploaded_by" uuid,\n  "document_name" character varying(255) NOT NULL,\n  "organization_id" uuid\n);
CREATE TABLE expenses (  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "created_by" uuid NOT NULL,\n  "receipt_url" text,\n  "category_id" uuid NOT NULL,\n  "payee" character varying(255) NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "amount" numeric(12,2) NOT NULL,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "property_id" uuid,\n  "expense_date" date NOT NULL,\n  "unit_id" uuid,\n  "organization_id" uuid NOT NULL,\n  "payment_method_id" uuid,\n  "status" character varying(50) DEFAULT 'recorded'::character varying,\n  "description" text\n);
CREATE TABLE financial_summaries (  "total_expenses" numeric(12,2) DEFAULT 0,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "total_income" numeric(12,2) DEFAULT 0,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "organization_id" uuid NOT NULL,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "property_id" uuid,\n  "outstanding_invoices" numeric(12,2) DEFAULT 0,\n  "upcoming_payables" numeric(12,2) DEFAULT 0,\n  "net_revenue" numeric(12,2),\n  "period_end" date NOT NULL,\n  "period_start" date NOT NULL\n);
CREATE TABLE invoice_items (  "amount" numeric(12,2) NOT NULL,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "tax_amount" numeric(12,2) DEFAULT 0,\n  "description" text NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "tax_rate" numeric(5,2) DEFAULT 0,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "invoice_id" uuid NOT NULL,\n  "unit_price" numeric(12,2) NOT NULL,\n  "quantity" numeric(10,2) NOT NULL DEFAULT 1\n);
CREATE TABLE invoice_payments (  "amount_applied" numeric(12,2) NOT NULL,\n  "invoice_id" uuid NOT NULL,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "payment_id" uuid NOT NULL\n);
CREATE TABLE invoices (  "organization_id" uuid NOT NULL,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "pdf_url" text,\n  "notes" text,\n  "created_by" uuid NOT NULL,\n  "client_id" uuid,\n  "amount_total" numeric(12,2) NOT NULL,\n  "amount_due" numeric(12,2),\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "client_name" character varying(255) NOT NULL,\n  "issue_date" date NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "unit_id" uuid,\n  "client_type" character varying(50) NOT NULL,\n  "property_id" uuid,\n  "due_date" date NOT NULL,\n  "amount_paid" numeric(12,2) DEFAULT 0,\n  "invoice_number" character varying(50) NOT NULL,\n  "status" character varying(50) NOT NULL DEFAULT 'draft'::character varying\n);
CREATE TABLE lease_addendums (  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "document_url" text,\n  "created_at" timestamp without time zone DEFAULT now(),\n  "effective_date" date NOT NULL,\n  "title" character varying(255) NOT NULL,\n  "lease_id" uuid NOT NULL,\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "created_by" uuid,\n  "description" text\n);
CREATE TABLE lease_renewals (  "status" character varying(50) DEFAULT 'pending'::character varying,\n  "original_lease_id" uuid NOT NULL,\n  "renewal_term" integer(32,0),\n  "rent_change" numeric,\n  "notes" text,\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "created_at" timestamp without time zone DEFAULT now(),\n  "new_lease_id" uuid,\n  "renewal_date" date NOT NULL,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4()\n);
CREATE TABLE leases (  "created_at" timestamp without time zone DEFAULT now(),\n  "late_fee_days" integer(32,0) DEFAULT 5,\n  "lease_terms" text,\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "is_auto_renew" boolean DEFAULT false,\n  "rent_amount" numeric(12,2) NOT NULL,\n  "security_deposit" numeric(10,2),\n  "status" character varying(50) DEFAULT 'Pending'::character varying,\n  "start_date" date NOT NULL DEFAULT now(),\n  "next_payment_date" date,\n  "payment_day" integer(32,0),\n  "lease_document_url" text,\n  "last_payment_date" date,\n  "notice_period_days" integer(32,0) DEFAULT 30,\n  "tenant_id" uuid NOT NULL,\n  "current_balance" numeric DEFAULT 0,\n  "late_fee_amount" numeric DEFAULT 0,\n  "document_status" character varying(50) DEFAULT 'draft'::character varying,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "unit_id" uuid NOT NULL,\n  "end_date" date NOT NULL\n);
CREATE TABLE maintenance_comments (  "created_at" timestamp without time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "comment" text NOT NULL,\n  "commented_by" uuid,\n  "ticket_id" uuid NOT NULL,\n  "updated_at" timestamp without time zone DEFAULT now()\n);
CREATE TABLE maintenance_requests (  "maintenance_type_id" uuid,\n  "title" character varying(255) NOT NULL,\n  "assigned_to" uuid,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "completed_at" timestamp with time zone,\n  "tenant_id" uuid,\n  "unit_id" uuid,\n  "related_to_type" character varying(50),\n  "property_id" uuid,\n  "due_date" timestamp without time zone,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "related_to_id" uuid,\n  "priority" character varying(50) NOT NULL,\n  "scheduled_date" timestamp without time zone,\n  "maintenance_type" character varying(100),\n  "description" text NOT NULL,\n  "status" character varying(50) DEFAULT 'pending'::character varying,\n  "owner_id" uuid\n);
CREATE TABLE maintenance_ticket_history (  "previous_status" character varying(50),\n  "ticket_id" uuid NOT NULL,\n  "change_description" text NOT NULL,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "changed_by" uuid,\n  "created_at" timestamp without time zone DEFAULT now(),\n  "new_status" character varying(50)\n);
CREATE TABLE maintenance_types (  "organization_id" uuid NOT NULL,\n  "name" character varying(100) NOT NULL,\n  "is_emergency" boolean DEFAULT false,\n  "created_at" timestamp without time zone DEFAULT now(),\n  "description" text,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "estimated_resolution_time" integer(32,0),\n  "updated_at" timestamp without time zone DEFAULT now()\n);
CREATE TABLE notifications (  "type" character varying(50) NOT NULL,\n  "user_id" uuid,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "title" character varying(255) NOT NULL,\n  "read" boolean DEFAULT false,\n  "message" text NOT NULL\n);
CREATE TABLE organization_invitations (  "organization_id" uuid NOT NULL,\n  "status" character varying(20) DEFAULT 'pending'::character varying,\n  "invited_by" uuid NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT now(),\n  "created_at" timestamp with time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "email" character varying(255) NOT NULL,\n  "expires_at" timestamp with time zone NOT NULL,\n  "token" character varying(255),\n  "role_id" uuid NOT NULL\n);
CREATE TABLE organizations (  "email" character varying(255),\n  "phone" character varying(50),\n  "tax_id" character varying(50),\n  "subscription_status" character varying(50) DEFAULT 'inactive'::character varying,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "name" character varying(255) NOT NULL,\n  "timezone" character varying(50) DEFAULT 'UTC'::character varying,\n  "date_format" character varying(20) DEFAULT 'YYYY-MM-DD'::character varying,\n  "logo_url" text,\n  "active" boolean DEFAULT true,\n  "subscription_plan" character varying(50),\n  "currency" character varying(10) DEFAULT 'USD'::character varying,\n  "billing_cycle" character varying(20),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "billing_address" text,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "website" character varying(255)\n);
CREATE TABLE owner_properties (  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "property_id" uuid NOT NULL,\n  "owner_id" uuid NOT NULL\n);
CREATE TABLE owners (  "payment_method" character varying(50),\n  "taxpayer_id" character varying(50),\n  "address" text,\n  "organization_id" uuid NOT NULL,\n  "email" character varying(255),\n  "created_at" timestamp without time zone DEFAULT now(),\n  "phone" character varying(50),\n  "last_name" character varying(100),\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "bank_account_id" uuid,\n  "tax_id" character varying(50),\n  "notes" text,\n  "status" character varying(50) DEFAULT 'active'::character varying,\n  "user_id" uuid,\n  "first_name" character varying(100),\n  "owner_type" character varying(50),\n  "payment_schedule" character varying(50) DEFAULT 'monthly'::character varying,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "company_name" character varying(255)\n);
CREATE TABLE payment_categories (  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "name" character varying(100) NOT NULL,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "description" text,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "organization_id" uuid NOT NULL,\n  "is_predefined" boolean DEFAULT false\n);
CREATE TABLE payment_methods (  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "organization_id" uuid NOT NULL,\n  "name" character varying(100) NOT NULL,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "description" text\n);
CREATE TABLE payment_schedules (  "created_by" uuid NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "day_of_month" integer(32,0),\n  "organization_id" uuid NOT NULL,\n  "last_run_date" date,\n  "active" boolean DEFAULT true,\n  "amount" numeric(10,2) NOT NULL,\n  "description" text,\n  "end_date" date,\n  "frequency" character varying(50) NOT NULL,\n  "bank_account_id" uuid NOT NULL,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "category_id" uuid,\n  "lease_id" uuid,\n  "start_date" date NOT NULL,\n  "next_schedule_date" date NOT NULL\n);
CREATE TABLE payment_transactions (  "payment_id" uuid NOT NULL,\n  "amount" numeric(10,2) NOT NULL,\n  "transaction_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "gateway_response" jsonb,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "organization_id" uuid NOT NULL,\n  "status" character varying(50) DEFAULT 'pending'::character varying,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "external_id" character varying(255)\n);
CREATE TABLE payments (  "invoice_id" uuid,\n  "transaction_id" character varying(255),\n  "category_id" uuid,\n  "payment_date" date NOT NULL,\n  "payment_method_id" uuid,\n  "recipient_id" uuid,\n  "organization_id" uuid NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "lease_id" uuid,\n  "bank_account_id" uuid,\n  "amount" numeric(12,2) NOT NULL,\n  "created_by" uuid,\n  "recipient_type" character varying(50),\n  "payment_type" character varying(50) DEFAULT 'one-time'::character varying,\n  "status" character varying(50) DEFAULT 'pending'::character varying,\n  "next_scheduled_date" date,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4()\n);
CREATE TABLE properties (  "total_units" integer(32,0) NOT NULL,\n  "owner_id" uuid,\n  "last_activity_date" timestamp with time zone,\n  "city" character varying(100) NOT NULL,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "occupancy_rate" numeric DEFAULT 0,\n  "status" character varying(50) DEFAULT 'active'::character varying,\n  "active_leases" integer(32,0) DEFAULT 0,\n  "created_at" timestamp without time zone DEFAULT now(),\n  "organization_id" uuid NOT NULL,\n  "monthly_revenue" numeric DEFAULT 0,\n  "property_type" character varying(50) NOT NULL DEFAULT 'residential'::character varying,\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "state" character varying(100) NOT NULL,\n  "name" character varying(255) NOT NULL,\n  "zip_code" character varying(20) NOT NULL,\n  "address" text NOT NULL\n);
CREATE TABLE property_images (  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "image_url" text NOT NULL,\n  "property_id" uuid NOT NULL,\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4()\n);
CREATE TABLE property_inspections (  "inspection_date" timestamp with time zone NOT NULL,\n  "inspector_id" uuid,\n  "notes" text,\n  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "report_url" text,\n  "status" text NOT NULL DEFAULT 'scheduled'::text,\n  "property_id" uuid,\n  "unit_id" uuid,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "organization_id" uuid NOT NULL\n);
CREATE TABLE property_managers (  "organization_id" uuid,\n  "created_at" timestamp without time zone DEFAULT now(),\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "assigned_properties" ARRAY DEFAULT '{}'::uuid[],\n  "user_id" uuid\n);
CREATE TABLE property_metrics (  "created_at" timestamp with time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "maintenance_costs" numeric DEFAULT 0,\n  "property_id" uuid NOT NULL,\n  "total_income" numeric(12,2) DEFAULT 0,\n  "collected_rent" numeric DEFAULT 0,\n  "total_expenses" numeric(12,2) DEFAULT 0,\n  "active_leases" integer(32,0) DEFAULT 0,\n  "outstanding_invoices" numeric(12,2) DEFAULT 0,\n  "operational_costs" numeric DEFAULT 0,\n  "outstanding_rent" numeric DEFAULT 0,\n  "net_revenue" numeric(12,2),\n  "occupancy_rate" numeric DEFAULT 0,\n  "monthly_revenue" numeric DEFAULT 0,\n  "metric_date" date NOT NULL\n);
CREATE TABLE property_stakeholders (  "ownership_percentage" numeric DEFAULT 100,\n  "start_date" date NOT NULL,\n  "property_id" uuid NOT NULL,\n  "end_date" date,\n  "user_id" uuid NOT NULL,\n  "created_at" timestamp with time zone DEFAULT now(),\n  "updated_at" timestamp with time zone DEFAULT now(),\n  "stakeholder_type" character varying(50) NOT NULL,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "is_primary" boolean DEFAULT false,\n  "notes" text\n);
CREATE TABLE rental_application_documents (  "rental_application_id" uuid NOT NULL,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "file_path" text NOT NULL,\n  "file_name" text NOT NULL,\n  "uploaded_at" timestamp with time zone DEFAULT now(),\n  "uploaded_by" uuid NOT NULL,\n  "file_type" text NOT NULL\n);
CREATE TABLE rental_applications (  "pet_details" jsonb,\n  "is_employed" boolean NOT NULL DEFAULT false,\n  "credit_check_status" character varying(50),\n  "reviewed_by" uuid,\n  "vehicle_details" jsonb,\n  "rejection_reason" text,\n  "application_date" timestamp with time zone DEFAULT now(),\n  "unit_id" uuid,\n  "notes" text,\n  "updated_at" timestamp with time zone DEFAULT now(),\n  "created_at" timestamp with time zone DEFAULT now(),\n  "applicant_id" bigint(64,0) NOT NULL,\n  "applicant_email" character varying(255),\n  "review_date" timestamp with time zone,\n  "employment_info" jsonb,\n  "monthly_income" numeric,\n  "applicant_name" character varying(255) NOT NULL,\n  "previous_address" text,\n  "preferred_contact_method" ARRAY,\n  "status" character varying(50) DEFAULT 'pending'::character varying,\n  "expiry_date" date,\n  "application_fee_paid" boolean DEFAULT false,\n  "organization_id" uuid NOT NULL,\n  "emergency_contact" jsonb,\n  "background_check_status" character varying(50),\n  "has_pets" boolean DEFAULT false,\n  "has_vehicles" boolean DEFAULT false,\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "applicant_phone_number" character varying(20),\n  "id_type" character varying(50),\n  "property_id" uuid,\n  "lease_term" integer(32,0),\n  "desired_move_in_date" date\n);
CREATE TABLE roles (  "name" character varying(50) NOT NULL,\n  "description" text,\n  "is_system_role" boolean DEFAULT false,\n  "permissions" jsonb,\n  "updated_at" timestamp with time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4()\n);
CREATE TABLE task_assignees (  "task_id" uuid NOT NULL,\n  "assigned_at" timestamp without time zone DEFAULT now(),\n  "user_id" uuid NOT NULL\n);
CREATE TABLE tasks (  "priority" character varying(50) NOT NULL,\n  "created_at" timestamp without time zone DEFAULT now(),\n  "owner_id" uuid,\n  "organization_id" uuid,\n  "description" text,\n  "status" character varying(50) NOT NULL DEFAULT 'pending'::character varying,\n  "related_to_id" uuid,\n  "type" character varying(50),\n  "due_date" timestamp without time zone,\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "title" character varying(255) NOT NULL\n);
CREATE TABLE tasks_leases (  "task_id" uuid NOT NULL,\n  "lease_id" uuid NOT NULL\n);
CREATE TABLE tasks_properties (  "property_id" uuid NOT NULL,\n  "task_id" uuid NOT NULL\n);
CREATE TABLE tasks_related_tasks (  "task_id" uuid NOT NULL,\n  "related_task_id" uuid NOT NULL\n);
CREATE TABLE team_members (  "role_id" uuid,\n  "department_id" uuid,\n  "created_at" timestamp with time zone DEFAULT now(),\n  "user_id" uuid NOT NULL,\n  "updated_at" timestamp with time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT gen_random_uuid(),\n  "job_title" character varying(100)\n);
CREATE TABLE tenants (  "emergency_contact" jsonb,\n  "background_check_date" date,\n  "user_id" uuid,\n  "status" character varying(50) DEFAULT 'active'::character varying,\n  "eviction_history" boolean DEFAULT false,\n  "email" character varying(255),\n  "backgroundcheckdate" date,\n  "current_property_id" uuid,\n  "background_check_status" character varying(50) DEFAULT 'pending'::character varying,\n  "last_name" character varying(100),\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "created_at" timestamp without time zone DEFAULT now(),\n  "emergency_contact_relationship" character varying(100),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "organization_id" uuid NOT NULL,\n  "preferred_contact_methods" ARRAY,\n  "phone" character varying(50),\n  "vehicles" jsonb,\n  "payment_history" jsonb,\n  "language_preference" character varying(50) DEFAULT 'English'::character varying,\n  "background_check_passed" boolean,\n  "pets" jsonb,\n  "special_accommodations" text,\n  "emergency_contact_phone" character varying(50),\n  "first_name" character varying(100)\n);
CREATE TABLE units (  "maintenance_history" jsonb,\n  "smart_lock_enabled" boolean DEFAULT false,\n  "area" integer(32,0),\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "rent_amount" numeric(10,2),\n  "floor_plan" character varying(100),\n  "maintenance" boolean NOT NULL DEFAULT false,\n  "next_inspection_date" date,\n  "last_inspection_date" date,\n  "unit_number" character varying(50),\n  "utility_meters" jsonb,\n  "organization_id" uuid NOT NULL,\n  "bathrooms" numeric(2,1),\n  "created_at" timestamp without time zone DEFAULT now(),\n  "status" character varying(50) DEFAULT 'vacant'::character varying,\n  "property_id" uuid NOT NULL,\n  "smart_lock_details" jsonb,\n  "bedrooms" integer(32,0)\n);
CREATE TABLE user_profiles (  "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "last_login_at" timestamp with time zone,\n  "default_organization_id" uuid,\n  "time_zone" character varying(50) DEFAULT 'UTC'::character varying,\n  "email" character varying(255) NOT NULL,\n  "organization_id" uuid,\n  "two_factor_enabled" boolean DEFAULT false,\n  "profile_image_url" text,\n  "email_verified" boolean DEFAULT false,\n  "phone_verified" boolean DEFAULT false,\n  "last_name" character varying(100) NOT NULL,\n  "preferred_contact_time" character varying(50),\n  "notification_preferences" jsonb,\n  "id" uuid NOT NULL,\n  "verification_status" character varying(20) DEFAULT 'unverified'::character varying,\n  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,\n  "preferred_contact_methods" ARRAY DEFAULT ARRAY['email'::text],\n  "phone" character varying(50),\n  "first_name" character varying(100) NOT NULL,\n  "status" character varying(20) DEFAULT 'active'::character varying\n);
CREATE TABLE user_roles (  "created_at" timestamp with time zone DEFAULT now(),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),\n  "updated_at" timestamp with time zone DEFAULT now(),\n  "role_id" uuid,\n  "user_id" uuid,\n  "organization_id" uuid\n);
CREATE TABLE vendors (  "preferred_bank_account_id" uuid,\n  "created_at" timestamp without time zone DEFAULT now(),\n  "contact_person_name" text,\n  "updated_at" timestamp without time zone DEFAULT now(),\n  "contact_person_email" text,\n  "phone" character varying(50),\n  "service_type" character varying(100) NOT NULL,\n  "organization_id" uuid NOT NULL,\n  "user_id" uuid,\n  "emergency_service" boolean DEFAULT false,\n  "business_type" character varying(100),\n  "notes" text,\n  "service_availability" jsonb,\n  "vendor_name" text,\n  "service_areas" jsonb,\n  "payment_terms" character varying(100),\n  "hourly_rate" numeric,\n  "email" character varying(255),\n  "contact_person_phone" character varying(50),\n  "performance_rating" numeric(3,2),\n  "id" uuid NOT NULL DEFAULT uuid_generate_v4()\n);

ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);
ALTER TABLE announcement_schedules ADD CONSTRAINT announcement_schedules_pkey PRIMARY KEY (id);
ALTER TABLE announcement_targets ADD CONSTRAINT announcement_targets_pkey PRIMARY KEY (id);
ALTER TABLE announcement_types ADD CONSTRAINT announcement_types_pkey PRIMARY KEY (id);
ALTER TABLE announcements ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);
ALTER TABLE bank_account_types ADD CONSTRAINT bank_account_types_pkey PRIMARY KEY (id);
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);
ALTER TABLE communication_logs ADD CONSTRAINT communication_logs_pkey PRIMARY KEY (id);
ALTER TABLE demo_requests ADD CONSTRAINT demo_requests_pkey PRIMARY KEY (id);
ALTER TABLE departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
ALTER TABLE documents ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE expenses ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
ALTER TABLE financial_summaries ADD CONSTRAINT financial_summaries_pkey PRIMARY KEY (id);
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);
ALTER TABLE invoice_payments ADD CONSTRAINT invoice_payments_pkey PRIMARY KEY (id);
ALTER TABLE invoices ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);
ALTER TABLE lease_addendums ADD CONSTRAINT lease_addendums_pkey PRIMARY KEY (id);
ALTER TABLE lease_renewals ADD CONSTRAINT lease_renewals_pkey PRIMARY KEY (id);
ALTER TABLE leases ADD CONSTRAINT leases_pkey PRIMARY KEY (id);
ALTER TABLE maintenance_comments ADD CONSTRAINT maintenance_comments_pkey PRIMARY KEY (id);
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_pkey PRIMARY KEY (id);
ALTER TABLE maintenance_ticket_history ADD CONSTRAINT maintenance_ticket_history_pkey PRIMARY KEY (id);
ALTER TABLE maintenance_types ADD CONSTRAINT maintenance_types_pkey PRIMARY KEY (id);
ALTER TABLE notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE organization_invitations ADD CONSTRAINT organization_invitations_pkey PRIMARY KEY (id);
ALTER TABLE organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);
ALTER TABLE owner_properties ADD CONSTRAINT owner_properties_pkey PRIMARY KEY (owner_id, property_id);
ALTER TABLE owners ADD CONSTRAINT owners_pkey PRIMARY KEY (id);
ALTER TABLE payment_categories ADD CONSTRAINT payment_categories_pkey PRIMARY KEY (id);
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);
ALTER TABLE payment_schedules ADD CONSTRAINT payment_schedules_pkey PRIMARY KEY (id);
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);
ALTER TABLE payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE properties ADD CONSTRAINT properties_pkey PRIMARY KEY (id);
ALTER TABLE property_images ADD CONSTRAINT property_images_pkey PRIMARY KEY (id);
ALTER TABLE property_inspections ADD CONSTRAINT property_inspections_pkey PRIMARY KEY (id);
ALTER TABLE property_managers ADD CONSTRAINT property_managers_pkey PRIMARY KEY (id);
ALTER TABLE property_metrics ADD CONSTRAINT property_metrics_pkey PRIMARY KEY (id);
ALTER TABLE property_stakeholders ADD CONSTRAINT property_stakeholders_pkey PRIMARY KEY (id);
ALTER TABLE rental_application_documents ADD CONSTRAINT rental_application_documents_pkey PRIMARY KEY (id);
ALTER TABLE rental_applications ADD CONSTRAINT rental_applications_pkey PRIMARY KEY (id);
ALTER TABLE roles ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE task_assignees ADD CONSTRAINT task_assignees_pkey PRIMARY KEY (task_id, user_id);
ALTER TABLE tasks ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
ALTER TABLE tasks_leases ADD CONSTRAINT tasks_leases_pkey PRIMARY KEY (lease_id, task_id);
ALTER TABLE tasks_properties ADD CONSTRAINT tasks_properties_pkey PRIMARY KEY (task_id, property_id);
ALTER TABLE tasks_related_tasks ADD CONSTRAINT tasks_related_tasks_pkey PRIMARY KEY (related_task_id, task_id);
ALTER TABLE team_members ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);
ALTER TABLE tenants ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);
ALTER TABLE units ADD CONSTRAINT units_pkey PRIMARY KEY (id);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
ALTER TABLE vendors ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);

ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id);
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE announcement_schedules ADD CONSTRAINT announcement_schedules_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES announcements(id);
ALTER TABLE announcement_targets ADD CONSTRAINT announcement_targets_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES announcements(id);
ALTER TABLE announcement_types ADD CONSTRAINT announcement_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE announcements ADD CONSTRAINT announcements_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE announcements ADD CONSTRAINT announcements_announcement_type_id_fkey FOREIGN KEY (announcement_type_id) REFERENCES announcement_types(id);
ALTER TABLE announcements ADD CONSTRAINT announcements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE bank_account_types ADD CONSTRAINT bank_account_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accounts_account_type_id_fkey FOREIGN KEY (account_type_id) REFERENCES bank_account_types(id);
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE bank_accounts ADD CONSTRAINT bank_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
ALTER TABLE communication_logs ADD CONSTRAINT communication_logs_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES announcements(id);
ALTER TABLE communication_logs ADD CONSTRAINT communication_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE departments ADD CONSTRAINT departments_role_fkey FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE departments ADD CONSTRAINT departments_organization_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE documents ADD CONSTRAINT documents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES user_profiles(id);
ALTER TABLE expenses ADD CONSTRAINT expenses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE expenses ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES payment_categories(id);
ALTER TABLE expenses ADD CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
ALTER TABLE expenses ADD CONSTRAINT expenses_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);
ALTER TABLE expenses ADD CONSTRAINT expenses_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE financial_summaries ADD CONSTRAINT financial_summaries_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE financial_summaries ADD CONSTRAINT financial_summaries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE invoice_items ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE invoice_payments ADD CONSTRAINT invoice_payments_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id);
ALTER TABLE invoice_payments ADD CONSTRAINT invoice_payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE invoices ADD CONSTRAINT invoices_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id);
ALTER TABLE lease_addendums ADD CONSTRAINT lease_addendums_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
ALTER TABLE lease_addendums ADD CONSTRAINT lease_addendums_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES leases(id);
ALTER TABLE lease_renewals ADD CONSTRAINT lease_renewals_new_lease_id_fkey FOREIGN KEY (new_lease_id) REFERENCES leases(id);
ALTER TABLE lease_renewals ADD CONSTRAINT lease_renewals_original_lease_id_fkey FOREIGN KEY (original_lease_id) REFERENCES leases(id);
ALTER TABLE leases ADD CONSTRAINT leases_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE leases ADD CONSTRAINT leases_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id);
ALTER TABLE maintenance_comments ADD CONSTRAINT maintenance_comments_commented_by_fkey FOREIGN KEY (commented_by) REFERENCES user_profiles(id);
ALTER TABLE maintenance_comments ADD CONSTRAINT maintenance_comments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES maintenance_requests(id);
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES user_profiles(id);
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES user_profiles(id);
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_maintenance_type_id_fkey FOREIGN KEY (maintenance_type_id) REFERENCES maintenance_types(id);
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES user_profiles(id);
ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_requests_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE maintenance_ticket_history ADD CONSTRAINT maintenance_ticket_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES user_profiles(id);
ALTER TABLE maintenance_ticket_history ADD CONSTRAINT maintenance_ticket_history_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES maintenance_requests(id);
ALTER TABLE maintenance_types ADD CONSTRAINT maintenance_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE organization_invitations ADD CONSTRAINT organization_invitations_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE organization_invitations ADD CONSTRAINT organization_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES user_profiles(id);
ALTER TABLE organization_invitations ADD CONSTRAINT organization_invitations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE owner_properties ADD CONSTRAINT owner_properties_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES owners(id);
ALTER TABLE owner_properties ADD CONSTRAINT owner_properties_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE owners ADD CONSTRAINT owners_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE owners ADD CONSTRAINT fk_owners_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE owners ADD CONSTRAINT owners_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);
ALTER TABLE payment_categories ADD CONSTRAINT payment_categories_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE payment_schedules ADD CONSTRAINT payment_schedules_category_id_fkey FOREIGN KEY (category_id) REFERENCES payment_categories(id);
ALTER TABLE payment_schedules ADD CONSTRAINT payment_schedules_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);
ALTER TABLE payment_schedules ADD CONSTRAINT payment_schedules_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE payment_schedules ADD CONSTRAINT payment_schedules_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES leases(id);
ALTER TABLE payment_schedules ADD CONSTRAINT payment_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id);
ALTER TABLE payments ADD CONSTRAINT payments_leaseid_fkey FOREIGN KEY (lease_id) REFERENCES leases(id);
ALTER TABLE payments ADD CONSTRAINT payments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE payments ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);
ALTER TABLE payments ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id);
ALTER TABLE payments ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id);
ALTER TABLE payments ADD CONSTRAINT payments_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);
ALTER TABLE payments ADD CONSTRAINT payments_category_id_fkey FOREIGN KEY (category_id) REFERENCES payment_categories(id);
ALTER TABLE properties ADD CONSTRAINT properties_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES owners(id);
ALTER TABLE properties ADD CONSTRAINT properties_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE property_images ADD CONSTRAINT property_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE property_inspections ADD CONSTRAINT property_inspections_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id);
ALTER TABLE property_inspections ADD CONSTRAINT property_inspections_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE property_inspections ADD CONSTRAINT property_inspections_inspector_id_fkey FOREIGN KEY (inspector_id) REFERENCES user_profiles(id);
ALTER TABLE property_inspections ADD CONSTRAINT property_inspections_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE property_managers ADD CONSTRAINT property_managers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE property_managers ADD CONSTRAINT property_managers_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE property_metrics ADD CONSTRAINT property_metrics_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE property_stakeholders ADD CONSTRAINT property_stakeholders_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE property_stakeholders ADD CONSTRAINT property_stakeholders_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE rental_application_documents ADD CONSTRAINT rental_application_documents_rental_application_id_fkey FOREIGN KEY (rental_application_id) REFERENCES rental_applications(id);
ALTER TABLE rental_application_documents ADD CONSTRAINT rental_application_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES user_profiles(id);
ALTER TABLE rental_applications ADD CONSTRAINT rental_applications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE rental_applications ADD CONSTRAINT rental_applications_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE rental_applications ADD CONSTRAINT rental_applications_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id);
ALTER TABLE rental_applications ADD CONSTRAINT rental_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES user_profiles(id);
ALTER TABLE task_assignees ADD CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE task_assignees ADD CONSTRAINT task_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES user_profiles(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE tasks_leases ADD CONSTRAINT tasks_leases_lease_id_fkey FOREIGN KEY (lease_id) REFERENCES leases(id);
ALTER TABLE tasks_leases ADD CONSTRAINT tasks_leases_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE tasks_properties ADD CONSTRAINT tasks_properties_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE tasks_properties ADD CONSTRAINT tasks_properties_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE tasks_related_tasks ADD CONSTRAINT tasks_related_tasks_related_task_id_fkey FOREIGN KEY (related_task_id) REFERENCES tasks(id);
ALTER TABLE tasks_related_tasks ADD CONSTRAINT tasks_related_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
ALTER TABLE team_members ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE team_members ADD CONSTRAINT team_members_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE team_members ADD CONSTRAINT team_members_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE tenants ADD CONSTRAINT fk_tenants_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE tenants ADD CONSTRAINT tenants_current_property_id_fkey FOREIGN KEY (current_property_id) REFERENCES properties(id);
ALTER TABLE tenants ADD CONSTRAINT tenants_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE units ADD CONSTRAINT units_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE units ADD CONSTRAINT units_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_default_organization_id_fkey FOREIGN KEY (default_organization_id) REFERENCES organizations(id);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE vendors ADD CONSTRAINT vendors_preferred_bank_account_id_fkey FOREIGN KEY (preferred_bank_account_id) REFERENCES bank_accounts(id);
ALTER TABLE vendors ADD CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id);
ALTER TABLE vendors ADD CONSTRAINT fk_vendors_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);

ALTER TABLE financial_summaries ADD CONSTRAINT financial_summaries_organization_id_property_id_period_star_key UNIQUE (period_end, organization_id, property_id, period_start);
ALTER TABLE organization_invitations ADD CONSTRAINT organization_invitations_organization_id_email_status_key UNIQUE (organization_id, email, status);
ALTER TABLE organization_invitations ADD CONSTRAINT organization_invitations_token_key UNIQUE (token);
ALTER TABLE property_metrics ADD CONSTRAINT property_metrics_property_id_metric_date_key UNIQUE (property_id, metric_date);
ALTER TABLE property_stakeholders ADD CONSTRAINT property_stakeholders_property_id_user_id_stakeholder_type_key UNIQUE (stakeholder_type, property_id, user_id);
ALTER TABLE roles ADD CONSTRAINT roles_name_key UNIQUE (name);
ALTER TABLE units ADD CONSTRAINT units_property_id_unit_number_key UNIQUE (property_id, unit_number);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
ALTER TABLE user_roles ADD CONSTRAINT unique_user_role_organization UNIQUE (role_id, organization_id, user_id);
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_role_id_organization_id_key UNIQUE (user_id, role_id, organization_id);

CREATE INDEX idx_expenses_category_id ON public.expenses USING btree (category_id);
CREATE INDEX idx_expenses_expense_date ON public.expenses USING btree (expense_date);
CREATE INDEX idx_expenses_property_id ON public.expenses USING btree (property_id);
CREATE INDEX idx_invoice_payments_invoice_id ON public.invoice_payments USING btree (invoice_id);
CREATE INDEX idx_invoice_payments_payment_id ON public.invoice_payments USING btree (payment_id);
CREATE INDEX idx_invoices_client_id ON public.invoices USING btree (client_id);
CREATE INDEX idx_invoices_due_date ON public.invoices USING btree (due_date);
CREATE INDEX idx_invoices_issue_date ON public.invoices USING btree (issue_date);
CREATE INDEX idx_invoices_property_id ON public.invoices USING btree (property_id);
CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);
CREATE INDEX idx_payments_bank_account_id ON public.payments USING btree (bank_account_id);
CREATE INDEX idx_payments_category_id ON public.payments USING btree (category_id);
CREATE INDEX idx_payments_lease_id ON public.payments USING btree (lease_id);
CREATE INDEX idx_payments_payment_date ON public.payments USING btree (payment_date);
CREATE INDEX idx_payments_payment_type ON public.payments USING btree (payment_type);
CREATE INDEX idx_payments_status ON public.payments USING btree (status);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $CREATE OR REPLACE FUNCTION public.handle_new_user()                        +
RETURNS trigger                                                                                                                                   +
LANGUAGE plpgsql                                                                                                                                  +
SECURITY DEFINER                                                                                                                                  +
AS $function$DECLARE                                                                                                                               +
org_id UUID;                                                                                                                                     +
BEGIN                                                                                                                                              +
-- Create user profile                                                                                                                           +
INSERT INTO public.user_profiles (                                                                                                               +
id,                                                                                                                                            +
email,                                                                                                                                         +
first_name,                                                                                                                                    +
last_name,                                                                                                                                     +
created_at,                                                                                                                                    +
updated_at                                                                                                                                     +
)                                                                                                                                                +
VALUES (                                                                                                                                         +
NEW.id,                                                                                                                                        +
NEW.email,                                                                                                                                     +
COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),                                                                                         +
COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),                                                                                          +
NOW(),                                                                                                                                         +
NOW()                                                                                                                                          +
);                                                                                                                                               +
+
-- Only handle organization admin creation in trigger                                                                                            +
IF NEW.raw_user_meta_data ->> 'organization_name' IS NOT NULL AND                                                                                +
(NEW.raw_user_meta_data ->> 'is_organization_admin')::boolean = true THEN                                                                     +
+
-- Create organization                                                                                                                         +
INSERT INTO public.organizations (name)                                                                                                        +
VALUES (NEW.raw_user_meta_data ->> 'organization_name')                                                                                        +
RETURNING id INTO org_id;                                                                                                                      +
+
-- Update user profile with organization                                                                                                       +
UPDATE public.user_profiles                                                                                                                    +
SET organization_id = org_id                                                                                                                   +
WHERE id = NEW.id;                                                                                                                             +
+
-- Add admin role                                                                                                                              +
INSERT INTO public.user_roles (user_id, role_id, organization_id)                                                                              +
SELECT NEW.id, id, org_id                                                                                                                      +
FROM public.roles                                                                                                                              +
WHERE name = 'organization_admin' AND is_system_role = true                                                                                    +
LIMIT 1;                                                                                                                                       +
END IF;                                                                                                                                          +
+
RETURN NEW;                                                                                                                                      +
END;$function$                                                                                                                                     +
$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.set_default_department_role() RETURNS trigger AS $CREATE OR REPLACE FUNCTION public.set_default_department_role()+
RETURNS trigger                                                                                                                                   +
LANGUAGE plpgsql                                                                                                                                  +
AS $function$                                                                                                                                      +
BEGIN                                                                                                                                              +
IF NEW.role_id IS NULL THEN                                                                                                                      +
-- Set role_id to the id of the role named 'team_member'                                                                                       +
SELECT id INTO NEW.role_id                                                                                                                     +
FROM public.roles                                                                                                                              +
WHERE name = 'team_member'                                                                                                                     +
LIMIT 1;                                                                                                                                       +
END IF;                                                                                                                                          +
RETURN NEW;                                                                                                                                      +
END;                                                                                                                                               +
$function$                                                                                                                                         +
$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.update_modified_column() RETURNS trigger AS $CREATE OR REPLACE FUNCTION public.update_modified_column()          +
RETURNS trigger                                                                                                                                   +
LANGUAGE plpgsql                                                                                                                                  +
AS $function$                                                                                                                                      +
BEGIN                                                                                                                                              +
NEW.updated_at = NOW();                                                                                                                        +
RETURN NEW;                                                                                                                                    +
END;                                                                                                                                               +
$function$                                                                                                                                         +
$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger AS $CREATE OR REPLACE FUNCTION public.update_updated_at_column()      +
RETURNS trigger                                                                                                                                   +
LANGUAGE plpgsql                                                                                                                                  +
AS $function$                                                                                                                                      +
BEGIN                                                                                                                                              +
NEW.updated_at = CURRENT_TIMESTAMP;                                                                                                            +
RETURN NEW;                                                                                                                                    +
END;                                                                                                                                               +
$function$                                                                                                                                         +
$ LANGUAGE plpgsql;

CREATE TRIGGER update_announcement_schedules_modtime BEFORE UPDATE ON announcement_schedules FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_announcement_targets_modtime BEFORE UPDATE ON announcement_targets FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_announcement_types_modtime BEFORE UPDATE ON announcement_types FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_announcements_modtime BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bank_account_types_modified BEFORE UPDATE ON bank_account_types FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_bank_accounts_modified BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_communication_logs_modtime BEFORE UPDATE ON communication_logs FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_demo_requests_updated_at BEFORE UPDATE ON demo_requests FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_set_default_department_role BEFORE INSERT ON departments FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION set_default_department_role();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_summaries_updated_at BEFORE UPDATE ON financial_summaries FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_payments_updated_at BEFORE UPDATE ON invoice_payments FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_schedules_modified BEFORE UPDATE ON payment_schedules FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_payment_transactions_modified BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_team_members_modtime BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations are viewable by organization members" ON organizations FOR r USING ((auth.uid() IN ( SELECT user_profiles.id                                                  +
FROM user_profiles                                                                                                                                                                      +
WHERE (user_profiles.organization_id = organizations.id))));
CREATE POLICY "Allow users with create property permission in organization" ON properties FOR a TO authenticated WITH CHECK ((EXISTS ( SELECT 1                                            +
FROM (user_roles                                                                                                                                                                        +
JOIN roles ON ((user_roles.role_id = roles.id)))                                                                                                                                      +
WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.organization_id = properties.organization_id) AND (((roles.permissions ->> 'can_create_properties'::text))::boolean = true)))));
CREATE POLICY "Allow all operations for authenticated users" ON property_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users only" ON rental_application_documents FOR d USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON rental_application_documents FOR a WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON rental_application_documents FOR r USING (true);
CREATE POLICY "Enable update for authenticated users only" ON rental_application_documents FOR w USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users only" ON rental_applications FOR d USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON rental_applications FOR a WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON rental_applications FOR r USING (true);
CREATE POLICY "Enable update for authenticated users only" ON rental_applications FOR w USING (true) WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users" ON user_profiles FOR a TO authenticated WITH CHECK (true);
CREATE POLICY "Users can view profiles in their organization" ON user_profiles FOR r USING ((organization_id IN ( SELECT user_profiles_1.organization_id                                   +
FROM user_profiles user_profiles_1                                                                                                                                                      +
WHERE (user_profiles_1.id = auth.uid()))));

