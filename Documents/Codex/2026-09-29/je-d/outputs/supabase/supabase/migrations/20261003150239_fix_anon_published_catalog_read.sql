-- Applied remotely as 20261003150155_fix_anon_published_catalog_read.
-- Anonymous users read published content without invoking private.is_admin().
alter policy portfolio_public_or_admin_read on public.portfolio_projects to authenticated;
create policy portfolio_anon_published_read on public.portfolio_projects for select to anon using (published);
alter policy products_public_or_admin_read on public.digital_products to authenticated;
create policy products_anon_published_read on public.digital_products for select to anon using (published and status <> 'sold');
