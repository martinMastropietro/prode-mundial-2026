-- Eliminar access_code — solo se usa password para unirse
ALTER TABLE public.groups DROP COLUMN IF EXISTS access_code;
