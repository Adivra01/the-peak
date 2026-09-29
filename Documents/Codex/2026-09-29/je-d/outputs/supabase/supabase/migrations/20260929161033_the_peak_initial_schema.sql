-- THE PEAK · projet Supabase neuf. Aucun objet préexistant n'est modifié.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  company text not null default '',
  role text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin');
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null default '',
  service_slug text not null default '',
  subject text not null,
  budget text not null default '',
  message text not null,
  source text not null default 'site',
  status text not null default 'new' check (status in ('new','in_progress','quote_sent','converted','closed','spam')),
  created_at timestamptz not null default now()
);

create table public.client_projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  service_slug text not null default '',
  summary text not null default '',
  status text not null default 'discovery' check (status in ('discovery','design','development','review','delivered','paused')),
  progress smallint not null default 0 check (progress between 0 and 100),
  next_step text not null default '',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.client_projects(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  attachment_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.portfolio_categories (
  slug text primary key,
  name text not null,
  sort_order smallint not null default 0
);
insert into public.portfolio_categories(slug,name,sort_order) values
  ('web','Web & mobile',1),('marketing','Marketing digital',2),('branding','Branding',3),
  ('infrastructure','Infrastructure',4),('creation','Visuels & vidéo',5),('software','Logiciels métier',6),
  ('ecommerce','E-commerce',7),('other','Autre',8)
on conflict (slug) do nothing;

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  client_name text not null default '',
  sector text not null default '',
  category_slug text not null references public.portfolio_categories(slug),
  excerpt text not null default '',
  description text not null default '',
  website_url text not null default '',
  technologies text[] not null default '{}',
  outcomes text[] not null default '{}',
  media jsonb not null default '[]'::jsonb check (jsonb_typeof(media) = 'array'),
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  delivered_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.digital_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sector text not null default '',
  description_short text not null default '',
  description text not null default '',
  status text not null default 'available' check (status in ('available','reserved','sold')),
  price_xof bigint not null default 0 check (price_xof >= 0),
  ecommerce_price_xof bigint check (ecommerce_price_xof is null or ecommerce_price_xof >= 0),
  demo_url text not null default '',
  technologies text[] not null default '{}',
  image_url text not null default '',
  video_url text not null default '',
  customizable boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_requests_created_idx on public.service_requests(created_at desc);
create index service_requests_status_idx on public.service_requests(status, created_at desc);
create index client_projects_client_idx on public.client_projects(client_id, updated_at desc);
create index project_updates_project_idx on public.project_updates(project_id, created_at desc);
create index portfolio_published_idx on public.portfolio_projects(published, sort_order, created_at desc);
create index products_published_idx on public.digital_products(published, status, created_at desc);

alter table public.profiles enable row level security;
alter table public.service_requests enable row level security;
alter table public.client_projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.portfolio_categories enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.digital_products enable row level security;

grant select on public.profiles to authenticated;
grant update (full_name, phone, company, updated_at) on public.profiles to authenticated;
grant insert on public.service_requests to anon, authenticated;
grant select, update on public.service_requests to authenticated;
grant select on public.client_projects, public.project_updates to authenticated;
grant select on public.portfolio_categories to anon, authenticated;
grant select on public.portfolio_projects, public.digital_products to anon, authenticated;
grant insert, update, delete on public.portfolio_categories, public.portfolio_projects, public.digital_products to authenticated;
grant insert, update, delete on public.client_projects, public.project_updates to authenticated;

create policy "profiles_select_self_or_admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
create policy "profiles_update_self_or_admin" on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select private.is_admin()))
with check (id = (select auth.uid()) or (select private.is_admin()));

create policy "requests_public_insert" on public.service_requests for insert to anon, authenticated
with check (user_id is null or user_id = (select auth.uid()));
create policy "requests_owner_or_admin_read" on public.service_requests for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "requests_admin_update" on public.service_requests for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "client_projects_owner_or_admin" on public.client_projects for select to authenticated
using (client_id = (select auth.uid()) or (select private.is_admin()));
create policy "client_projects_admin_insert" on public.client_projects for insert to authenticated
with check ((select private.is_admin()));
create policy "client_projects_admin_update" on public.client_projects for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "client_projects_admin_delete" on public.client_projects for delete to authenticated
using ((select private.is_admin()));

create policy "project_updates_client_read" on public.project_updates for select to authenticated
using (exists (select 1 from public.client_projects cp where cp.id = project_id and (cp.client_id = (select auth.uid()) or (select private.is_admin()))));
create policy "project_updates_admin_insert" on public.project_updates for insert to authenticated
with check ((select private.is_admin()));
create policy "project_updates_admin_update" on public.project_updates for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "project_updates_admin_delete" on public.project_updates for delete to authenticated
using ((select private.is_admin()));

create policy "categories_public_read" on public.portfolio_categories for select to anon, authenticated using (true);
create policy "categories_admin_manage" on public.portfolio_categories for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "portfolio_public_or_admin_read" on public.portfolio_projects for select to anon, authenticated
using (published or (select private.is_admin()));
create policy "portfolio_admin_manage" on public.portfolio_projects for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "products_public_or_admin_read" on public.digital_products for select to anon, authenticated
using ((published and status <> 'sold') or (select private.is_admin()));
create policy "products_admin_manage" on public.digital_products for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('peak-portfolio','peak-portfolio',true,104857600,array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm'])
on conflict (id) do nothing;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('peak-client-files','peak-client-files',false,26214400,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4'])
on conflict (id) do nothing;
create policy "public_read_peak_portfolio" on storage.objects for select to anon, authenticated
using (bucket_id = 'peak-portfolio');
create policy "admin_manage_peak_portfolio" on storage.objects for all to authenticated
using (bucket_id = 'peak-portfolio' and (select private.is_admin()))
with check (bucket_id = 'peak-portfolio' and (select private.is_admin()));
create policy "client_read_own_files_or_admin" on storage.objects for select to authenticated
using (bucket_id = 'peak-client-files' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy "client_upload_own_files_or_admin" on storage.objects for insert to authenticated
with check (bucket_id = 'peak-client-files' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy "client_update_own_files_or_admin" on storage.objects for update to authenticated
using (bucket_id = 'peak-client-files' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())))
with check (bucket_id = 'peak-client-files' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy "client_delete_own_files_or_admin" on storage.objects for delete to authenticated
using (bucket_id = 'peak-client-files' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
