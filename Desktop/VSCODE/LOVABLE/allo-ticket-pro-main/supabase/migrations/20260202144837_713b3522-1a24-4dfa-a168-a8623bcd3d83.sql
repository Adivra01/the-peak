-- Create storage bucket for event media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-media', 
  'event-media', 
  true,
  52428800, -- 50MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- Create storage policies for event media
CREATE POLICY "Anyone can view event media"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-media');

CREATE POLICY "Admins can upload event media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-media' 
  AND public.is_admin()
);

CREATE POLICY "Admins can update event media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-media' 
  AND public.is_admin()
);

CREATE POLICY "Admins can delete event media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-media' 
  AND public.is_admin()
);

-- Add customer_phone to Ticket type by adding to tickets table if not exists
-- (phone is already there, just making sure)

-- Update tickets table to ensure phone is captured
ALTER TABLE public.tickets ALTER COLUMN customer_phone SET NOT NULL;
ALTER TABLE public.tickets ALTER COLUMN customer_phone SET DEFAULT '';

-- Create index for phone search
CREATE INDEX IF NOT EXISTS idx_tickets_customer_phone ON public.tickets (customer_phone);