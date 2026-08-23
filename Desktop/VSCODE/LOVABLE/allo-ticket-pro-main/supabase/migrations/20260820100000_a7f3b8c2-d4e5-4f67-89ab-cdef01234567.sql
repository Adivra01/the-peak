-- Allow organizers to read approved manager info for managers
-- who have sold tickets in their events
CREATE POLICY "Organizers can view approved managers"
  ON public.manager_requests FOR SELECT
  USING (
    is_organizer(auth.uid())
    AND status = 'approved'
  );
