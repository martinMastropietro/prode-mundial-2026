-- Recalcular puntos si se edita el resultado oficial de un partido ya terminado.
-- Esto permite probar/corregir resultados desde /admin o directamente desde la DB.

CREATE OR REPLACE FUNCTION public.update_prediction_points_on_finish()
RETURNS trigger AS $$
DECLARE
  pred RECORD;
  real_winner text;
BEGIN
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
      BEGIN
        base_pts := public.calculate_prediction_points(
          pred.predicted_home_score, pred.predicted_away_score,
          NEW.home_score_full, NEW.away_score_full,
          pred.predicted_penalty_winner, NEW.penalty_winner
        );

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
