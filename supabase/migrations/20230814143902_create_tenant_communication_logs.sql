-- Create tenant communication logs table
CREATE TABLE IF NOT EXISTS public.tenant_communication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- e.g., 'email_sent', 'sms_sent', 'whatsapp_opt_in'
  channel VARCHAR(20) NOT NULL, -- 'email', 'sms', 'whatsapp'
  status VARCHAR(20) NOT NULL, -- 'success', 'failure', 'pending'
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- For message references
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE SET NULL,
  message_id VARCHAR(100)
);

-- Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_tenant_comm_logs_tenant_id ON public.tenant_communication_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_comm_logs_event_type ON public.tenant_communication_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_tenant_comm_logs_announcement_id ON public.tenant_communication_logs(announcement_id);
CREATE INDEX IF NOT EXISTS idx_tenant_comm_logs_created_at ON public.tenant_communication_logs(created_at);

-- Add RLS policies
ALTER TABLE public.tenant_communication_logs ENABLE ROW LEVEL SECURITY;

-- Allow select access for authenticated users in the same organization as the tenant
CREATE POLICY tenant_comm_logs_select_policy ON public.tenant_communication_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tenants t
      JOIN public.organization_users ou ON t.organization_id = ou.organization_id
      WHERE t.id = tenant_communication_logs.tenant_id
      AND ou.user_id = auth.uid()
    )
  );

-- Allow insert access for service role and authenticated users in the same organization
CREATE POLICY tenant_comm_logs_insert_policy ON public.tenant_communication_logs
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role' = 'service_role') OR
    EXISTS (
      SELECT 1 FROM public.tenants t
      JOIN public.organization_users ou ON t.organization_id = ou.organization_id
      WHERE t.id = tenant_communication_logs.tenant_id
      AND ou.user_id = auth.uid()
    )
  );

-- Allow update for service role only (edge functions)
CREATE POLICY tenant_comm_logs_update_policy ON public.tenant_communication_logs
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');

-- Add whatsapp_number and whatsapp_opt_in columns to tenants table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN whatsapp_number VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'whatsapp_opt_in'
  ) THEN
    ALTER TABLE public.tenants ADD COLUMN whatsapp_opt_in BOOLEAN DEFAULT FALSE;
  END IF;
END
$$; 