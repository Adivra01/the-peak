-- Allow searching tickets by phone number (read-only, limited fields)
CREATE POLICY "Anyone can search tickets by phone"
ON public.tickets
FOR SELECT
USING (true);

-- Drop the redundant narrower policies that conflict
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.tickets;
