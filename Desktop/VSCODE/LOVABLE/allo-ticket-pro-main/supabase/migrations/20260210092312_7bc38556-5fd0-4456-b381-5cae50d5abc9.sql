
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.payment_transactions;

-- Allow inserts for authenticated users (for payment creation)
CREATE POLICY "Authenticated users can create transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
