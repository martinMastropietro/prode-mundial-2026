-- Bonus de puntos para Final y 3° puesto
-- Final (match 104): +15 pts al campeón correcto, +10 al subcampeón correcto
-- 3° puesto (match 103): +5 pts al que predice el ganador correcto
-- Estos bonos se suman al points_earned del partido correspondiente

CREATE OR REPLACE FUNCTION public.calculate_prediction_points(
  pred_home int, pred_away int,
  real_home int, real_away int,
  pred_pen text DEFAULT NULL,
  real_pen text DEFAULT NULL
) RETURNS int AS $$
DECLARE
  pred_winner text;
  real_winner text;
BEGIN
  -- Determinar ganador predicho (considerando penales)
  IF pred_home > pred_away THEN pred_winner := 'home';
  ELSIF pred_home < pred_away THEN pred_winner := 'away';
  ELSIF pred_pen IS NOT NULL THEN pred_winner := pred_pen;
  ELSE pred_winner := 'draw'; END IF;

  -- Determinar ganador real
  IF real_home > real_away THEN real_winner := 'home';
  ELSIF real_home < real_away THEN real_winner := 'away';
  ELSIF real_pen IS NOT NULL THEN real_winner := real_pen;
  ELSE real_winner := 'draw'; END IF;

  -- Marcador exacto (incluyendo penales correctos)
  IF pred_home = real_home AND pred_away = real_away
     AND (pred_pen IS NULL OR pred_pen = real_pen)
  THEN RETURN 5;
  -- Resultado correcto (ganador)
  ELSIF pred_winner = real_winner THEN RETURN 3;
  ELSE RETURN 0; END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger actualizado con bonos para Final y 3° puesto
CREATE OR REPLACE FUNCTION public.update_prediction_points_on_finish()
RETURNS trigger AS $$
DECLARE
  bonus int := 0;
  pred RECORD;
  real_winner text;
BEGIN
  IF NEW.status = 'finished' AND OLD.status != 'finished'
    AND NEW.home_score_full IS NOT NULL AND NEW.away_score_full IS NOT NULL
  THEN
    -- Determinar ganador real del partido
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

        -- Determinar ganador predicho
        IF pred.predicted_home_score > pred.predicted_away_score THEN pred_winner := 'home';
        ELSIF pred.predicted_home_score < pred.predicted_away_score THEN pred_winner := 'away';
        ELSIF pred.predicted_penalty_winner IS NOT NULL THEN pred_winner := pred.predicted_penalty_winner;
        ELSE pred_winner := 'draw'; END IF;

        -- Bonus Final (match 104): +15 campeón + +10 subcampeón = +25 si adivinaste el ganador
        IF NEW.match_number = 104 AND pred_winner = real_winner THEN
          extra_bonus := 25; -- 15 (campeón) + 10 (subcampeón implícito)
        END IF;

        -- Bonus 3° puesto (match 103): +5 si adivinaste el ganador
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
