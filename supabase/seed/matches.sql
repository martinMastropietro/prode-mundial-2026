-- =============================================
-- FIFA World Cup 2026 — Matches Seed
-- Group stage: matches 1-48 (approximate dates)
-- Knockout stage: matches 49-104 (TBD teams)
-- =============================================

-- Note: team IDs are resolved by code at insert time
-- This seed assumes teams table is already populated

-- Helper function to get team ID by code
DO $$
DECLARE
  -- Group A
  usa_id uuid; por_id uuid; uru_id uuid; cod_id uuid;
  -- Group B
  esp_id uuid; arg_id uuid; mar_id uuid; jpn_id uuid;
  -- Group C
  fra_id uuid; bra_id uuid; nga_id uuid; ksa_id uuid;
  -- Group D
  ger_id uuid; col_id uuid; sen_id uuid; kor_id uuid;
  -- Group E
  mex_id uuid; eng_id uuid; ecu_id uuid; irn_id uuid;
  -- Group F
  can_id uuid; ned_id uuid; civ_id uuid; aus_id uuid;
  -- Group G
  bel_id uuid; chi_id uuid; egy_id uuid; irq_id uuid;
  -- Group H
  cro_id uuid; par_id uuid; alg_id uuid; uzb_id uuid;
  -- Group I
  ita_id uuid; bol_id uuid; gha_id uuid; pan_id uuid;
  -- Group J
  srb_id uuid; per_id uuid; cmr_id uuid; crc_id uuid;
  -- Group K
  tur_id uuid; ven_id uuid; rsa_id uuid; jam_id uuid;
  -- Group L
  ukr_id uuid; hon_id uuid; gin_id uuid; jor_id uuid;
