
-- Table des codes de réduction
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage discount codes"
ON public.discount_codes
FOR ALL
USING (is_admin(auth.uid()));

-- Everyone can read active codes (needed for validation at checkout)
CREATE POLICY "Anyone can read active discount codes"
ON public.discount_codes
FOR SELECT
USING (is_active = true);

-- Add discount_code column to tickets for tracking
ALTER TABLE public.tickets ADD COLUMN discount_code TEXT DEFAULT NULL;
ALTER TABLE public.tickets ADD COLUMN discount_percentage INTEGER DEFAULT 0;
