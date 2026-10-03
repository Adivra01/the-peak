drop policy if exists termination_client_insert_own on public.account_termination_requests;
create policy termination_client_insert_own on public.account_termination_requests
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'client'
    )
  );
