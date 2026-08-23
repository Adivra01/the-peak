CREATE TABLE IF NOT EXISTS public.data_exports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  export_type text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  rows_exported integer NOT NULL DEFAULT 0,
  file_name text,
  file_url text,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  anonymized boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.data_exports TO authenticated;
GRANT ALL ON public.data_exports TO service_role;

ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'data_exports' AND policyname = 'Admins can view exports'
  ) THEN
    CREATE POLICY "Admins can view exports"
    ON public.data_exports FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    ));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_data_exports_updated_at'
  ) THEN
    CREATE TRIGGER update_data_exports_updated_at
    BEFORE UPDATE ON public.data_exports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
