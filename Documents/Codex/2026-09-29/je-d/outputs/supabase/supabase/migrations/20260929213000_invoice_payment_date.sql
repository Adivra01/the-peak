alter table public.invoices
  add column if not exists paid_on date;
