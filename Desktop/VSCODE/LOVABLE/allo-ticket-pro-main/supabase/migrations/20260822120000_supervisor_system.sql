-- Supervisor requests table (same pattern as manager_requests / organizer_requests)
CREATE TABLE IF NOT EXISTS public.supervisor_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Event supervisors table (same pattern as organizer_events)
CREATE TABLE IF NOT EXISTS public.event_supervisors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  supervisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(event_id, supervisor_id)
);

-- Enable RLS
ALTER TABLE public.supervisor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_supervisors ENABLE ROW LEVEL SECURITY;

-- RLS: supervisor_requests
CREATE POLICY "Users can insert their own supervisor request"
  ON public.supervisor_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own supervisor request"
  ON public.supervisor_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all supervisor requests"
  ON public.supervisor_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update supervisor requests"
  ON public.supervisor_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS: event_supervisors
CREATE POLICY "Admins can manage event_supervisors"
  ON public.event_supervisors FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Supervisors can read their own event assignments"
  ON public.event_supervisors FOR SELECT
  USING (auth.uid() = supervisor_id);

-- Updated_at trigger for supervisor_requests
CREATE OR REPLACE FUNCTION public.update_supervisor_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER supervisor_requests_updated_at
  BEFORE UPDATE ON public.supervisor_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supervisor_requests_updated_at();
