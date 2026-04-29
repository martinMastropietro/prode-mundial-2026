-- Recalcular puntos de TODAS las predicciones de partidos finalizados.
-- Ejecutar cuando el admin quiera sincronizar puntos después de cargar/editar resultados.

DO $$
DECLARE
  pred   RECORD;
  m      RECORD;
  base   int;
  bonus  int;
  pred_w text;
  real_w text;
BEGIN
  FOR pred IN
    SELECT
      p.id,
      p.predicted_home_score,
      p.predicted_away_score,
      p.predicted_penalty_winner,
      p.match_id
    FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
    WHERE m.status = 'finished'
      AND m.home_score_full IS NOT NULL
      AND m.away_score_full IS NOT NULL
  LOOP
    SELECT * INTO m FROM public.matches WHERE id = pred.match_id;

    -- Puntos base usando la función actualizada (6 parámetros)
    base := public.calculate_prediction_points(
      pred.predicted_home_score,
      pred.predicted_away_score,
      m.home_score_full,
      m.away_score_full,
      pred.predicted_penalty_winner,
      m.penalty_winner
    );

    -- Determinar ganador predicho
    IF    pred.predicted_home_score > pred.predicted_away_score THEN pred_w := 'home';
    ELSIF pred.predicted_home_score < pred.predicted_away_score THEN pred_w := 'away';
    ELSIF pred.predicted_penalty_winner IS NOT NULL              THEN pred_w := pred.predicted_penalty_winner;
    ELSE  pred_w := 'draw'; END IF;

    -- Determinar ganador real
    IF    m.home_score_full > m.away_score_full THEN real_w := 'home';
    ELSIF m.home_score_full < m.away_score_full THEN real_w := 'away';
    ELSIF m.penalty_winner IS NOT NULL           THEN real_w := m.penalty_winner;
    ELSE  real_w := 'draw'; END IF;

    -- Bonus Final y 3° puesto
    bonus := 0;
    IF m.match_number = 104 AND pred_w = real_w THEN bonus := 25; END IF;  -- Campeón+Subcampeón
    IF m.match_number = 103 AND pred_w = real_w THEN bonus := 5;  END IF;  -- 3° Puesto

    UPDATE public.predictions
    SET points_earned = base + bonus,
        calculated_at = now()
    WHERE id = pred.id;

  END LOOP;

  RAISE NOTICE 'Puntos recalculados correctamente.';
END $$;
