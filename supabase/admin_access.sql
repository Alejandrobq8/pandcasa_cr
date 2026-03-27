create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.products enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Admin can read own row" on public.admin_users;
create policy "Admin can read own row" on public.admin_users
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products
for select to anon, authenticated
using (true);

drop policy if exists "Admin insert products" on public.products;
create policy "Admin insert products" on public.products
for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admin update products" on public.products;
create policy "Admin update products" on public.products
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admin delete products" on public.products;
create policy "Admin delete products" on public.products
for delete to authenticated
using (public.is_admin());

-- Despues de crear el usuario en Authentication > Users,
-- registra a cada administrador con una sentencia como esta:
--
-- insert into public.admin_users (user_id, email)
-- select id, email
-- from auth.users
-- where email = 'tu-correo@ejemplo.com'
-- on conflict (user_id) do update
-- set email = excluded.email;