BEGIN
  SELECT id INTO usa_id FROM public.teams WHERE code = 'USA';
  SELECT id INTO por_id FROM public.teams WHERE code = 'POR';
  SELECT id INTO uru_id FROM public.teams WHERE code = 'URU';
  SELECT id INTO cod_id FROM public.teams WHERE code = 'COD';
  SELECT id INTO esp_id FROM public.teams WHERE code = 'ESP';
  SELECT id INTO arg_id FROM public.teams WHERE code = 'ARG';
  SELECT id INTO mar_id FROM public.teams WHERE code = 'MAR';
  SELECT id INTO jpn_id FROM public.teams WHERE code = 'JPN';
  SELECT id INTO fra_id FROM public.teams WHERE code = 'FRA';
  SELECT id INTO bra_id FROM public.teams WHERE code = 'BRA';
  SELECT id INTO nga_id FROM public.teams WHERE code = 'NGA';
  SELECT id INTO ksa_id FROM public.teams WHERE code = 'KSA';
  SELECT id INTO ger_id FROM public.teams WHERE code = 'GER';
  SELECT id INTO col_id FROM public.teams WHERE code = 'COL';
  SELECT id INTO sen_id FROM public.teams WHERE code = 'SEN';
  SELECT id INTO kor_id FROM public.teams WHERE code = 'KOR';
  SELECT id INTO mex_id FROM public.teams WHERE code = 'MEX';
  SELECT id INTO eng_id FROM public.teams WHERE code = 'ENG';
  SELECT id INTO ecu_id FROM public.teams WHERE code = 'ECU';
  SELECT id INTO irn_id FROM public.teams WHERE code = 'IRN';
  SELECT id INTO can_id FROM public.teams WHERE code = 'CAN';
  SELECT id INTO ned_id FROM public.teams WHERE code = 'NED';
  SELECT id INTO civ_id FROM public.teams WHERE code = 'CIV';
  SELECT id INTO aus_id FROM public.teams WHERE code = 'AUS';
  SELECT id INTO bel_id FROM public.teams WHERE code = 'BEL';
  SELECT id INTO chi_id FROM public.teams WHERE code = 'CHI';
  SELECT id INTO egy_id FROM public.teams WHERE code = 'EGY';
  SELECT id INTO irq_id FROM public.teams WHERE code = 'IRQ';
  SELECT id INTO cro_id FROM public.teams WHERE code = 'CRO';
  SELECT id INTO par_id FROM public.teams WHERE code = 'PAR';
  SELECT id INTO alg_id FROM public.teams WHERE code = 'ALG';
  SELECT id INTO uzb_id FROM public.teams WHERE code = 'UZB';
  SELECT id INTO ita_id FROM public.teams WHERE code = 'ITA';
  SELECT id INTO bol_id FROM public.teams WHERE code = 'BOL';
  SELECT id INTO gha_id FROM public.teams WHERE code = 'GHA';
  SELECT id INTO pan_id FROM public.teams WHERE code = 'PAN';
  SELECT id INTO srb_id FROM public.teams WHERE code = 'SRB';
  SELECT id INTO per_id FROM public.teams WHERE code = 'PER';
  SELECT id INTO cmr_id FROM public.teams WHERE code = 'CMR';
  SELECT id INTO crc_id FROM public.teams WHERE code = 'CRC';
  SELECT id INTO tur_id FROM public.teams WHERE code = 'TUR';
  SELECT id INTO ven_id FROM public.teams WHERE code = 'VEN';
  SELECT id INTO rsa_id FROM public.teams WHERE code = 'RSA';
  SELECT id INTO jam_id FROM public.teams WHERE code = 'JAM';
  SELECT id INTO ukr_id FROM public.teams WHERE code = 'UKR';
  SELECT id INTO hon_id FROM public.teams WHERE code = 'HON';
  SELECT id INTO gin_id FROM public.teams WHERE code = 'GIN';
  SELECT id INTO jor_id FROM public.teams WHERE code = 'JOR';

  -- =============================================
  -- GROUP STAGE (matches 1-48)
  -- Approximate dates based on FIFA schedule
  -- =============================================

  -- Group A
  INSERT INTO public.matches (match_number, phase, group_code, home_team_id, away_team_id, match_date, city) VALUES
  (1,  'group', 'A', mex_id, usa_id, '2026-06-11 20:00:00-05', 'Ciudad de México'),
  (2,  'group', 'A', usa_id, cod_id, '2026-06-15 15:00:00-05', 'Los Ángeles'),
  (3,  'group', 'A', por_id, uru_id, '2026-06-15 18:00:00-05', 'Kansas City'),
  (4,  'group', 'A', mex_id, por_id, '2026-06-19 18:00:00-05', 'Ciudad de México'),
  (5,  'group', 'A', uru_id, cod_id, '2026-06-19 18:00:00-05', 'Dallas'),
  (6,  'group', 'A', mex_id, uru_id, '2026-06-23 18:00:00-05', 'Ciudad de México'),
  -- Nota: El partido 1 es México vs USA como partido inaugural

  -- Group B
  (7,  'group', 'B', esp_id, arg_id, '2026-06-12 16:00:00-05', 'Dallas'),
  (8,  'group', 'B', mar_id, jpn_id, '2026-06-12 19:00:00-05', 'Miami'),
  (9,  'group', 'B', esp_id, mar_id, '2026-06-16 16:00:00-05', 'Los Ángeles'),
  (10, 'group', 'B', jpn_id, arg_id, '2026-06-16 19:00:00-05', 'Houston'),
  (11, 'group', 'B', esp_id, jpn_id, '2026-06-20 16:00:00-05', 'San Francisco'),
  (12, 'group', 'B', arg_id, mar_id, '2026-06-20 16:00:00-05', 'Miami'),

  -- Group C
  (13, 'group', 'C', fra_id, bra_id, '2026-06-13 16:00:00-05', 'Nueva York'),
  (14, 'group', 'C', nga_id, ksa_id, '2026-06-13 19:00:00-05', 'Boston'),
  (15, 'group', 'C', fra_id, nga_id, '2026-06-17 16:00:00-05', 'Seattle'),
  (16, 'group', 'C', bra_id, ksa_id, '2026-06-17 19:00:00-05', 'Dallas'),
  (17, 'group', 'C', fra_id, ksa_id, '2026-06-21 16:00:00-05', 'Kansas City'),
  (18, 'group', 'C', bra_id, nga_id, '2026-06-21 16:00:00-05', 'Philadelphia'),

  -- Group D
  (19, 'group', 'D', ger_id, col_id, '2026-06-14 16:00:00-05', 'Philadelphia'),
  (20, 'group', 'D', sen_id, kor_id, '2026-06-14 19:00:00-05', 'Seattle'),
  (21, 'group', 'D', ger_id, sen_id, '2026-06-18 16:00:00-05', 'Boston'),
  (22, 'group', 'D', col_id, kor_id, '2026-06-18 19:00:00-05', 'Los Ángeles'),
  (23, 'group', 'D', ger_id, kor_id, '2026-06-22 16:00:00-05', 'Nueva York'),
  (24, 'group', 'D', col_id, sen_id, '2026-06-22 16:00:00-05', 'Houston'),

  -- Group E
  (25, 'group', 'E', mex_id, ecu_id, '2026-06-13 14:00:00-05', 'Guadalajara'),
  (26, 'group', 'E', eng_id, irn_id, '2026-06-13 17:00:00-05', 'Dallas'),
  (27, 'group', 'E', eng_id, mex_id, '2026-06-17 17:00:00-05', 'Nueva York'),
  (28, 'group', 'E', irn_id, ecu_id, '2026-06-17 14:00:00-05', 'San Francisco'),
  (29, 'group', 'E', eng_id, ecu_id, '2026-06-21 17:00:00-05', 'Miami'),
  (30, 'group', 'E', mex_id, irn_id, '2026-06-21 17:00:00-05', 'Monterrey'),

  -- Group F
  (31, 'group', 'F', can_id, ned_id, '2026-06-12 14:00:00-04', 'Toronto'),
  (32, 'group', 'F', civ_id, aus_id, '2026-06-12 17:00:00-04', 'Vancouver'),
  (33, 'group', 'F', can_id, civ_id, '2026-06-16 14:00:00-04', 'Toronto'),
  (34, 'group', 'F', ned_id, aus_id, '2026-06-16 17:00:00-04', 'Vancouver'),
  (35, 'group', 'F', can_id, aus_id, '2026-06-20 14:00:00-04', 'Toronto'),
  (36, 'group', 'F', ned_id, civ_id, '2026-06-20 14:00:00-04', 'Vancouver'),

  -- Group G
  (37, 'group', 'G', bel_id, chi_id, '2026-06-14 15:00:00-05', 'Atlanta'),
  (38, 'group', 'G', egy_id, irq_id, '2026-06-14 18:00:00-05', 'Phoenix'),
  (39, 'group', 'G', bel_id, egy_id, '2026-06-18 15:00:00-05', 'Chicago'),
  (40, 'group', 'G', chi_id, irq_id, '2026-06-18 18:00:00-05', 'Atlanta'),
  (41, 'group', 'G', bel_id, irq_id, '2026-06-22 15:00:00-05', 'Dallas'),
  (42, 'group', 'G', chi_id, egy_id, '2026-06-22 15:00:00-05', 'Phoenix'),

  -- Group H
  (43, 'group', 'H', cro_id, par_id, '2026-06-15 16:00:00-04', 'Toronto'),
  (44, 'group', 'H', alg_id, uzb_id, '2026-06-15 19:00:00-04', 'Vancouver'),
  (45, 'group', 'H', cro_id, alg_id, '2026-06-19 16:00:00-05', 'Houston'),
  (46, 'group', 'H', par_id, uzb_id, '2026-06-19 19:00:00-05', 'Los Ángeles'),
  (47, 'group', 'H', cro_id, uzb_id, '2026-06-23 16:00:00-05', 'Kansas City'),
  (48, 'group', 'H', par_id, alg_id, '2026-06-23 16:00:00-05', 'Seattle');

