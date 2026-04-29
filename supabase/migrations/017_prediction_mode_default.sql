-- La modalidad clásica/default para nuevos grupos es fase por fase.
ALTER TABLE public.groups
ALTER COLUMN prediction_mode SET DEFAULT 'phase_by_phase';
