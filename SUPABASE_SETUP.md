# Supabase Setup (Pan d’ Casa)

## 1) Crear proyecto
1. Crea un proyecto en Supabase.
2. En `Project Settings → API`, copia:
   - `Project URL`
   - `anon public key`

## 2) Crear tabla de productos
En `SQL Editor`, ejecuta:

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,
  category text not null check (category in ('almuerzos','panaderia','postres','queques')),
  extras jsonb not null default '[]'::jsonb,
  image_url text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Public read products" on public.products
for select using (true);

create policy "Admin insert products" on public.products
for insert with check ((select auth.role()) = 'authenticated');

create policy "Admin update products" on public.products
for update using ((select auth.role()) = 'authenticated');

create policy "Admin delete products" on public.products
for delete using ((select auth.role()) = 'authenticated');
```

## 3) Storage para imágenes
1. En `Storage`, crea un bucket llamado `product-images`.
2. Configúralo como **public**.
3. En `SQL Editor`, ejecuta:

```sql
create policy "Public read product images" on storage.objects
for select using (bucket_id = 'product-images');

create policy "Admin upload product images" on storage.objects
for insert with check (bucket_id = 'product-images' and (select auth.role()) = 'authenticated');

create policy "Admin update product images" on storage.objects
for update using (bucket_id = 'product-images' and (select auth.role()) = 'authenticated');

create policy "Admin delete product images" on storage.objects
for delete using (bucket_id = 'product-images' and (select auth.role()) = 'authenticated');
```

## 4) Crear usuario admin
1. Ve a `Authentication → Users`.
2. Crea un usuario con email/contraseña.
3. Ese usuario será el acceso al admin.

## 5) Configurar la app
Abre estos archivos y reemplaza:

- `js/app.js`
- `js/admin.js`

```js
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
```

Con esos valores reales del proyecto.

## 6) Publicar
Sube todo a Netlify y listo. El admin estará en:

`/admin.html`
