-- SQL Script to create all tables needed for the Announcement System

-- Create announcement table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'maintenance notice',
  communication_method TEXT[] NOT NULL,
  is_scheduled BOOLEAN NOT NULL DEFAULT false,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  issue_date TIMESTAMPTZ,
  scheduled_date TIMESTAMPTZ
);

-- Create announcement targets table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcement_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id),
  target_type TEXT NOT NULL, -- 'property', 'tenant', 'unit'
  target_id TEXT NOT NULL,
  target_name TEXT,
  property_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create announcement schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS announcement_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id),
  start_date TIMESTAMPTZ NOT NULL,
  time_of_day TEXT NOT NULL,
  repeat_frequency TEXT NOT NULL DEFAULT 'once',
  next_run TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create announcement jobs table if it doesn't exist 
-- This table tracks the background processing of announcements
CREATE TABLE IF NOT EXISTS announcement_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES announcements(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled', 'failed'
  total_tenants INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_processed_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create announcement background tasks table if it doesn't exist
-- This table tracks individual batches of messages being processed
CREATE TABLE IF NOT EXISTS announcement_background_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES announcement_jobs(id),
  announcement_id UUID NOT NULL REFERENCES announcements(id),
  remaining_count INTEGER NOT NULL DEFAULT 0,
  next_batch_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_announcements_organization_id ON announcements(organization_id);
CREATE INDEX IF NOT EXISTS idx_announcement_targets_announcement_id ON announcement_targets(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_targets_property_id ON announcement_targets(property_id);
CREATE INDEX IF NOT EXISTS idx_announcement_jobs_announcement_id ON announcement_jobs(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_background_tasks_job_id ON announcement_background_tasks(job_id);
CREATE INDEX IF NOT EXISTS idx_announcement_background_tasks_announcement_id ON announcement_background_tasks(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_schedules_next_run ON announcement_schedules(next_run);

-- Create RLS policies if needed (customize as necessary)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_background_tasks ENABLE ROW LEVEL SECURITY;

-- Example policy - allow org members to view announcements
CREATE POLICY IF NOT EXISTS "Organization members can view announcements" 
  ON announcements FOR SELECT 
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
  ));

-- Example policy - allow org admins to insert announcements  
CREATE POLICY IF NOT EXISTS "Organization admins can create announcements" 
  ON announcements FOR INSERT 
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create or update the get_tenant_contact_counts RPC function
CREATE OR REPLACE FUNCTION get_tenant_contact_counts(property_ids UUID[])
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'email', COUNT(DISTINCT t.id) FILTER (WHERE t.email IS NOT NULL),
    'sms', COUNT(DISTINCT t.id) FILTER (WHERE t.phone_number IS NOT NULL),
    'whatsapp', COUNT(DISTINCT t.id) FILTER (WHERE t.whatsapp_number IS NOT NULL),
    'total', COUNT(DISTINCT t.id)
  ) INTO result
  FROM tenants t
  JOIN leases l ON t.id = l.tenant_id
  JOIN units u ON l.unit_id = u.id
  WHERE u.property_id = ANY(property_ids)
  AND l.status = 'Active';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql; 