create table payments (
  id uuid default uuid_generate_v4() primary key,
  lease_id uuid,
  amount numeric not null,
  payment_date date default now() not null,
  payment_method character not null,
  status character,
  transaction_id character,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name character not null,
  subscription_status character,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table roles (
  id uuid default uuid_generate_v4() primary key,
  name character not null,
  description text
);

create table demo_requests (
  id uuid default uuid_generate_v4() primary key,
  full_name character not null,
  email character not null,
  phone character,
  company_name character not null,
  job_title character,
  industry character,
  company_size character,
  country character,
  demo_preferences text,
  additional_comments text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table public.user_profiles (
  id uuid not null,
  email character varying(255) not null,
  first_name character varying(100) null,
  last_name character varying(100) null,
  organization_id uuid null,
  phone character varying(50) null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_email_key unique (email),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id),
  constraint user_profiles_organization_id_fkey foreign KEY (organization_id) references organizations (id)
) TABLESPACE pg_default;

create trigger update_user_profiles_updated_at BEFORE
update on user_profiles for EACH row
execute FUNCTION update_updated_at_column ();

create table property_managers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles (id),
  organization_id uuid references organizations (id),
  assigned_properties uuid[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles (id),
  title character not null,
  message text not null,
  type character not null,
  read boolean,
  created_at timestamp default now()
);

create table maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid,
  tenant_id uuid references user_profiles (id),
  title character not null,
  description text not null,
  priority character not null,
  status character,
  assigned_to uuid references user_profiles (id),
  completed_at timestamp default now(),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table owners (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles (id),
  organization_id uuid references organizations (id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles (id),
  role_id uuid references roles (id),
  organization_id uuid references organizations (id)
);

create table properties (
  id uuid default uuid_generate_v4() primary key,
  name character not null,
  address text not null,
  city character not null,
  state character not null,
  zip_code character not null,
  total_units integer not null,
  owner_id uuid references owners (id),
  organization_id uuid references organizations (id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table units (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties (id),
  unit_number character not null,
  floor_plan character,
  square_feet integer,
  bedrooms integer,
  bathrooms numeric,
  rent_amount numeric,
  status character,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table tenants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles (id),
  organization_id uuid references organizations (id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table leases (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references units (id),
  tenant_id uuid references tenants (id),
  start_date date default now() not null,
  end_date date default now() not null,
  rent_amount numeric not null,
  security_deposit numeric,
  status character,
  lease_document_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

