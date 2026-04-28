-- La policy auto-referencial en group_members bloquea todos los SELECTs.
-- Fix: función SECURITY DEFINER que bypasea RLS para la consulta interna,
-- rompiendo la recursión infinita.

DROP POLICY IF EXISTS "group_members_select_own" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_same_group" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_member" ON public.group_members;

-- Función que devuelve los group_ids del usuario actual sin aplicar RLS
CREATE OR REPLACE FUNCTION public.my_group_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM public.group_members WHERE user_id = auth.uid();
$$;

-- Policy única: puedo ver mis propias membresías Y las de otros en mis grupos
CREATE POLICY "group_members_select" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (SELECT public.my_group_ids())
  );
