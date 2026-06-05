# Vercel Production Checklist

## 1) Vercel

- Importa el repositorio en Vercel.
- Confirma que el proyecto usa la raiz del repositorio actual.
- Haz un redeploy despues de cualquier cambio en `middleware.js`, `vercel.json` o `package.json`.

## 2) Variables de entorno en Vercel

Variables opcionales para el candado previo de `/admin`:

- `ADMIN_GATE_USER`
- `ADMIN_GATE_PASS`

Si no defines estas dos variables, `/admin` seguira protegido solo por Supabase.

## 3) Supabase

En `Project Settings -> API`, confirma:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

El proyecto ya usa esas credenciales en frontend. La seguridad real depende de las policies y del control de admins.

## 4) SQL de admins

Ejecuta y deja aplicado:

- `supabase/admin_access.sql`

Verifica que exista tu usuario en `public.admin_users` con un `user_id` real, no `null`.

Consulta util:

```sql
select au.email, adu.user_id, adu.created_at
from auth.users au
left join public.admin_users adu
  on adu.user_id = au.id
where au.email = 'alejandrobarquero08@gmail.com';
```

## 5) Pruebas del admin

Prueba este flujo:

1. Abre `/admin`
2. Si configuraste `ADMIN_GATE_USER` y `ADMIN_GATE_PASS`, pasa el Basic Auth del navegador
3. Inicia sesion con tu usuario admin de Supabase
4. Confirma que puedes ver, crear, editar y eliminar productos

## 6) Pruebas del sitio publico

- Verifica que `/` cargue bien
- Verifica paginas en `/pages/...`
- Verifica que el formulario de contacto abra WhatsApp
- Verifica que `robots.txt` apunte al dominio correcto

## 7) Dominio

Si vas a usar dominio propio:

- apunta el dominio a Vercel
- confirma HTTPS activo
- confirma que los canonicals usen el dominio final

## 8) Limpieza externa

Si ya no vas a usar Netlify:

- elimina o desactiva el proyecto en Netlify
- elimina variables de entorno viejas en Netlify
- elimina configuraciones de Netlify Identity y Forms si aun existen en el panel

## 9) Archivos importantes del proyecto

- `vercel.json`
- `middleware.js`
- `package.json`
- `js/admin.js`
- `js/app.js`
- `supabase/admin_access.sql`
- `SUPABASE_SETUP.md`
