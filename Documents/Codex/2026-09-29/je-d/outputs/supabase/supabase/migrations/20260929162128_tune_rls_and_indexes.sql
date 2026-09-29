create index if not exists service_requests_user_idx on public.service_requests(user_id);
create index if not exists portfolio_category_idx on public.portfolio_projects(category_slug);
create index if not exists project_updates_author_idx on public.project_updates(author_id);

drop policy if exists "categories_admin_manage" on public.portfolio_categories;
create policy "categories_admin_insert" on public.portfolio_categories for insert to authenticated with check ((select private.is_admin()));
create policy "categories_admin_update" on public.portfolio_categories for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "categories_admin_delete" on public.portfolio_categories for delete to authenticated using ((select private.is_admin()));

drop policy if exists "portfolio_admin_manage" on public.portfolio_projects;
create policy "portfolio_admin_insert" on public.portfolio_projects for insert to authenticated with check ((select private.is_admin()));
create policy "portfolio_admin_update" on public.portfolio_projects for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "portfolio_admin_delete" on public.portfolio_projects for delete to authenticated using ((select private.is_admin()));

drop policy if exists "products_admin_manage" on public.digital_products;
create policy "products_admin_insert" on public.digital_products for insert to authenticated with check ((select private.is_admin()));
create policy "products_admin_update" on public.digital_products for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "products_admin_delete" on public.digital_products for delete to authenticated using ((select private.is_admin()));
