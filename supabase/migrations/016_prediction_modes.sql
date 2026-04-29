-- Modalidades de prode por grupo.
-- full_bracket mantiene la modalidad existente para no cambiar grupos ya creados.
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS prediction_mode text NOT NULL DEFAULT 'full_bracket'
CHECK (prediction_mode IN ('phase_by_phase', 'full_bracket', 'hybrid'));

-- Puntajes del prode pre-torneo híbrido. El resto de modalidades conserva 5 exacto / 3 ganador.
CREATE OR REPLACE FUNCTION public.calculate_prediction_points_for_group(
  p_group_id uuid,
  p_match_id uuid,
  pred_home int, pred_away int,
  real_home int, real_away int,
  pred_pen text DEFAULT NULL,
  real_pen text DEFAULT NULL
) RETURNS int AS $$
DECLARE
  pred_winner text;
  real_winner text;
  mode text;
  phase text;
  exact_points int := 5;
  winner_points int := 3;
BEGIN
  SELECT prediction_mode INTO mode FROM public.groups WHERE id = p_group_id;
  SELECT matches.phase INTO phase FROM public.matches WHERE id = p_match_id;

  IF mode = 'hybrid' THEN
    CASE phase
      WHEN 'group' THEN exact_points := 3; winner_points := 1;
      WHEN 'round_of_32' THEN exact_points := 6; winner_points := 3;
      WHEN 'round_of_16' THEN exact_points := 9; winner_points := 6;
      WHEN 'quarterfinal' THEN exact_points := 15; winner_points := 10;
      WHEN 'semifinal' THEN exact_points := 25; winner_points := 18;
      WHEN 'final' THEN exact_points := 50; winner_points := 35;
      ELSE exact_points := 15; winner_points := 10;
    END CASE;
  END IF;

  IF pred_home > pred_away THEN pred_winner := 'home';
  ELSIF pred_home < pred_away THEN pred_winner := 'away';
  ELSIF pred_pen IS NOT NULL THEN pred_winner := pred_pen;
  ELSE pred_winner := 'draw'; END IF;

  IF real_home > real_away THEN real_winner := 'home';
  ELSIF real_home < real_away THEN real_winner := 'away';
  ELSIF real_pen IS NOT NULL THEN real_winner := real_pen;
  ELSE real_winner := 'draw'; END IF;

  IF pred_home = real_home AND pred_away = real_away
     AND (pred_pen IS NULL OR pred_pen = real_pen)
  THEN RETURN exact_points;
  ELSIF pred_winner = real_winner THEN RETURN winner_points;
  ELSE RETURN 0; END IF;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.update_prediction_points_on_finish()
RETURNS trigger AS $$
DECLARE
  pred RECORD;
  real_winner text;
BEGIN
  IF NEW.status = 'scheduled' THEN
    UPDATE public.predictions
    SET points_earned = 0,
        calculated_at = NULL
    WHERE match_id = NEW.id;

    RETURN NEW;
  END IF;

  IF NEW.status = 'finished'
    AND NEW.home_score_full IS NOT NULL
    AND NEW.away_score_full IS NOT NULL
    AND (
      OLD.status IS DISTINCT FROM NEW.status
      OR OLD.home_score_full IS DISTINCT FROM NEW.home_score_full
      OR OLD.away_score_full IS DISTINCT FROM NEW.away_score_full
      OR OLD.penalty_winner IS DISTINCT FROM NEW.penalty_winner
    )
  THEN
    IF NEW.home_score_full > NEW.away_score_full THEN real_winner := 'home';
    ELSIF NEW.home_score_full < NEW.away_score_full THEN real_winner := 'away';
    ELSIF NEW.penalty_winner IS NOT NULL THEN real_winner := NEW.penalty_winner;
    ELSE real_winner := 'draw'; END IF;

    FOR pred IN SELECT * FROM public.predictions WHERE match_id = NEW.id LOOP
      DECLARE
        base_pts int;
        pred_winner text;
        extra_bonus int := 0;
        mode text;
      BEGIN
        SELECT prediction_mode INTO mode FROM public.groups WHERE id = pred.group_id;

        base_pts := public.calculate_prediction_points_for_group(
          pred.group_id, NEW.id,
          pred.predicted_home_score, pred.predicted_away_score,
          NEW.home_score_full, NEW.away_score_full,
          pred.predicted_penalty_winner, NEW.penalty_winner
        );

        IF mode <> 'hybrid' THEN
          IF pred.predicted_home_score > pred.predicted_away_score THEN pred_winner := 'home';
          ELSIF pred.predicted_home_score < pred.predicted_away_score THEN pred_winner := 'away';
          ELSIF pred.predicted_penalty_winner IS NOT NULL THEN pred_winner := pred.predicted_penalty_winner;
          ELSE pred_winner := 'draw'; END IF;

          IF NEW.match_number = 104 AND pred_winner = real_winner THEN
            extra_bonus := 25;
          END IF;

          IF NEW.match_number = 103 AND pred_winner = real_winner THEN
            extra_bonus := 5;
          END IF;
        END IF;

        UPDATE public.predictions
        SET points_earned = base_pts + extra_bonus,
            calculated_at = now()
        WHERE id = pred.id;
      END;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
