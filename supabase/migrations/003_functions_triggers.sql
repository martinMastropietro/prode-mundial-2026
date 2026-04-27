-- =============================================
-- Functions and Triggers
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Calculate prediction points
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(
  pred_home integer,
  pred_away integer,
  real_home integer,
  real_away integer
) RETURNS integer AS $$
DECLARE
  pred_result text;
  real_result text;
BEGIN
  IF pred_home > pred_away THEN pred_result := 'H';
  ELSIF pred_home < pred_away THEN pred_result := 'A';
  ELSE pred_result := 'D'; END IF;

  IF real_home > real_away THEN real_result := 'H';
  ELSIF real_home < real_away THEN real_result := 'A';
  ELSE real_result := 'D'; END IF;

  IF pred_home = real_home AND pred_away = real_away THEN RETURN 5;
  ELSIF pred_result = real_result THEN RETURN 3;
  ELSE RETURN 0; END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: calculate points when match finishes
CREATE OR REPLACE FUNCTION public.update_prediction_points_on_finish()
RETURNS trigger AS $$
BEGIN
  -- Only run when status changes to 'finished' and scores are set
  IF NEW.status = 'finished'
    AND OLD.status != 'finished'
    AND NEW.home_score_full IS NOT NULL
    AND NEW.away_score_full IS NOT NULL
  THEN
    UPDATE public.predictions
    SET
      points_earned = public.calculate_prediction_points(
        predicted_home_score,
        predicted_away_score,
        NEW.home_score_full,
        NEW.away_score_full
      ),
      calculated_at = now()
    WHERE match_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_match_finished
  AFTER UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_prediction_points_on_finish();

-- Ranking view
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
    + COALESCE(sp.third_place_points, 0) AS total_points,
  COUNT(CASE WHEN pr.points_earned > 0 THEN 1 END) AS correct_predictions
FROM public.group_members gm
JOIN public.profiles p ON p.id = gm.user_id
LEFT JOIN public.predictions pr
  ON pr.user_id = gm.user_id AND pr.group_id = gm.group_id
LEFT JOIN public.special_predictions sp
  ON sp.user_id = gm.user_id AND sp.group_id = gm.group_id
GROUP BY
  gm.group_id,
  gm.user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  sp.champion_points,
  sp.runner_up_points,
  sp.third_place_points;

-- RLS on view (security_invoker ensures caller's RLS applies)
ALTER VIEW public.ranking_by_group SET (security_invoker = on);
