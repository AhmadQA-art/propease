/**
* PropEase Database Schema TypeScript Definitions
* Auto-generated on: Wed Mar 12 11:25:08 PM +03 2025
*/

// Type definitions for common PostgreSQL data types
type UUID = string;
type Timestamp = string;
type Date = string;
type JSONB = Record<string, any>;

export interface ActivityLogs {
id: UUID;
organization_id: UUID;
property_id?: UUID;
unit_id?: UUID;
user_id?: UUID;
activity_type: string;
description: string;
metadata?: JSONB;
created_at?: Timestamp;

}

export interface AnnouncementSchedules {
id: UUID;
announcement_id: UUID;
start_date: Timestamp;
end_date?: Timestamp;
repeat_frequency?: string;
repeat_on?: JSONB;
time_of_day: any;
next_run: Timestamp;
created_at: Timestamp;
updated_at: Timestamp;

}

export interface AnnouncementTargets {
id: UUID;
announcement_id: UUID;
target_type: string;
target_id?: UUID;
target_name?: string;
created_at: Timestamp;
updated_at: Timestamp;

}

export interface AnnouncementTypes {
id: UUID;
name: string;
description?: string;
created_at: Timestamp;
updated_at: Timestamp;
organization_id: UUID;

}

export interface Announcements {
id: UUID;
title: string;
content: string;
property_id?: UUID;
communication_method: Array<UUID>;
is_scheduled: boolean;
status: string;
issue_date?: Timestamp;
author_id: UUID;
announcement_type_id?: UUID;
organization_id: UUID;
created_at: Timestamp;
updated_at: Timestamp;

}

