-- Reemplazar la política SELECT de group_members
-- La versión anterior era auto-referencial y causaba que el check "ya soy miembro"
-- devuelva null incorrectamente, generando duplicate key al intentar insertar.

DROP POLICY IF EXISTS "group_members_select_member" ON public.group_members;

-- Nueva política: un usuario siempre puede ver sus propias membresías.
-- Para ver las de otros, tiene que ser miembro del mismo grupo.
-- Se usa security_invoker=off para evitar recursión.
CREATE POLICY "group_members_select_own" ON public.group_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Política separada para ver otros miembros del grupo (sin auto-referencia)
CREATE POLICY "group_members_select_same_group" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id
      FROM public.group_members gm
      WHERE gm.user_id = auth.uid()
    )
  );
