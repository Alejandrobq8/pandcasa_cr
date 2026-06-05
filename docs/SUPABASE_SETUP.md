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
  category text not null check (category in ('almuerzos','panaderia','postres','queques','temporada')),
  extras jsonb not null default '[]'::jsonb,
  available boolean not null default true,
  created_at timestamptz not null default now()
);
```

Si ya tienes la tabla y quieres eliminar imágenes:

```sql
alter table public.products
  drop column if exists image_url;
```

Si ya creaste la tabla, corre este update para habilitar la categoría "temporada":

```sql
alter table public.products
  drop constraint if exists products_category_check;

alter table public.products
  add constraint products_category_check
  check (category in ('almuerzos','panaderia','postres','queques','temporada'));
```

## 3) (Opcional) Storage para imágenes
Si en el futuro quieres volver a subir fotos, crea un bucket llamado `product-images` y configura las policies.

## 4) Crear usuario admin
1. Ve a `Authentication → Users`.
2. Crea un usuario con email/contraseña.
3. Copia y ejecuta el contenido de `supabase/admin_access.sql`.
4. Inserta el usuario en `public.admin_users` con el ejemplo que viene al final de ese archivo.
5. Ese usuario será el acceso al admin.

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
Despliega el sitio en Vercel y listo. El admin estará en:

`/admin`

## 7) Recomendado para Vercel
Si quieres agregar una capa extra antes del login de Supabase, configura estas variables de entorno en Vercel:

- `ADMIN_GATE_USER`
- `ADMIN_GATE_PASS`

Con `middleware.js`, Vercel pedirá esas credenciales del navegador antes de permitir el acceso a `/admin`.
Después de pasar ese acceso previo, el panel seguirá exigiendo tu usuario admin de Supabase y las policies seguirán bloqueando cambios a cualquier otro usuario.
