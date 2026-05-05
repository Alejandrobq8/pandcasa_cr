-- ============================================================
-- Bocadillos Carousel: migration
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- 1. Agregar bocadillos_carousel al check constraint de category
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('desayunos','almuerzos','panaderia','postres','queques','temporada','bocadillos_carousel'));

-- 2. Bucket de Storage para imágenes del carrusel de bocadillos
INSERT INTO storage.buckets (id, name, public)
VALUES ('bocadillos-carousel', 'bocadillos-carousel', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Storage
DROP POLICY IF EXISTS "Public read bocadillos carousel images" ON storage.objects;
CREATE POLICY "Public read bocadillos carousel images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'bocadillos-carousel');

DROP POLICY IF EXISTS "Admin upload bocadillos carousel images" ON storage.objects;
CREATE POLICY "Admin upload bocadillos carousel images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bocadillos-carousel' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete bocadillos carousel images" ON storage.objects;
CREATE POLICY "Admin delete bocadillos carousel images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bocadillos-carousel' AND public.is_admin());
