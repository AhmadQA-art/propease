-- Create a cron job to run the notification system daily at 8 AM
-- First, make sure the cron extension is enabled (this should be enabled by default in Supabase)

-- Drop existing job if it exists to prevent duplicates (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'propease-lease-notifications') THEN
    PERFORM cron.unschedule('propease-lease-notifications');
  END IF;
END
$$;

-- Schedule the notification job to run daily at a specific time
SELECT cron.schedule(
  'propease-lease-notifications',  -- unique identifier for this job
  '0 8 * * *',                    -- cron expression: run at 8:00 AM daily
  $$
    -- Use net.http_post to call the edge function
    SELECT net.http_post(
      url:='https://ljojrcciojdprmvrtbdb.supabase.co/functions/v1/notification-job',
      body:='{}',  -- empty JSON body
      headers:='{
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMzkxMywiZXhwIjoyMDU0MTg5OTEzfQ.iSwJVhqLhi6PNdDbuSAIGr8Xu2QRmJkkZvsmNecx7QI"
      }'::jsonb
    );
  $$
);

-- Verify that the cron job was created
SELECT * FROM cron.job WHERE jobname = 'propease-lease-notifications';
