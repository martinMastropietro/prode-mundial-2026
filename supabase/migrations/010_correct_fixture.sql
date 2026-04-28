-- =============================================
-- FIXTURE OFICIAL FIFA WORLD CUP 2026
-- Grupos, partidos y bracket correctos
-- Horarios en UTC (fuente: fixture ARG = UTC-3)
-- =============================================

-- Limpiar todo en orden de FK
TRUNCATE public.predictions CASCADE;
TRUNCATE public.special_predictions CASCADE;
TRUNCATE public.matches CASCADE;
TRUNCATE public.teams CASCADE;

-- =============================================
-- 48 EQUIPOS CORRECTOS
-- =============================================
INSERT INTO public.teams (name, code, flag_emoji, group_code, confederation) VALUES
-- GRUPO A
('México',           'MEX','🇲🇽','A','CONCACAF'),
('Sudáfrica',        'RSA','🇿🇦','A','CAF'),
('Corea del Sur',    'KOR','🇰🇷','A','AFC'),
('República Checa',  'CZE','🇨🇿','A','UEFA'),
-- GRUPO B
('Canadá',           'CAN','🇨🇦','B','CONCACAF'),
('Bosnia y Herz.',   'BIH','🇧🇦','B','UEFA'),
('Qatar',            'QAT','🇶🇦','B','AFC'),
('Suiza',            'SUI','🇨🇭','B','UEFA'),
-- GRUPO C
('Brasil',           'BRA','🇧🇷','C','CONMEBOL'),
('Marruecos',        'MAR','🇲🇦','C','CAF'),
('Haití',            'HAI','🇭🇹','C','CONCACAF'),
('Escocia',          'SCO','🏴󠁧󠁢󠁳󠁣󠁴󠁿','C','UEFA'),
-- GRUPO D
('Estados Unidos',   'USA','🇺🇸','D','CONCACAF'),
('Paraguay',         'PAR','🇵🇾','D','CONMEBOL'),
('Australia',        'AUS','🇦🇺','D','AFC'),
('Turquía',          'TUR','🇹🇷','D','UEFA'),
-- GRUPO E
('Alemania',         'GER','🇩🇪','E','UEFA'),
('Curazao',          'CUW','🇨🇼','E','CONCACAF'),
('Costa de Marfil',  'CIV','🇨🇮','E','CAF'),
('Ecuador',          'ECU','🇪🇨','E','CONMEBOL'),
-- GRUPO F
('Países Bajos',     'NED','🇳🇱','F','UEFA'),
('Japón',            'JPN','🇯🇵','F','AFC'),
('Suecia',           'SWE','🇸🇪','F','UEFA'),
('Túnez',            'TUN','🇹🇳','F','CAF'),
-- GRUPO G
('Bélgica',          'BEL','🇧🇪','G','UEFA'),
('Egipto',           'EGY','🇪🇬','G','CAF'),
('Irán',             'IRN','🇮🇷','G','AFC'),
('Nueva Zelanda',    'NZL','🇳🇿','G','OFC'),
-- GRUPO H
('España',           'ESP','🇪🇸','H','UEFA'),
('Cabo Verde',       'CPV','🇨🇻','H','CAF'),
('Arabia Saudita',   'KSA','🇸🇦','H','AFC'),
('Uruguay',          'URU','🇺🇾','H','CONMEBOL'),
-- GRUPO I
('Francia',          'FRA','🇫🇷','I','UEFA'),
('Senegal',          'SEN','🇸🇳','I','CAF'),
('Iraq',             'IRQ','🇮🇶','I','AFC'),
('Noruega',          'NOR','🇳🇴','I','UEFA'),
-- GRUPO J
('Austria',          'AUT','🇦🇹','J','UEFA'),
('Jordania',         'JOR','🇯🇴','J','AFC'),
('Argentina',        'ARG','🇦🇷','J','CONMEBOL'),
('Argelia',          'ALG','🇩🇿','J','CAF'),
-- GRUPO K
('Portugal',         'POR','🇵🇹','K','UEFA'),
('Rep. D. Congo',    'COD','🇨🇩','K','CAF'),
('Uzbekistán',       'UZB','🇺🇿','K','AFC'),
('Colombia',         'COL','🇨🇴','K','CONMEBOL'),
-- GRUPO L
('Inglaterra',       'ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','L','UEFA'),
('Croacia',          'CRO','🇭🇷','L','UEFA'),
('Ghana',            'GHA','🇬🇭','L','CAF'),
('Panamá',           'PAN','🇵🇦','L','CONCACAF');

