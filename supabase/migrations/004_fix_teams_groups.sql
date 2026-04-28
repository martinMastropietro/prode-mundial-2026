-- =============================================
-- Corrección grupos FIFA 2026 (sorteo 5 dic 2024)
-- Ejecutar en Supabase SQL Editor si ya tenés datos
-- =============================================

-- Limpiar en orden por FKs
TRUNCATE public.predictions CASCADE;
TRUNCATE public.special_predictions CASCADE;
TRUNCATE public.matches CASCADE;
TRUNCATE public.teams CASCADE;

INSERT INTO public.teams (name, code, flag_emoji, group_code, confederation) VALUES
('México',           'MEX', '🇲🇽', 'A', 'CONCACAF'),
('Sudáfrica',        'RSA', '🇿🇦', 'A', 'CAF'),
('Corea del Sur',    'KOR', '🇰🇷', 'A', 'AFC'),
('República Checa',  'CZE', '🇨🇿', 'A', 'UEFA'),
('Canadá',           'CAN', '🇨🇦', 'B', 'CONCACAF'),
('Bosnia y Herz.',   'BIH', '🇧🇦', 'B', 'UEFA'),
('Qatar',            'QAT', '🇶🇦', 'B', 'AFC'),
('Suiza',            'SUI', '🇨🇭', 'B', 'UEFA'),
('Brasil',           'BRA', '🇧🇷', 'C', 'CONMEBOL'),
('Marruecos',        'MAR', '🇲🇦', 'C', 'CAF'),
('Haití',            'HAI', '🇭🇹', 'C', 'CONCACAF'),
('Escocia',          'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'C', 'UEFA'),
('Estados Unidos',   'USA', '🇺🇸', 'D', 'CONCACAF'),
('Paraguay',         'PAR', '🇵🇾', 'D', 'CONMEBOL'),
('Australia',        'AUS', '🇦🇺', 'D', 'AFC'),
('Turquía',          'TUR', '🇹🇷', 'D', 'UEFA'),
('Alemania',         'GER', '🇩🇪', 'E', 'UEFA'),
('Curazao',          'CUW', '🇨🇼', 'E', 'CONCACAF'),
('Costa de Marfil',  'CIV', '🇨🇮', 'E', 'CAF'),
('Ecuador',          'ECU', '🇪🇨', 'E', 'CONMEBOL'),
('Países Bajos',     'NED', '🇳🇱', 'F', 'UEFA'),
('Japón',            'JPN', '🇯🇵', 'F', 'AFC'),
('Suecia',           'SWE', '🇸🇪', 'F', 'UEFA'),
('Túnez',            'TUN', '🇹🇳', 'F', 'CAF'),
('España',           'ESP', '🇪🇸', 'G', 'UEFA'),
('Argelia',          'ALG', '🇩🇿', 'G', 'CAF'),
('Nigeria',          'NGA', '🇳🇬', 'G', 'CAF'),
('Croacia',          'CRO', '🇭🇷', 'G', 'UEFA'),
('Argentina',        'ARG', '🇦🇷', 'H', 'CONMEBOL'),
('Chile',            'CHI', '🇨🇱', 'H', 'CONMEBOL'),
('Iraq',             'IRQ', '🇮🇶', 'H', 'AFC'),
('Ucrania',          'UKR', '🇺🇦', 'H', 'UEFA'),
('Francia',          'FRA', '🇫🇷', 'I', 'UEFA'),
('Arabia Saudita',   'KSA', '🇸🇦', 'I', 'AFC'),
('Camerún',          'CMR', '🇨🇲', 'I', 'CAF'),
('Costa Rica',       'CRC', '🇨🇷', 'I', 'CONCACAF'),
('Inglaterra',       'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'J', 'UEFA'),
('Irán',             'IRN', '🇮🇷', 'J', 'AFC'),
('Venezuela',        'VEN', '🇻🇪', 'J', 'CONMEBOL'),
('Senegal',          'SEN', '🇸🇳', 'J', 'CAF'),
('Portugal',         'POR', '🇵🇹', 'K', 'UEFA'),
('Bélgica',          'BEL', '🇧🇪', 'K', 'UEFA'),
('Colombia',         'COL', '🇨🇴', 'K', 'CONMEBOL'),
('Uruguay',          'URU', '🇺🇾', 'K', 'CONMEBOL'),
('Serbia',           'SRB', '🇷🇸', 'L', 'UEFA'),
('Honduras',         'HON', '🇭🇳', 'L', 'CONCACAF'),
('Uzbekistán',       'UZB', '🇺🇿', 'L', 'AFC'),
('Ghana',            'GHA', '🇬🇭', 'L', 'CAF');

-- =============================================
-- Re-insertar partidos (fase de grupos)
-- =============================================
DO $$
DECLARE
  mex uuid; rsa uuid; kor uuid; cze uuid;
  can uuid; bih uuid; qat uuid; sui uuid;
  bra uuid; mar uuid; hai uuid; sco uuid;
  usa uuid; par uuid; aus uuid; tur uuid;
  ger uuid; cuw uuid; civ uuid; ecu uuid;
  ned uuid; jpn uuid; swe uuid; tun uuid;
  esp uuid; alg uuid; nga uuid; cro uuid;
  arg uuid; chi uuid; irq uuid; ukr uuid;
  fra uuid; ksa uuid; cmr uuid; crc uuid;
  eng uuid; irn uuid; ven uuid; sen uuid;
  por uuid; bel uuid; col uuid; uru uuid;
  srb uuid; hon uuid; uzb uuid; gha uuid;
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
  SELECT id INTO esp FROM public.teams WHERE code='ESP';
  SELECT id INTO alg FROM public.teams WHERE code='ALG';
  SELECT id INTO nga FROM public.teams WHERE code='NGA';
  SELECT id INTO cro FROM public.teams WHERE code='CRO';
  SELECT id INTO arg FROM public.teams WHERE code='ARG';
  SELECT id INTO chi FROM public.teams WHERE code='CHI';
  SELECT id INTO irq FROM public.teams WHERE code='IRQ';
  SELECT id INTO ukr FROM public.teams WHERE code='UKR';
  SELECT id INTO fra FROM public.teams WHERE code='FRA';
  SELECT id INTO ksa FROM public.teams WHERE code='KSA';
  SELECT id INTO cmr FROM public.teams WHERE code='CMR';
  SELECT id INTO crc FROM public.teams WHERE code='CRC';
  SELECT id INTO eng FROM public.teams WHERE code='ENG';
  SELECT id INTO irn FROM public.teams WHERE code='IRN';
  SELECT id INTO ven FROM public.teams WHERE code='VEN';
  SELECT id INTO sen FROM public.teams WHERE code='SEN';
  SELECT id INTO por FROM public.teams WHERE code='POR';
  SELECT id INTO bel FROM public.teams WHERE code='BEL';
  SELECT id INTO col FROM public.teams WHERE code='COL';
  SELECT id INTO uru FROM public.teams WHERE code='URU';
  SELECT id INTO srb FROM public.teams WHERE code='SRB';
  SELECT id INTO hon FROM public.teams WHERE code='HON';
  SELECT id INTO uzb FROM public.teams WHERE code='UZB';
  SELECT id INTO gha FROM public.teams WHERE code='GHA';

  INSERT INTO public.matches (match_number, phase, group_code, home_team_id, away_team_id, match_date, city) VALUES
  -- GRUPO A
  (1,  'group','A', mex, rsa, '2026-06-11 21:00:00+00', 'Ciudad de México'),
  (2,  'group','A', kor, cze, '2026-06-12 00:00:00+00', 'Guadalajara'),
  (3,  'group','A', mex, kor, '2026-06-16 21:00:00+00', 'Monterrey'),
  (4,  'group','A', cze, rsa, '2026-06-16 18:00:00+00', 'Ciudad de México'),
  (5,  'group','A', mex, cze, '2026-06-21 00:00:00+00', 'Guadalajara'),
  (6,  'group','A', rsa, kor, '2026-06-21 00:00:00+00', 'Monterrey'),
  -- GRUPO B
  (7,  'group','B', can, bih, '2026-06-12 23:00:00+00', 'Toronto'),
  (8,  'group','B', qat, sui, '2026-06-13 02:00:00+00', 'Vancouver'),
  (9,  'group','B', can, qat, '2026-06-17 23:00:00+00', 'Vancouver'),
  (10, 'group','B', sui, bih, '2026-06-18 02:00:00+00', 'Toronto'),
  (11, 'group','B', can, sui, '2026-06-22 23:00:00+00', 'Toronto'),
  (12, 'group','B', bih, qat, '2026-06-22 23:00:00+00', 'Vancouver'),
  -- GRUPO C
  (13, 'group','C', bra, mar, '2026-06-13 00:00:00+00', 'Los Ángeles'),
  (14, 'group','C', hai, sco, '2026-06-13 23:00:00+00', 'Seattle'),
  (15, 'group','C', bra, hai, '2026-06-17 22:00:00+00', 'San Francisco'),
  (16, 'group','C', sco, mar, '2026-06-18 01:00:00+00', 'Los Ángeles'),
  (17, 'group','C', bra, sco, '2026-06-22 02:00:00+00', 'Seattle'),
  (18, 'group','C', mar, hai, '2026-06-22 02:00:00+00', 'San Francisco'),
  -- GRUPO D
  (19, 'group','D', usa, par, '2026-06-14 00:00:00+00', 'Nueva York'),
  (20, 'group','D', aus, tur, '2026-06-14 23:00:00+00', 'Filadelfia'),
  (21, 'group','D', usa, aus, '2026-06-18 22:00:00+00', 'Boston'),
  (22, 'group','D', tur, par, '2026-06-19 01:00:00+00', 'Nueva York'),
  (23, 'group','D', usa, tur, '2026-06-23 02:00:00+00', 'Filadelfia'),
  (24, 'group','D', par, aus, '2026-06-23 02:00:00+00', 'Boston'),
  -- GRUPO E
  (25, 'group','E', ger, cuw, '2026-06-14 22:00:00+00', 'Dallas'),
  (26, 'group','E', civ, ecu, '2026-06-15 01:00:00+00', 'Houston'),
  (27, 'group','E', ger, civ, '2026-06-19 22:00:00+00', 'Atlanta'),
  (28, 'group','E', ecu, cuw, '2026-06-20 01:00:00+00', 'Dallas'),
  (29, 'group','E', ger, ecu, '2026-06-24 02:00:00+00', 'Houston'),
  (30, 'group','E', cuw, civ, '2026-06-24 02:00:00+00', 'Atlanta'),
  -- GRUPO F
  (31, 'group','F', ned, jpn, '2026-06-15 00:00:00+00', 'Miami'),
  (32, 'group','F', swe, tun, '2026-06-15 23:00:00+00', 'Kansas City'),
  (33, 'group','F', ned, swe, '2026-06-20 00:00:00+00', 'Miami'),
  (34, 'group','F', tun, jpn, '2026-06-19 23:00:00+00', 'Kansas City'),
  (35, 'group','F', ned, tun, '2026-06-24 00:00:00+00', 'Miami'),
  (36, 'group','F', jpn, swe, '2026-06-24 00:00:00+00', 'Kansas City'),
  -- GRUPO G
  (37, 'group','G', esp, nga, '2026-06-15 22:00:00+00', 'Dallas'),
  (38, 'group','G', alg, cro, '2026-06-16 01:00:00+00', 'Houston'),
  (39, 'group','G', esp, alg, '2026-06-20 22:00:00+00', 'Dallas'),
  (40, 'group','G', cro, nga, '2026-06-21 01:00:00+00', 'Houston'),
  (41, 'group','G', esp, cro, '2026-06-25 02:00:00+00', 'Dallas'),
  (42, 'group','G', nga, alg, '2026-06-25 02:00:00+00', 'Houston'),
  -- GRUPO H
  (43, 'group','H', arg, chi, '2026-06-16 00:00:00+00', 'Nueva York'),
  (44, 'group','H', irq, ukr, '2026-06-16 23:00:00+00', 'Boston'),
  (45, 'group','H', arg, irq, '2026-06-20 22:00:00+00', 'Filadelfia'),
  (46, 'group','H', ukr, chi, '2026-06-21 01:00:00+00', 'Nueva York'),
  (47, 'group','H', arg, ukr, '2026-06-25 00:00:00+00', 'Boston'),
  (48, 'group','H', chi, irq, '2026-06-25 00:00:00+00', 'Filadelfia'),
  -- GRUPO I
  (49, 'group','I', fra, ksa, '2026-06-16 22:00:00+00', 'Los Ángeles'),
  (50, 'group','I', cmr, crc, '2026-06-17 01:00:00+00', 'San Francisco'),
  (51, 'group','I', fra, cmr, '2026-06-21 22:00:00+00', 'Seattle'),
  (52, 'group','I', crc, ksa, '2026-06-22 01:00:00+00', 'Los Ángeles'),
  (53, 'group','I', fra, crc, '2026-06-26 02:00:00+00', 'San Francisco'),
  (54, 'group','I', ksa, cmr, '2026-06-26 02:00:00+00', 'Seattle'),
  -- GRUPO J
  (55, 'group','J', eng, irn, '2026-06-17 00:00:00+00', 'Atlanta'),
  (56, 'group','J', ven, sen, '2026-06-17 23:00:00+00', 'Miami'),
  (57, 'group','J', eng, ven, '2026-06-21 23:00:00+00', 'Atlanta'),
  (58, 'group','J', sen, irn, '2026-06-22 02:00:00+00', 'Miami'),
  (59, 'group','J', eng, sen, '2026-06-26 00:00:00+00', 'Atlanta'),
  (60, 'group','J', irn, ven, '2026-06-26 00:00:00+00', 'Miami'),
  -- GRUPO K
  (61, 'group','K', por, col, '2026-06-17 22:00:00+00', 'Kansas City'),
  (62, 'group','K', bel, uru, '2026-06-18 01:00:00+00', 'Chicago'),
  (63, 'group','K', por, bel, '2026-06-22 22:00:00+00', 'Kansas City'),
  (64, 'group','K', uru, col, '2026-06-23 01:00:00+00', 'Chicago'),
  (65, 'group','K', por, uru, '2026-06-27 02:00:00+00', 'Kansas City'),
  (66, 'group','K', col, bel, '2026-06-27 02:00:00+00', 'Chicago'),
  -- GRUPO L
  (67, 'group','L', srb, gha, '2026-06-18 00:00:00+00', 'Toronto'),
  (68, 'group','L', hon, uzb, '2026-06-18 23:00:00+00', 'Vancouver'),
  (69, 'group','L', srb, hon, '2026-06-22 23:00:00+00', 'Toronto'),
  (70, 'group','L', uzb, gha, '2026-06-23 02:00:00+00', 'Vancouver'),
  (71, 'group','L', srb, uzb, '2026-06-27 00:00:00+00', 'Toronto'),
  (72, 'group','L', gha, hon, '2026-06-27 00:00:00+00', 'Vancouver');

  -- Eliminatorias — 32 equipos clasificados (FIFA 2026 format)
  -- Round of 32: 16 partidos (73-88)
  -- Round of 16: 8 partidos  (89-96)
  -- Cuartos:     4 partidos  (97-100)
  -- Semis:       2 partidos  (101-102)
  -- 3° Puesto:   1 partido   (103)
  -- Final:       1 partido   (104)
  INSERT INTO public.matches (match_number, phase, match_date) VALUES
  (73,  'round_of_32',  '2026-06-29 22:00:00+00'),
  (74,  'round_of_32',  '2026-06-30 02:00:00+00'),
  (75,  'round_of_32',  '2026-06-30 22:00:00+00'),
  (76,  'round_of_32',  '2026-07-01 02:00:00+00'),
  (77,  'round_of_32',  '2026-07-01 22:00:00+00'),
  (78,  'round_of_32',  '2026-07-02 02:00:00+00'),
  (79,  'round_of_32',  '2026-07-02 22:00:00+00'),
  (80,  'round_of_32',  '2026-07-03 02:00:00+00'),
  (81,  'round_of_32',  '2026-07-03 22:00:00+00'),
  (82,  'round_of_32',  '2026-07-04 02:00:00+00'),
  (83,  'round_of_32',  '2026-07-04 22:00:00+00'),
  (84,  'round_of_32',  '2026-07-05 02:00:00+00'),
  (85,  'round_of_32',  '2026-07-05 22:00:00+00'),
  (86,  'round_of_32',  '2026-07-06 02:00:00+00'),
  (87,  'round_of_32',  '2026-07-06 22:00:00+00'),
  (88,  'round_of_32',  '2026-07-07 02:00:00+00'),
  (89,  'round_of_16',  '2026-07-09 22:00:00+00'),
  (90,  'round_of_16',  '2026-07-10 02:00:00+00'),
  (91,  'round_of_16',  '2026-07-10 22:00:00+00'),
  (92,  'round_of_16',  '2026-07-11 02:00:00+00'),
  (93,  'round_of_16',  '2026-07-11 22:00:00+00'),
  (94,  'round_of_16',  '2026-07-12 02:00:00+00'),
  (95,  'round_of_16',  '2026-07-12 22:00:00+00'),
  (96,  'round_of_16',  '2026-07-13 02:00:00+00'),
  (97,  'quarterfinal', '2026-07-16 22:00:00+00'),
  (98,  'quarterfinal', '2026-07-17 02:00:00+00'),
  (99,  'quarterfinal', '2026-07-17 22:00:00+00'),
  (100, 'quarterfinal', '2026-07-18 02:00:00+00'),
  (101, 'semifinal',    '2026-07-21 22:00:00+00'),
  (102, 'semifinal',    '2026-07-22 22:00:00+00'),
  (103, 'third_place',  '2026-07-25 18:00:00+00'),
  (104, 'final',        '2026-07-26 22:00:00+00');

END $$;
