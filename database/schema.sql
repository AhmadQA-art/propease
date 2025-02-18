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

create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name character not null,
  subscription_status character,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table user_profiles (
  id uuid default uuid_generate_v4() primary key,
  email character not null,
  first_name character,
  last_name character,
  role character not null,
  organization_id uuid references organizations (id),
  phone character,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table properties (
  id uuid default uuid_generate_v4() primary key,
  name character not null,
  address text not null,
  city character not null,
  state character not null,
  zip_code character not null,
  units integer not null,
  owner_id uuid references user_profiles (id),
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

create table maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references units (id),
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

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles (id),
  title character not null,
  message text not null,
  type character not null,
  read boolean,
  created_at timestamp default now()
);

create table leases (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references units (id),
  tenant_id uuid references user_profiles (id),
  start_date date default now() not null,
  end_date date default now() not null,
  rent_amount numeric not null,
  security_deposit numeric,
  status character,
  lease_document_url text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table payments (
  id uuid default uuid_generate_v4() primary key,
  lease_id uuid references leases (id),
  amount numeric not null,
  payment_date date default now() not null,
  payment_method character not null,
  status character,
  transaction_id character,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

