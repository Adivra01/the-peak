alter table public.profiles add column email text not null default '';
update public.profiles p set email=u.email from auth.users u where p.id=u.id;
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
grant select on public.profiles to authenticated;
