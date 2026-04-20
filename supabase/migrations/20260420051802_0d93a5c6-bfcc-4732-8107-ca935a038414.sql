-- Allow production users to manage products and raw materials catalog
DROP POLICY IF EXISTS "Production users can insert products" ON public.products;
DROP POLICY IF EXISTS "Production users can update products" ON public.products;
DROP POLICY IF EXISTS "Production users can delete products" ON public.products;
DROP POLICY IF EXISTS "Production users can insert raw materials" ON public.raw_materials;
DROP POLICY IF EXISTS "Production users can update raw materials" ON public.raw_materials;
DROP POLICY IF EXISTS "Production users can delete raw materials" ON public.raw_materials;

CREATE POLICY "Production users can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.is_production_user(auth.uid()));

CREATE POLICY "Production users can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.is_production_user(auth.uid()))
WITH CHECK (public.is_production_user(auth.uid()));

CREATE POLICY "Production users can delete products"
ON public.products FOR DELETE TO authenticated
USING (public.is_production_user(auth.uid()));

CREATE POLICY "Production users can insert raw materials"
ON public.raw_materials FOR INSERT TO authenticated
WITH CHECK (public.is_production_user(auth.uid()));

CREATE POLICY "Production users can update raw materials"
ON public.raw_materials FOR UPDATE TO authenticated
USING (public.is_production_user(auth.uid()))
WITH CHECK (public.is_production_user(auth.uid()));

CREATE POLICY "Production users can delete raw materials"
ON public.raw_materials FOR DELETE TO authenticated
USING (public.is_production_user(auth.uid()));