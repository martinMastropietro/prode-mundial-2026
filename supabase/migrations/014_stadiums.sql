-- Estadios oficiales FIFA World Cup 2026
-- Fuente: FIFA / CONCACAF
UPDATE public.matches
SET stadium = CASE city
  -- México
  WHEN 'Ciudad de México' THEN 'Estadio Azteca'
  WHEN 'Guadalajara'      THEN 'Estadio Akron'
  WHEN 'Monterrey'        THEN 'Estadio BBVA'
  -- USA
  WHEN 'Los Ángeles'      THEN 'SoFi Stadium'
  WHEN 'Nueva York'       THEN 'MetLife Stadium'
  WHEN 'Dallas'           THEN 'AT&T Stadium'
  WHEN 'San Francisco'    THEN 'Levi''s Stadium'
  WHEN 'Seattle'          THEN 'Lumen Field'
  WHEN 'Boston'           THEN 'Gillette Stadium'
  WHEN 'Philadelphia'     THEN 'Lincoln Financial Field'
  WHEN 'Atlanta'          THEN 'Mercedes-Benz Stadium'
  WHEN 'Houston'          THEN 'NRG Stadium'
  WHEN 'Kansas City'      THEN 'Arrowhead Stadium'
  WHEN 'Miami'            THEN 'Hard Rock Stadium'
  -- Canadá
  WHEN 'Vancouver'        THEN 'BC Place'
  WHEN 'Toronto'          THEN 'BMO Field'
  ELSE stadium
END
WHERE city IS NOT NULL;