END $$;

-- =============================================
-- KNOCKOUT STAGE (matches 49-104)
-- Teams TBD — will be filled in as tournament progresses
-- =============================================

INSERT INTO public.matches (match_number, phase, match_date) VALUES
-- Round of 32 (48 teams → 32 teams — 8 matches of best 3rds)
-- Actually FIFA 2026: 48 teams, 12 groups, top 2 + 8 best 3rds = 32 teams
(49,  'round_of_32', '2026-06-27 12:00:00-05'),
(50,  'round_of_32', '2026-06-27 16:00:00-05'),
(51,  'round_of_32', '2026-06-27 20:00:00-05'),
(52,  'round_of_32', '2026-06-28 12:00:00-05'),
(53,  'round_of_32', '2026-06-28 16:00:00-05'),
(54,  'round_of_32', '2026-06-28 20:00:00-05'),
(55,  'round_of_32', '2026-06-29 12:00:00-05'),
(56,  'round_of_32', '2026-06-29 16:00:00-05'),
-- Round of 16
(57,  'round_of_16', '2026-07-02 16:00:00-05'),
(58,  'round_of_16', '2026-07-02 20:00:00-05'),
(59,  'round_of_16', '2026-07-03 16:00:00-05'),
(60,  'round_of_16', '2026-07-03 20:00:00-05'),
(61,  'round_of_16', '2026-07-04 16:00:00-05'),
(62,  'round_of_16', '2026-07-04 20:00:00-05'),
(63,  'round_of_16', '2026-07-05 16:00:00-05'),
(64,  'round_of_16', '2026-07-05 20:00:00-05'),
-- Quarterfinals
(65,  'quarterfinal', '2026-07-09 16:00:00-05'),
(66,  'quarterfinal', '2026-07-09 20:00:00-05'),
(67,  'quarterfinal', '2026-07-10 16:00:00-05'),
(68,  'quarterfinal', '2026-07-10 20:00:00-05'),
-- Semifinals
(69,  'semifinal', '2026-07-14 19:00:00-05'),
(70,  'semifinal', '2026-07-15 19:00:00-05'),
-- Third place
(71,  'third_place', '2026-07-18 14:00:00-05'),
-- Final
(72,  'final', '2026-07-19 17:00:00-05')

ON CONFLICT (match_number) DO NOTHING;
