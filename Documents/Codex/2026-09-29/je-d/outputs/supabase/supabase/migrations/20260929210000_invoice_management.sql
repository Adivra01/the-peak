create sequence if not exists private.invoice_number_seq;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue','cancelled')),
  issued_on date not null default current_date,
  due_on date,
  currency text not null default 'XOF' check (currency = 'XOF'),
  issuer jsonb not null default '{}'::jsonb check (jsonb_typeof(issuer) = 'object'),
  customer jsonb not null default '{}'::jsonb check (jsonb_typeof(customer) = 'object'),
  line_items jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  tax_rate numeric(5,2) not null default 0 check (tax_rate between 0 and 100),
  subtotal bigint not null default 0 check (subtotal >= 0),
  tax_amount bigint not null default 0 check (tax_amount >= 0),
  total bigint not null default 0 check (total >= 0),
  payment_terms text not null default 'Paiement à effectuer avant la date d’échéance.\nMerci pour votre confiance.\nPour toute question, veuillez nous contacter.',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invoices_issued_idx on public.invoices(issued_on desc, created_at desc);
create index if not exists invoices_status_idx on public.invoices(status, due_on);

create or replace function private.assign_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'FAC-' || to_char(coalesce(new.issued_on, current_date), 'YYYY') || '-' ||
      lpad(nextval('private.invoice_number_seq'::regclass)::text, 4, '0');
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.assign_invoice_number() from public, anon, authenticated;

drop trigger if exists invoices_assign_number on public.invoices;
create trigger invoices_assign_number
before insert on public.invoices
for each row execute function private.assign_invoice_number();

alter table public.invoices enable row level security;
revoke all on public.invoices from anon, authenticated;
grant select, insert, update, delete on public.invoices to authenticated;

drop policy if exists invoices_admin_select on public.invoices;
create policy invoices_admin_select on public.invoices for select to authenticated
using ((select private.is_admin()));

drop policy if exists invoices_admin_insert on public.invoices;
create policy invoices_admin_insert on public.invoices for insert to authenticated
with check ((select private.is_admin()) and created_by = (select auth.uid()));

drop policy if exists invoices_admin_update on public.invoices;
create policy invoices_admin_update on public.invoices for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()) and created_by = (select auth.uid()));

drop policy if exists invoices_admin_delete on public.invoices;
create policy invoices_admin_delete on public.invoices for delete to authenticated
using ((select private.is_admin()));
