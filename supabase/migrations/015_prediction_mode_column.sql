-- Agregar columna prediction_mode a groups si no existe
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS prediction_mode text DEFAULT 'phase_by_phase' NOT NULL;
