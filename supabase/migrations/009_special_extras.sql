-- Opciones extra en grupos: máximo goleador, asistidor, MVP
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS has_top_scorer  boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS has_top_assist  boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS has_mvp         boolean DEFAULT false NOT NULL;

-- Campos extra en special_predictions
ALTER TABLE public.special_predictions
  ADD COLUMN IF NOT EXISTS top_scorer_name  text,
  ADD COLUMN IF NOT EXISTS top_assist_name  text,
  ADD COLUMN IF NOT EXISTS mvp_name         text,
  ADD COLUMN IF NOT EXISTS top_scorer_points int DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS top_assist_points int DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS mvp_points        int DEFAULT 0 NOT NULL;

-- Actualizar la vista ranking_by_group para incluir los nuevos puntos
CREATE OR REPLACE VIEW public.ranking_by_group AS
SELECT
  gm.group_id,
  gm.user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  COALESCE(SUM(pr.points_earned), 0)
    + COALESCE(sp.champion_points, 0)
    + COALESCE(sp.runner_up_points, 0)
    + COALESCE(sp.third_place_points, 0)
    + COALESCE(sp.top_scorer_points, 0)
    + COALESCE(sp.top_assist_points, 0)
    + COALESCE(sp.mvp_points, 0) AS total_points,
  COUNT(CASE WHEN pr.points_earned > 0 THEN 1 END) AS correct_predictions
FROM public.group_members gm
JOIN public.profiles p ON p.id = gm.user_id
LEFT JOIN public.predictions pr
  ON pr.user_id = gm.user_id AND pr.group_id = gm.group_id
LEFT JOIN public.special_predictions sp
  ON sp.user_id = gm.user_id AND sp.group_id = gm.group_id
GROUP BY
  gm.group_id, gm.user_id,
  p.display_name, p.username, p.avatar_url,
  sp.champion_points, sp.runner_up_points, sp.third_place_points,
  sp.top_scorer_points, sp.top_assist_points, sp.mvp_points;

ALTER VIEW public.ranking_by_group SET (security_invoker = on);
