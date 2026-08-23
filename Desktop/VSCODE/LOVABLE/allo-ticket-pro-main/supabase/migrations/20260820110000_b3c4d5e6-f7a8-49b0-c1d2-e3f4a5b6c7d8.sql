-- Export trimestriel automatique vers Google Drive + anonymisation RGPD
-- Planifié le 1er jour de janvier, avril, juillet, octobre à 3h00 UTC

SELECT cron.schedule(
  'quarterly-export-drive',
  '0 3 1 1,4,7,10 *',
  $$
  SELECT net.http_post(
    url := 'https://fjmprtqglmmlmgdddkoq.supabase.co/functions/v1/quarterly-export',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbXBydHFnbG1tbG1nZGRka29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNDA3ODAsImV4cCI6MjA4MjgxNjc4MH0.WKUNSZSF89G4MVMh_NP02clpRdLpO3oVhJCy7-W8OcA"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
