-- ============================================================
-- Reordenamiento de productos: agregar columna sort_order
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Inicializa sort_order por categoría: el producto más nuevo queda primero (valor menor)
UPDATE public.products p
SET sort_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at DESC) AS rn
  FROM public.products
) sub
WHERE p.id = sub.id;
