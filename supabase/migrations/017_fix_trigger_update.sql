-- El trigger anterior solo disparaba al CAMBIAR status a 'finished'.
-- Al actualizar el resultado de un partido ya finalizado, no recalculaba.
-- Fix: también disparar cuando cambian los scores en un partido ya finalizado.

CREATE OR REPLACE FUNCTION public.update_prediction_points_on_finish()
RETURNS trigger AS $$
DECLARE
  pred   RECORD;
  base   int;
  bonus  int;
  pred_w text;
  real_w text;
BEGIN
  -- Disparar si:
  --   a) el partido pasa a 'finished', O
  --   b) ya era 'finished' y cambiaron los scores
  IF NEW.status = 'finished'
     AND NEW.home_score_full IS NOT NULL
     AND NEW.away_score_full IS NOT NULL
     AND (
       OLD.status != 'finished'
       OR OLD.home_score_full  IS DISTINCT FROM NEW.home_score_full
       OR OLD.away_score_full  IS DISTINCT FROM NEW.away_score_full
       OR OLD.penalty_winner   IS DISTINCT FROM NEW.penalty_winner
     )
  THEN
    -- Ganador real
    IF    NEW.home_score_full > NEW.away_score_full THEN real_w := 'home';
    ELSIF NEW.home_score_full < NEW.away_score_full THEN real_w := 'away';
    ELSIF NEW.penalty_winner IS NOT NULL             THEN real_w := NEW.penalty_winner;
    ELSE  real_w := 'draw'; END IF;

    FOR pred IN
      SELECT * FROM public.predictions WHERE match_id = NEW.id
    LOOP
      base := public.calculate_prediction_points(
        pred.predicted_home_score, pred.predicted_away_score,
        NEW.home_score_full,        NEW.away_score_full,
        pred.predicted_penalty_winner, NEW.penalty_winner
      );

      -- Ganador predicho
      IF    pred.predicted_home_score > pred.predicted_away_score THEN pred_w := 'home';
      ELSIF pred.predicted_home_score < pred.predicted_away_score THEN pred_w := 'away';
      ELSIF pred.predicted_penalty_winner IS NOT NULL              THEN pred_w := pred.predicted_penalty_winner;
      ELSE  pred_w := 'draw'; END IF;

      bonus := 0;
      IF NEW.match_number = 104 AND pred_w = real_w THEN bonus := 25; END IF;
      IF NEW.match_number = 103 AND pred_w = real_w THEN bonus := 5;  END IF;

      UPDATE public.predictions
      SET points_earned = base + bonus,
          calculated_at = now()
      WHERE id = pred.id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