-- =============================================
-- PARTIDOS — FASE DE GRUPOS
-- Horarios en UTC (ARG = UTC-3)
-- =============================================
DO $$
DECLARE
  mex uuid; rsa uuid; kor uuid; cze uuid;
  can uuid; bih uuid; qat uuid; sui uuid;
  bra uuid; mar uuid; hai uuid; sco uuid;
  usa uuid; par uuid; aus uuid; tur uuid;
  ger uuid; cuw uuid; civ uuid; ecu uuid;
  ned uuid; jpn uuid; swe uuid; tun uuid;
  bel uuid; egy uuid; irn uuid; nzl uuid;
  esp uuid; cpv uuid; ksa uuid; uru uuid;
  fra uuid; sen uuid; irq uuid; nor uuid;
  aut uuid; jor uuid; arg uuid; alg uuid;
  por uuid; cod uuid; uzb uuid; col uuid;
  eng uuid; cro uuid; gha uuid; pan uuid;
BEGIN
  SELECT id INTO mex FROM public.teams WHERE code='MEX';
  SELECT id INTO rsa FROM public.teams WHERE code='RSA';
  SELECT id INTO kor FROM public.teams WHERE code='KOR';
  SELECT id INTO cze FROM public.teams WHERE code='CZE';
  SELECT id INTO can FROM public.teams WHERE code='CAN';
  SELECT id INTO bih FROM public.teams WHERE code='BIH';
  SELECT id INTO qat FROM public.teams WHERE code='QAT';
  SELECT id INTO sui FROM public.teams WHERE code='SUI';
  SELECT id INTO bra FROM public.teams WHERE code='BRA';
  SELECT id INTO mar FROM public.teams WHERE code='MAR';
  SELECT id INTO hai FROM public.teams WHERE code='HAI';
  SELECT id INTO sco FROM public.teams WHERE code='SCO';
  SELECT id INTO usa FROM public.teams WHERE code='USA';
  SELECT id INTO par FROM public.teams WHERE code='PAR';
  SELECT id INTO aus FROM public.teams WHERE code='AUS';
  SELECT id INTO tur FROM public.teams WHERE code='TUR';
  SELECT id INTO ger FROM public.teams WHERE code='GER';
  SELECT id INTO cuw FROM public.teams WHERE code='CUW';
  SELECT id INTO civ FROM public.teams WHERE code='CIV';
  SELECT id INTO ecu FROM public.teams WHERE code='ECU';
  SELECT id INTO ned FROM public.teams WHERE code='NED';
  SELECT id INTO jpn FROM public.teams WHERE code='JPN';
  SELECT id INTO swe FROM public.teams WHERE code='SWE';
  SELECT id INTO tun FROM public.teams WHERE code='TUN';
  SELECT id INTO bel FROM public.teams WHERE code='BEL';
  SELECT id INTO egy FROM public.teams WHERE code='EGY';
  SELECT id INTO irn FROM public.teams WHERE code='IRN';
  SELECT id INTO nzl FROM public.teams WHERE code='NZL';
  SELECT id INTO esp FROM public.teams WHERE code='ESP';
  SELECT id INTO cpv FROM public.teams WHERE code='CPV';
  SELECT id INTO ksa FROM public.teams WHERE code='KSA';
  SELECT id INTO uru FROM public.teams WHERE code='URU';
  SELECT id INTO fra FROM public.teams WHERE code='FRA';
  SELECT id INTO sen FROM public.teams WHERE code='SEN';
  SELECT id INTO irq FROM public.teams WHERE code='IRQ';
  SELECT id INTO nor FROM public.teams WHERE code='NOR';
  SELECT id INTO aut FROM public.teams WHERE code='AUT';
  SELECT id INTO jor FROM public.teams WHERE code='JOR';
  SELECT id INTO arg FROM public.teams WHERE code='ARG';
  SELECT id INTO alg FROM public.teams WHERE code='ALG';
  SELECT id INTO por FROM public.teams WHERE code='POR';
  SELECT id INTO cod FROM public.teams WHERE code='COD';
  SELECT id INTO uzb FROM public.teams WHERE code='UZB';
  SELECT id INTO col FROM public.teams WHERE code='COL';
  SELECT id INTO eng FROM public.teams WHERE code='ENG';
  SELECT id INTO cro FROM public.teams WHERE code='CRO';
  SELECT id INTO gha FROM public.teams WHERE code='GHA';
  SELECT id INTO pan FROM public.teams WHERE code='PAN';

  INSERT INTO public.matches
    (match_number, phase, group_code, home_team_id, away_team_id, match_date, city)
  VALUES
  -- GRUPO A
  (1,  'group','A', mex, rsa, '2026-06-11 19:00:00+00','Ciudad de México'),
  (2,  'group','A', kor, cze, '2026-06-12 02:00:00+00','Guadalajara'),
  (3,  'group','A', cze, rsa, '2026-06-18 16:00:00+00','Atlanta'),
  (4,  'group','A', mex, kor, '2026-06-19 01:00:00+00','Guadalajara'),
  (5,  'group','A', cze, mex, '2026-06-25 01:00:00+00','Ciudad de México'),
  (6,  'group','A', rsa, kor, '2026-06-25 01:00:00+00','Monterrey'),
  -- GRUPO B
  (7,  'group','B', can, bih, '2026-06-12 19:00:00+00','Toronto'),
  (8,  'group','B', qat, sui, '2026-06-13 19:00:00+00','San Francisco'),
  (9,  'group','B', sui, bih, '2026-06-18 19:00:00+00','Los Ángeles'),
  (10, 'group','B', can, qat, '2026-06-18 22:00:00+00','Vancouver'),
  (11, 'group','B', sui, can, '2026-06-24 19:00:00+00','Vancouver'),
  (12, 'group','B', bih, qat, '2026-06-24 19:00:00+00','Seattle'),
  -- GRUPO C
  (13, 'group','C', bra, mar, '2026-06-13 22:00:00+00','Nueva York'),
  (14, 'group','C', hai, sco, '2026-06-14 01:00:00+00','Boston'),
  (15, 'group','C', sco, mar, '2026-06-19 22:00:00+00','Boston'),
  (16, 'group','C', bra, hai, '2026-06-20 01:00:00+00','Philadelphia'),
  (17, 'group','C', sco, bra, '2026-06-24 22:00:00+00','Miami'),
  (18, 'group','C', mar, hai, '2026-06-24 22:00:00+00','Atlanta'),
  -- GRUPO D
  (19, 'group','D', usa, par, '2026-06-13 01:00:00+00','Los Ángeles'),
  (20, 'group','D', aus, tur, '2026-06-13 04:00:00+00','Vancouver'),
  (21, 'group','D', tur, par, '2026-06-19 04:00:00+00','San Francisco'),
  (22, 'group','D', usa, aus, '2026-06-19 19:00:00+00','Seattle'),
  (23, 'group','D', tur, usa, '2026-06-26 02:00:00+00','Los Ángeles'),
  (24, 'group','D', par, aus, '2026-06-26 02:00:00+00','San Francisco'),
  -- GRUPO E
  (25, 'group','E', ger, cuw, '2026-06-14 17:00:00+00','Houston'),
  (26, 'group','E', civ, ecu, '2026-06-14 23:00:00+00','Philadelphia'),
  (27, 'group','E', ger, civ, '2026-06-20 20:00:00+00','Toronto'),
  (28, 'group','E', cuw, ecu, '2026-06-21 00:00:00+00','Kansas City'),
  (29, 'group','E', ecu, ger, '2026-06-25 20:00:00+00','Nueva York'),
  (30, 'group','E', cuw, civ, '2026-06-25 20:00:00+00','Philadelphia'),
  -- GRUPO F
  (31, 'group','F', ned, jpn, '2026-06-14 20:00:00+00','Dallas'),
  (32, 'group','F', swe, tun, '2026-06-15 02:00:00+00','Monterrey'),
  (33, 'group','F', jpn, tun, '2026-06-20 04:00:00+00','Monterrey'),
  (34, 'group','F', ned, swe, '2026-06-20 17:00:00+00','Houston'),
  (35, 'group','F', tun, ned, '2026-06-25 23:00:00+00','Dallas'),
  (36, 'group','F', jpn, swe, '2026-06-25 23:00:00+00','Kansas City'),
  -- GRUPO G
  (37, 'group','G', bel, egy, '2026-06-15 19:00:00+00','Seattle'),
  (38, 'group','G', irn, nzl, '2026-06-16 01:00:00+00','Los Ángeles'),
  (39, 'group','G', bel, irn, '2026-06-21 19:00:00+00','Los Ángeles'),
  (40, 'group','G', egy, nzl, '2026-06-22 01:00:00+00','Vancouver'),
  (41, 'group','G', nzl, bel, '2026-06-27 03:00:00+00','Vancouver'),
  (42, 'group','G', egy, irn, '2026-06-27 03:00:00+00','Seattle'),
  -- GRUPO H
  (43, 'group','H', esp, cpv, '2026-06-15 16:00:00+00','Atlanta'),
  (44, 'group','H', ksa, uru, '2026-06-15 22:00:00+00','Miami'),
  (45, 'group','H', esp, ksa, '2026-06-21 16:00:00+00','Atlanta'),
  (46, 'group','H', cpv, uru, '2026-06-21 22:00:00+00','Miami'),
  (47, 'group','H', uru, esp, '2026-06-27 00:00:00+00','Guadalajara'),
  (48, 'group','H', cpv, ksa, '2026-06-27 00:00:00+00','Houston'),
  -- GRUPO I
  (49, 'group','I', fra, sen, '2026-06-16 19:00:00+00','Nueva York'),
  (50, 'group','I', irq, nor, '2026-06-16 22:00:00+00','Boston'),
  (51, 'group','I', fra, irq, '2026-06-22 21:00:00+00','Philadelphia'),
  (52, 'group','I', nor, sen, '2026-06-23 00:00:00+00','Nueva York'),
  (53, 'group','I', nor, fra, '2026-06-26 19:00:00+00','Boston'),
  (54, 'group','I', sen, irq, '2026-06-26 19:00:00+00','Toronto'),
  -- GRUPO J
  (55, 'group','J', aut, jor, '2026-06-16 04:00:00+00','San Francisco'),
  (56, 'group','J', arg, alg, '2026-06-17 01:00:00+00','Kansas City'),
  (57, 'group','J', arg, aut, '2026-06-22 17:00:00+00','Dallas'),
  (58, 'group','J', jor, alg, '2026-06-23 03:00:00+00','San Francisco'),
  (59, 'group','J', jor, arg, '2026-06-28 02:00:00+00','Dallas'),
  (60, 'group','J', alg, aut, '2026-06-28 02:00:00+00','Kansas City'),
  -- GRUPO K
  (61, 'group','K', por, cod, '2026-06-17 17:00:00+00','Houston'),
  (62, 'group','K', uzb, col, '2026-06-18 02:00:00+00','Ciudad de México'),
  (63, 'group','K', por, uzb, '2026-06-23 17:00:00+00','Houston'),
  (64, 'group','K', cod, col, '2026-06-24 02:00:00+00','Guadalajara'),
  (65, 'group','K', col, por, '2026-06-27 23:30:00+00','Miami'),
  (66, 'group','K', cod, uzb, '2026-06-27 23:30:00+00','Atlanta'),
  -- GRUPO L
  (67, 'group','L', eng, cro, '2026-06-17 20:00:00+00','Dallas'),
  (68, 'group','L', gha, pan, '2026-06-17 23:00:00+00','Toronto'),
  (69, 'group','L', eng, gha, '2026-06-23 20:00:00+00','Boston'),
  (70, 'group','L', cro, pan, '2026-06-23 23:00:00+00','Toronto'),
  (71, 'group','L', pan, eng, '2026-06-27 21:00:00+00','Nueva York'),
  (72, 'group','L', cro, gha, '2026-06-27 21:00:00+00','Philadelphia');

  -- =============================================
  -- RONDA DE 32 (matches 73-88)
  -- Fuente: fixture oficial FIFA 2026
  -- Los equipos clasificados se llenarán según resultados
  -- =============================================
  INSERT INTO public.matches (match_number, phase, match_date, city) VALUES
  -- Domingo 28/06
  (73, 'round_of_32', '2026-06-28 19:00:00+00', 'Los Ángeles'),   -- 2°A vs 2°B
  -- Lunes 29/06
  (74, 'round_of_32', '2026-06-29 20:30:00+00', 'Boston'),         -- 1°E vs 3°(A/B/C/D/F)
  (75, 'round_of_32', '2026-06-30 01:00:00+00', 'Monterrey'),      -- 1°F vs 2°C
  (76, 'round_of_32', '2026-06-29 17:00:00+00', 'Houston'),        -- 1°C vs 2°F
  -- Martes 30/06
  (77, 'round_of_32', '2026-06-30 21:00:00+00', 'Nueva York'),     -- 1°I vs 3°(C/D/F/G/H)
  (78, 'round_of_32', '2026-06-30 17:00:00+00', 'Dallas'),         -- 2°E vs 2°I
  (79, 'round_of_32', '2026-07-01 01:00:00+00', 'Ciudad de México'),-- 1°A vs 3°(C/E/F/H/I)
  -- Miércoles 01/07
  (80, 'round_of_32', '2026-07-01 16:00:00+00', 'Atlanta'),        -- 1°L vs 3°(E/H/I/J/K)
  (81, 'round_of_32', '2026-07-02 00:00:00+00', 'San Francisco'),  -- 1°D vs 3°(B/E/F/I/J)
  (82, 'round_of_32', '2026-07-01 20:00:00+00', 'Seattle'),        -- 1°G vs 3°(A/E/H/I/J)
  -- Jueves 02/07
  (83, 'round_of_32', '2026-07-02 23:00:00+00', 'Toronto'),        -- 2°K vs 2°L
  (84, 'round_of_32', '2026-07-02 19:00:00+00', 'Los Ángeles'),    -- 1°H vs 2°J
  (87, 'round_of_32', '2026-07-03 01:30:00+00', 'Kansas City'),    -- 1°K vs 3°(D/E/I/J/L)
  -- Viernes 03/07
  (85, 'round_of_32', '2026-07-03 03:00:00+00', 'Vancouver'),      -- 1°B vs 3°(E/F/G/I/J)
  (88, 'round_of_32', '2026-07-03 19:00:00+00', 'Dallas'),         -- 2°D vs 2°G
  (86, 'round_of_32', '2026-07-03 22:00:00+00', 'Miami');          -- 1°J vs 2°H

  -- OCTAVOS (89-96)
  INSERT INTO public.matches (match_number, phase, match_date, city) VALUES
  (90, 'round_of_16', '2026-07-04 17:00:00+00', 'Houston'),        -- W73 vs W75
  (89, 'round_of_16', '2026-07-04 21:00:00+00', 'Philadelphia'),   -- W74 vs W77
  (91, 'round_of_16', '2026-07-05 20:00:00+00', 'Nueva York'),     -- W76 vs W78
  (92, 'round_of_16', '2026-07-06 00:00:00+00', 'Ciudad de México'),-- W79 vs W80
  (93, 'round_of_16', '2026-07-06 19:00:00+00', 'Dallas'),         -- W83 vs W84
  (94, 'round_of_16', '2026-07-07 00:00:00+00', 'Seattle'),        -- W81 vs W82
  (95, 'round_of_16', '2026-07-07 16:00:00+00', 'Atlanta'),        -- W86 vs W88
  (96, 'round_of_16', '2026-07-07 19:00:00+00', 'Vancouver');      -- W85 vs W87

  -- CUARTOS (97-100)
  INSERT INTO public.matches (match_number, phase, match_date, city) VALUES
  (97,  'quarterfinal', '2026-07-09 20:00:00+00', 'Boston'),       -- W89 vs W90
  (98,  'quarterfinal', '2026-07-10 19:00:00+00', 'Los Ángeles'),  -- W93 vs W94
  (99,  'quarterfinal', '2026-07-11 21:00:00+00', 'Miami'),        -- W91 vs W92
  (100, 'quarterfinal', '2026-07-12 01:00:00+00', 'Kansas City');  -- W95 vs W96

  -- SEMIS (101-102)
  INSERT INTO public.matches (match_number, phase, match_date, city) VALUES
  (101, 'semifinal', '2026-07-14 19:00:00+00', 'Dallas'),          -- W97 vs W98
  (102, 'semifinal', '2026-07-15 23:00:00+00', 'Atlanta');         -- W99 vs W100

  -- 3° PUESTO y FINAL
  INSERT INTO public.matches (match_number, phase, match_date, city) VALUES
  (103, 'third_place', '2026-07-18 21:00:00+00', 'Miami'),         -- L101 vs L102
  (104, 'final',       '2026-07-19 19:00:00+00', 'Nueva York');    -- W101 vs W102

END $$;