export interface BankAccountTypes {
id: UUID;
name: string;
description?: string;
organization_id: UUID;
is_predefined?: boolean;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface BankAccounts {
id: UUID;
organization_id: UUID;
account_name: string;
account_number: string;
routing_number?: string;
bank_name: string;
account_type_id: UUID;
last_synced?: Timestamp;
status?: string;
balance_available?: number;
balance_current?: number;
currency?: string;
created_by: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;
is_default?: boolean;
institution_id?: string;
external_id?: string;
metadata?: JSONB;

}

export interface CommunicationLogs {
id: UUID;
announcement_id?: UUID;
message_type: string;
sender_id?: UUID;
recipient_type: string;
recipient_id: UUID;
method: string;
subject?: string;
content: string;
status: string;
error_message?: string;
sent_at?: Timestamp;
delivered_at?: Timestamp;
read_at?: Timestamp;
organization_id: UUID;
created_at: Timestamp;
updated_at: Timestamp;

}

export interface DemoRequests {
id: UUID;
full_name: string;
email: string;
phone?: string;
company_name: string;
job_title?: string;
industry?: string;
company_size?: string;
country?: string;
demo_preferences?: string;
additional_comments?: string;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Documents {
id: UUID;
organization_id?: UUID;
document_type: string;
document_name: string;
document_url: string;
related_to_type: string;
related_to_id: UUID;
uploaded_by?: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Expenses {
id: UUID;
organization_id: UUID;
expense_date: Date;
payee: string;
amount: number;
category_id: UUID;
payment_method_id?: UUID;
description?: string;
receipt_url?: string;
status?: string;
property_id?: UUID;
unit_id?: UUID;
created_by: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface FinancialSummaries {
id: UUID;
organization_id: UUID;
property_id?: UUID;
period_start: Date;
period_end: Date;
total_income?: number;
total_expenses?: number;
net_revenue?: number;
outstanding_invoices?: number;
upcoming_payables?: number;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface InvoiceItems {
id: UUID;
invoice_id: UUID;
description: string;
quantity: number;
unit_price: number;
amount: number;
tax_rate?: number;
tax_amount?: number;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface InvoicePayments {
id: UUID;
invoice_id: UUID;
payment_id: UUID;
amount_applied: number;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Invoices {
id: UUID;
invoice_number: string;
organization_id: UUID;
client_name: string;
client_id?: UUID;
client_type: string;
issue_date: Date;
due_date: Date;
amount_total: number;
amount_paid?: number;
amount_due?: number;
status: string;
pdf_url?: string;
notes?: string;
property_id?: UUID;
unit_id?: UUID;
created_by: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface LeaseAddendums {
id: UUID;
lease_id: UUID;
title: string;
description?: string;
effective_date: Date;
document_url?: string;
created_by?: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface LeaseRenewals {
id: UUID;
original_lease_id: UUID;
new_lease_id?: UUID;
renewal_date: Date;
rent_change?: number;
renewal_term?: number;
status?: string;
notes?: string;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Leases {
id: UUID;
unit_id?: UUID;
tenant_id?: UUID;
start_date: Date;
end_date: Date;
rent_amount: number;
security_deposit?: number;
status?: string;
lease_document_url?: string;
created_at?: Timestamp;
updated_at?: Timestamp;
lease_terms?: string;
document_status?: string;
last_payment_date?: Date;
next_payment_date?: Date;
current_balance?: number;
payment_day?: number;
is_auto_renew?: boolean;
notice_period_days?: number;
late_fee_amount?: number;
late_fee_days?: number;

}

export interface MaintenanceComments {
id: UUID;
ticket_id: UUID;
commented_by?: UUID;
comment: string;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface MaintenanceRequests {
id: UUID;
unit_id?: UUID;
tenant_id?: UUID;
title: string;
description: string;
priority: string;
status?: string;
assigned_to?: UUID;
completed_at?: Timestamp;
created_at?: Timestamp;
updated_at?: Timestamp;
due_date?: Timestamp;
owner_id?: UUID;
related_to_type?: string;
related_to_id?: UUID;
scheduled_date?: Timestamp;
property_id?: UUID;
maintenance_type?: string;
maintenance_type_id?: UUID;

}

export interface MaintenanceTicketHistory {
id: UUID;
ticket_id: UUID;
changed_by?: UUID;
change_description: string;
previous_status?: string;
new_status?: string;
created_at?: Timestamp;

}

export interface MaintenanceTypes {
id: UUID;
organization_id: UUID;
name: string;
description?: string;
estimated_resolution_time?: number;
is_emergency?: boolean;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Notifications {
id: UUID;
user_id?: UUID;
title: string;
message: string;
type: string;
read?: boolean;
created_at?: Timestamp;

}

export interface OrganizationInvitations {
id: UUID;
organization_id: UUID;
email: string;
role_id: UUID;
invited_by: UUID;
token: string;
status?: string;
expires_at: Timestamp;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Organizations {
id: UUID;
name: string;
subscription_status?: string;
created_at?: Timestamp;
updated_at?: Timestamp;
subscription_plan?: string;
billing_cycle?: string;
billing_address?: string;
tax_id?: string;
phone?: string;
email?: string;
website?: string;
logo_url?: string;
timezone?: string;
date_format?: string;
currency?: string;
active?: boolean;

}

export interface Owners {
id: UUID;
user_id?: UUID;
organization_id?: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface PaymentCategories {
id: UUID;
name: string;
description?: string;
organization_id: UUID;
is_predefined?: boolean;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface PaymentMethods {
id: UUID;
name: string;
description?: string;
organization_id: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface PaymentSchedules {
id: UUID;
organization_id: UUID;
lease_id?: UUID;
bank_account_id: UUID;
amount: number;
frequency: string;
start_date: Date;
end_date?: Date;
next_schedule_date: Date;
last_run_date?: Date;
day_of_month?: number;
active?: boolean;
description?: string;
category_id?: UUID;
created_by: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface PaymentTransactions {
id: UUID;
organization_id: UUID;
payment_id: UUID;
transaction_date?: Timestamp;
amount: number;
status?: string;
external_id?: string;
gateway_response?: JSONB;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Payments {
id: UUID;
lease_id?: UUID;
amount: number;
payment_date: Date;
status?: string;
transaction_id?: string;
created_at?: Timestamp;
updated_at?: Timestamp;
payment_type?: string;
category_id?: UUID;
bank_account_id?: UUID;
organization_id: UUID;
payment_method_id?: UUID;
next_scheduled_date?: Date;
created_by?: UUID;
recipient_type?: string;
recipient_id?: UUID;
invoice_id?: UUID;

}

export interface Properties {
id: UUID;
name: string;
address: string;
city: string;
state: string;
zip_code: string;
total_units: number;
owner_id?: UUID;
organization_id?: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;
monthly_revenue?: number;
occupancy_rate?: number;
active_leases?: number;
property_manager_id?: UUID;
last_activity_date?: Timestamp;
property_status?: string;

}

export interface PropertyInspections {
id: UUID;
property_id?: UUID;
unit_id?: UUID;
inspection_date: Timestamp;
inspector_id?: UUID;
status: string;
notes?: string;
report_url?: string;
created_at?: Timestamp;
updated_at?: Timestamp;
organization_id: UUID;

}

export interface PropertyManagers {
id: UUID;
user_id?: UUID;
organization_id?: UUID;
assigned_properties?: Array<UUID>;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface PropertyMetrics {
id: UUID;
property_id: UUID;
metric_date: Date;
monthly_revenue?: number;
occupancy_rate?: number;
active_leases?: number;
maintenance_costs?: number;
operational_costs?: number;
collected_rent?: number;
outstanding_rent?: number;
created_at?: Timestamp;
total_income?: number;
total_expenses?: number;
net_revenue?: number;
outstanding_invoices?: number;

}

export interface PropertyStakeholders {
id: UUID;
property_id: UUID;
user_id: UUID;
stakeholder_type: string;
ownership_percentage?: number;
is_primary?: boolean;
start_date: Date;
end_date?: Date;
notes?: string;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface RentalApplications {
id: UUID;
property_id?: UUID;
unit_id?: UUID;
applicant_id?: UUID;
application_date?: Timestamp;
desired_move_in_date?: Date;
lease_term?: number;
status?: string;
monthly_income?: number;
has_pets?: boolean;
pet_details?: JSONB;
has_vehicles?: boolean;
vehicle_details?: JSONB;
employment_info?: JSONB;
previous_address?: string;
emergency_contact?: JSONB;
application_fee_paid?: boolean;
background_check_status?: string;
credit_check_status?: string;
rejection_reason?: string;
notes?: string;
reviewed_by?: UUID;
review_date?: Timestamp;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Roles {
id: UUID;
name: string;
description?: string;
is_system_role?: boolean;
permissions?: JSONB;
updated_at?: Timestamp;

}

export interface Tasks {
id: UUID;
organization_id?: UUID;
title: string;
description?: string;
priority: string;
status: string;
due_date?: Timestamp;
owner_id?: UUID;
assigned_to?: UUID;
related_to_type?: string;
related_to_id?: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Tenants {
id: UUID;
user_id?: UUID;
organization_id?: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;
move_in_date?: Date;
lease_end_date?: Date;
current_property_id?: UUID;
current_unit_id?: UUID;
rent_amount?: number;
status?: string;

}

export interface Units {
id: UUID;
property_id?: UUID;
unit_number: string;
floor_plan?: string;
square_feet?: number;
bedrooms?: number;
bathrooms?: number;
rent_amount?: number;
status?: string;
created_at?: Timestamp;
updated_at?: Timestamp;
current_tenant_id?: UUID;
lease_start_date?: Date;
lease_end_date?: Date;
last_inspection_date?: Date;
next_inspection_date?: Date;
smart_lock_enabled?: boolean;
smart_lock_details?: JSONB;
utility_meters?: JSONB;
maintenance_history?: JSONB;

}

export interface UserProfiles {
id: UUID;
email: string;
first_name?: string;
last_name?: string;
organization_id?: UUID;
phone?: string;
created_at?: Timestamp;
updated_at?: Timestamp;
auth_id?: string;
profile_image_url?: string;
default_organization_id?: UUID;
status?: string;
last_login_at?: Timestamp;
email_verified?: boolean;
phone_verified?: boolean;
two_factor_enabled?: boolean;
notification_preferences?: JSONB;

}

export interface UserRoles {
id: UUID;
user_id?: UUID;
role_id?: UUID;
organization_id?: UUID;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Vendors {
id: UUID;
user_id?: UUID;
organization_id?: UUID;
service_type: string;
contact_email?: string;
contact_phone?: string;
hourly_rate?: number;
is_approved?: boolean;
notes?: string;
created_at?: Timestamp;
updated_at?: Timestamp;

}

export interface Database {
activity_logs: ActivityLogs[];
announcement_schedules: AnnouncementSchedules[];
announcement_targets: AnnouncementTargets[];
announcement_types: AnnouncementTypes[];
announcements: Announcements[];
bank_account_types: BankAccountTypes[];
bank_accounts: BankAccounts[];
communication_logs: CommunicationLogs[];
demo_requests: DemoRequests[];
documents: Documents[];
expenses: Expenses[];
financial_summaries: FinancialSummaries[];
invoice_items: InvoiceItems[];
invoice_payments: InvoicePayments[];
invoices: Invoices[];
lease_addendums: LeaseAddendums[];
lease_renewals: LeaseRenewals[];
leases: Leases[];
maintenance_comments: MaintenanceComments[];
maintenance_requests: MaintenanceRequests[];
maintenance_ticket_history: MaintenanceTicketHistory[];
maintenance_types: MaintenanceTypes[];
notifications: Notifications[];
organization_invitations: OrganizationInvitations[];
organizations: Organizations[];
owners: Owners[];
payment_categories: PaymentCategories[];
payment_methods: PaymentMethods[];
payment_schedules: PaymentSchedules[];
payment_transactions: PaymentTransactions[];
payments: Payments[];
properties: Properties[];
property_inspections: PropertyInspections[];
property_managers: PropertyManagers[];
property_metrics: PropertyMetrics[];
property_stakeholders: PropertyStakeholders[];
rental_applications: RentalApplications[];
roles: Roles[];
tasks: Tasks[];
tenants: Tenants[];
units: Units[];
user_profiles: UserProfiles[];
user_roles: UserRoles[];
vendors: Vendors[];
}
