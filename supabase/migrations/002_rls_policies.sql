-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_predictions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- TEAMS (public read)
CREATE POLICY "teams_select_all" ON public.teams
  FOR SELECT USING (true);

-- MATCHES (public read)
CREATE POLICY "matches_select_all" ON public.matches
  FOR SELECT USING (true);

-- GROUPS
CREATE POLICY "groups_select_authenticated" ON public.groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "groups_insert_authenticated" ON public.groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "groups_update_owner" ON public.groups
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "groups_delete_owner" ON public.groups
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- GROUP MEMBERS
CREATE POLICY "group_members_select_member" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "group_members_insert_self" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members_delete_self_or_owner" ON public.group_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (
      SELECT id FROM public.groups WHERE owner_id = auth.uid()
    )
  );

-- PREDICTIONS
-- Own predictions: always visible
-- Others' predictions: visible after match starts OR if group.predictions_visible = true
CREATE POLICY "predictions_select_member" ON public.predictions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
      AND (
        (SELECT predictions_visible FROM public.groups WHERE id = group_id) = true
        OR (SELECT match_date FROM public.matches WHERE id = match_id) <= now()
      )
    )
  );

CREATE POLICY "predictions_insert_own_before_start" ON public.predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    AND (
      SELECT match_date FROM public.matches WHERE id = match_id
    ) > now()
    AND (
      SELECT status FROM public.matches WHERE id = match_id
    ) = 'scheduled'
  );

CREATE POLICY "predictions_update_own_before_start" ON public.predictions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND (
      SELECT match_date FROM public.matches WHERE id = match_id
    ) > now()
    AND (
      SELECT status FROM public.matches WHERE id = match_id
    ) = 'scheduled'
  );

-- SPECIAL PREDICTIONS
CREATE POLICY "special_select_member" ON public.special_predictions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
      AND (locked_at IS NOT NULL)
    )
  );

CREATE POLICY "special_insert_own" ON public.special_predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    AND locked_at IS NULL
  );

CREATE POLICY "special_update_own" ON public.special_predictions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND locked_at IS NULL
  );
