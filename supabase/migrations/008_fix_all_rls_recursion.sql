-- Corregir TODAS las policies que tienen sub-queries auto-referenciales a group_members.
-- Reemplazarlas por la función my_group_ids() que usa SECURITY DEFINER.

-- PREDICTIONS
DROP POLICY IF EXISTS "predictions_select_member" ON public.predictions;
DROP POLICY IF EXISTS "predictions_insert_own_before_start" ON public.predictions;
DROP POLICY IF EXISTS "predictions_update_own_before_start" ON public.predictions;

CREATE POLICY "predictions_select" ON public.predictions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      group_id IN (SELECT public.my_group_ids())
      AND (
        (SELECT predictions_visible FROM public.groups WHERE id = group_id) = true
        OR (SELECT match_date FROM public.matches WHERE id = match_id) <= now()
      )
    )
  );

CREATE POLICY "predictions_insert" ON public.predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (SELECT public.my_group_ids())
    AND (SELECT match_date FROM public.matches WHERE id = match_id) > now()
    AND (SELECT status FROM public.matches WHERE id = match_id) = 'scheduled'
  );

CREATE POLICY "predictions_update" ON public.predictions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND (SELECT match_date FROM public.matches WHERE id = match_id) > now()
    AND (SELECT status FROM public.matches WHERE id = match_id) = 'scheduled'
  );

-- SPECIAL PREDICTIONS
DROP POLICY IF EXISTS "special_select_member" ON public.special_predictions;
DROP POLICY IF EXISTS "special_insert_own" ON public.special_predictions;
DROP POLICY IF EXISTS "special_update_own" ON public.special_predictions;

CREATE POLICY "special_select" ON public.special_predictions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      group_id IN (SELECT public.my_group_ids())
      AND locked_at IS NOT NULL
    )
  );

CREATE POLICY "special_insert" ON public.special_predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (SELECT public.my_group_ids())
    AND locked_at IS NULL
  );

CREATE POLICY "special_update" ON public.special_predictions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND locked_at IS NULL);
