-- Add separate client price and manager fees to ticket_types
ALTER TABLE public.ticket_types
  ADD COLUMN IF NOT EXISTS client_price INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS manager_fees INTEGER DEFAULT 0;

-- client_price: base price for direct client purchases (NULL = same as price)
-- manager_fees: additional fees on top of price for manager channel
