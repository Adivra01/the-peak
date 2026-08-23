-- Add time slot fields to ticket_types (optional, for multi-slot events)
ALTER TABLE public.ticket_types
  ADD COLUMN IF NOT EXISTS start_time TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS end_time TEXT DEFAULT NULL;
