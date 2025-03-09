CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY,
  "lease_id" uuid,
  "amount" numeric NOT NULL,
  "payment_date" date NOT NULL,
  "payment_method" varchar(50) NOT NULL,
  "status" varchar(50),
  "transaction_id" varchar(100),
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "organizations" (
  "id" uuid PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "subscription_status" varchar(50),
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "description" text
);

CREATE TABLE "demo_requests" (
  "id" uuid PRIMARY KEY,
  "full_name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50),
  "company_name" varchar(255) NOT NULL,
  "job_title" varchar(100),
  "industry" varchar(100),
  "company_size" varchar(50),
  "country" varchar(100),
  "demo_preferences" text,
  "additional_comments" text,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "user_profiles" (
  "id" uuid PRIMARY KEY,
  "email" varchar(255) NOT NULL,
  "first_name" varchar(100),
  "last_name" varchar(100),
  "organization_id" uuid,
  "phone" varchar(50),
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "property_managers" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "organization_id" uuid,
  "assigned_properties" uuid[],
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "title" varchar(255) NOT NULL,
  "message" text NOT NULL,
  "type" varchar(50) NOT NULL,
  "read" boolean,
  "created_at" timestamp
);

CREATE TABLE "maintenance_requests" (
  "id" uuid PRIMARY KEY,
  "unit_id" uuid,
  "tenant_id" uuid,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "priority" varchar(50) NOT NULL,
  "status" varchar(50),
  "assigned_to" uuid,
  "completed_at" timestamp,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "owners" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "organization_id" uuid,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "user_roles" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "role_id" uuid,
  "organization_id" uuid
);

CREATE TABLE "properties" (
  "id" uuid PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "address" text NOT NULL,
  "city" varchar(100) NOT NULL,
  "state" varchar(100) NOT NULL,
  "zip_code" varchar(50) NOT NULL,
  "total_units" int NOT NULL,
  "owner_id" uuid,
  "organization_id" uuid,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "units" (
  "id" uuid PRIMARY KEY,
  "property_id" uuid,
  "unit_number" varchar(50) NOT NULL,
  "floor_plan" varchar(100),
  "square_feet" int,
  "bedrooms" int,
  "bathrooms" numeric,
  "rent_amount" numeric,
  "status" varchar(50),
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "tenants" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "organization_id" uuid,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "leases" (
  "id" uuid PRIMARY KEY,
  "unit_id" uuid,
  "tenant_id" uuid,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "rent_amount" numeric NOT NULL,
  "security_deposit" numeric,
  "status" varchar(50),
  "lease_document_url" text,
  "created_at" timestamp,
  "updated_at" timestamp
);

ALTER TABLE "user_profiles" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "property_managers" ADD FOREIGN KEY ("user_id") REFERENCES "user_profiles" ("id");

ALTER TABLE "property_managers" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "user_profiles" ("id");

ALTER TABLE "maintenance_requests" ADD FOREIGN KEY ("tenant_id") REFERENCES "user_profiles" ("id");

ALTER TABLE "maintenance_requests" ADD FOREIGN KEY ("assigned_to") REFERENCES "user_profiles" ("id");

ALTER TABLE "owners" ADD FOREIGN KEY ("user_id") REFERENCES "user_profiles" ("id");

ALTER TABLE "owners" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "user_profiles" ("id");

ALTER TABLE "user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "user_roles" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "properties" ADD FOREIGN KEY ("owner_id") REFERENCES "owners" ("id");

ALTER TABLE "properties" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "units" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id");

ALTER TABLE "tenants" ADD FOREIGN KEY ("user_id") REFERENCES "user_profiles" ("id");

ALTER TABLE "tenants" ADD FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id");

ALTER TABLE "leases" ADD FOREIGN KEY ("unit_id") REFERENCES "units" ("id");

ALTER TABLE "leases" ADD FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id");