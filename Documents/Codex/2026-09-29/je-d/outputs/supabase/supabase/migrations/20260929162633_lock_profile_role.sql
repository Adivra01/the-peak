revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, company, updated_at) on public.profiles to authenticated;
