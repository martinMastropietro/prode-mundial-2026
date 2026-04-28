-- Agregar ganador en penales a predictions (para partidos de eliminatorias)
ALTER TABLE public.predictions
  ADD COLUMN IF NOT EXISTS predicted_penalty_winner text
    CHECK (predicted_penalty_winner IN ('home','away'));
