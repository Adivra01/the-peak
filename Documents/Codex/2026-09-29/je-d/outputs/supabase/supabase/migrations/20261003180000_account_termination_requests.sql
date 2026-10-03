create table if not exists public.account_termination_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  client_email text not null,
  client_name text not null default '',
  reason text not null default '',
  status text not null default 'pending' check (status in ('pending','processing','approved','rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  admin_note text not null default ''
);
create index if not exists account_termination_status_date_idx
  on public.account_termination_requests(status, requested_at desc);
create unique index if not exists account_termination_one_active_per_user_idx
  on public.account_termination_requests(user_id)
  where user_id is not null and status in ('pending','processing');
alter table public.account_termination_requests enable row level security;
revoke all on public.account_termination_requests from anon, authenticated;
grant select, insert on public.account_termination_requests to authenticated;
drop policy if exists termination_client_select_own on public.account_termination_requests;
create policy termination_client_select_own on public.account_termination_requests
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
drop policy if exists termination_client_insert_own on public.account_termination_requests;
create policy termination_client_insert_own on public.account_termination_requests
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');
