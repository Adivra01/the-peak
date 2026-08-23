-- Create payment_transactions table to track Wave payments
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  transaction_id text,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  method text NOT NULL DEFAULT 'wave',
  customer_phone text NOT NULL,
  customer_email text,
  customer_first_name text NOT NULL,
  customer_last_name text NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type_id uuid NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  payment_url text,
  net_amount integer,
  commission integer,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
USING (user_id = auth.uid() OR customer_phone IS NOT NULL);

CREATE POLICY "Anyone can create transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only system can update transactions"
ON public.payment_transactions
FOR UPDATE
USING (true);

CREATE POLICY "Admins can view all transactions"
ON public.payment_transactions
FOR SELECT
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();