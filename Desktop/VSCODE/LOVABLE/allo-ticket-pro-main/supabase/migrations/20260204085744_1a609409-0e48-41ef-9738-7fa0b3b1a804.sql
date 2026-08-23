-- Fix overly permissive RLS policies for payment_transactions

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Only system can update transactions" ON public.payment_transactions;

-- Create more secure insert policy (authenticated users or service role)
CREATE POLICY "Authenticated users can create transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');

-- Create secure update policy (only via service_role from webhook)
CREATE POLICY "Service role can update transactions"
ON public.payment_transactions
FOR UPDATE
USING (auth.role() = 'service_role');