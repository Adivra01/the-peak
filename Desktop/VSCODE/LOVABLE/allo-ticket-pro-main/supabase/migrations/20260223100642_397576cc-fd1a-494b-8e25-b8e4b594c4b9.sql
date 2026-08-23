
-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule GDPR purge to run daily at 3 AM UTC
SELECT cron.schedule(
  'gdpr-purge-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://fjmprtqglmmlmgdddkoq.supabase.co/functions/v1/gdpr-purge',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbXBydHFnbG1tbG1nZGRka29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNDA3ODAsImV4cCI6MjA4MjgxNjc4MH0.WKUNSZSF89G4MVMh_NP02clpRdLpO3oVhJCy7-W8OcA"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
