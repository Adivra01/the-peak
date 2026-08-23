
-- Function to check organizer role
CREATE OR REPLACE FUNCTION public.is_organizer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'organizer'
  )
$$;

-- Organizer requests table (similar to manager_requests)
CREATE TABLE public.organizer_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

ALTER TABLE public.organizer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage organizer requests"
  ON public.organizer_requests FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can create own organizer request"
  ON public.organizer_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own organizer request"
  ON public.organizer_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Junction table: organizer <-> events
CREATE TABLE public.organizer_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid,
  UNIQUE (organizer_id, event_id)
);

ALTER TABLE public.organizer_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage organizer events"
  ON public.organizer_events FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Organizers can view their assignments"
  ON public.organizer_events FOR SELECT
  USING (auth.uid() = organizer_id);

-- Allow organizers to view events assigned to them
CREATE POLICY "Organizers can view assigned events"
  ON public.events FOR SELECT
  USING (
    is_organizer(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.organizer_events
      WHERE organizer_events.event_id = events.id
        AND organizer_events.organizer_id = auth.uid()
    )
  );

-- Allow organizers to view tickets for their assigned events
CREATE POLICY "Organizers can view tickets for assigned events"
  ON public.tickets FOR SELECT
  USING (
    is_organizer(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.organizer_events
      WHERE organizer_events.event_id = tickets.event_id
        AND organizer_events.organizer_id = auth.uid()
    )
  );

-- Allow organizers to view ticket types for their assigned events
CREATE POLICY "Organizers can view ticket types for assigned events"
  ON public.ticket_types FOR SELECT
  USING (
    is_organizer(auth.uid()) AND EXISTS (
      SELECT 1 FROM public.organizer_events
      WHERE organizer_events.event_id = ticket_types.event_id
        AND organizer_events.organizer_id = auth.uid()
    )
  );
