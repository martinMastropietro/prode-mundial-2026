-- =============================================
-- PRODE Mundial 2026 — Schema inicial
-- =============================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);

-- Teams
CREATE TABLE public.teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  flag_emoji text,
  group_code text,
  confederation text
);

-- Matches
CREATE TABLE public.matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_number integer UNIQUE NOT NULL,
  phase text NOT NULL CHECK (phase IN ('group','round_of_32','round_of_16','quarterfinal','semifinal','third_place','final')),
  group_code text,
  home_team_id uuid REFERENCES public.teams(id),
  away_team_id uuid REFERENCES public.teams(id),
  match_date timestamptz,
  stadium text,
  city text,
  home_score integer,
  away_score integer,
  home_score_full integer,
  away_score_full integer,
  went_to_extra_time boolean DEFAULT false NOT NULL,
  went_to_penalties boolean DEFAULT false NOT NULL,
  penalty_winner text CHECK (penalty_winner IN ('home','away')),
  status text DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled','live','finished','cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Groups (prode groups)
CREATE TABLE public.groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  public_id text UNIQUE NOT NULL,
  name text NOT NULL,
  access_code text NOT NULL,
  access_password text NOT NULL,
  owner_id uuid REFERENCES public.profiles(id) NOT NULL,
  max_members integer DEFAULT 50 NOT NULL,
  predictions_visible boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz
);

-- Group members
CREATE TABLE public.group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' NOT NULL CHECK (role IN ('member','admin')),
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Predictions
CREATE TABLE public.predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  predicted_home_score integer NOT NULL CHECK (predicted_home_score >= 0),
  predicted_away_score integer NOT NULL CHECK (predicted_away_score >= 0),
  points_earned integer DEFAULT 0 NOT NULL,
  calculated_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz,
  UNIQUE(user_id, group_id, match_id)
);

-- Special predictions (champion, runner-up, third place)
CREATE TABLE public.special_predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  champion_team_id uuid REFERENCES public.teams(id),
  runner_up_team_id uuid REFERENCES public.teams(id),
  third_place_team_id uuid REFERENCES public.teams(id),
  champion_points integer DEFAULT 0 NOT NULL,
  runner_up_points integer DEFAULT 0 NOT NULL,
  third_place_points integer DEFAULT 0 NOT NULL,
  locked_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz,
  UNIQUE(user_id, group_id)
);

-- Indexes
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_predictions_user_group ON public.predictions(user_id, group_id);
CREATE INDEX idx_predictions_match ON public.predictions(match_id);
CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_matches_status ON public.matches(status);
-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_predictions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- TEAMS (public read)
CREATE POLICY "teams_select_all" ON public.teams
  FOR SELECT USING (true);

-- MATCHES (public read)
CREATE POLICY "matches_select_all" ON public.matches
  FOR SELECT USING (true);

-- GROUPS
CREATE POLICY "groups_select_authenticated" ON public.groups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "groups_insert_authenticated" ON public.groups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "groups_update_owner" ON public.groups
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "groups_delete_owner" ON public.groups
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- GROUP MEMBERS
CREATE POLICY "group_members_select_member" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "group_members_insert_self" ON public.group_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "group_members_delete_self_or_owner" ON public.group_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR group_id IN (
      SELECT id FROM public.groups WHERE owner_id = auth.uid()
    )
  );

-- PREDICTIONS
-- Own predictions: always visible
-- Others' predictions: visible after match starts OR if group.predictions_visible = true
CREATE POLICY "predictions_select_member" ON public.predictions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
      AND (
        (SELECT predictions_visible FROM public.groups WHERE id = group_id) = true
        OR (SELECT match_date FROM public.matches WHERE id = match_id) <= now()
      )
    )
  );

CREATE POLICY "predictions_insert_own_before_start" ON public.predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    AND (
      SELECT match_date FROM public.matches WHERE id = match_id
    ) > now()
    AND (
      SELECT status FROM public.matches WHERE id = match_id
    ) = 'scheduled'
  );

CREATE POLICY "predictions_update_own_before_start" ON public.predictions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND (
      SELECT match_date FROM public.matches WHERE id = match_id
    ) > now()
    AND (
      SELECT status FROM public.matches WHERE id = match_id
    ) = 'scheduled'
  );

-- SPECIAL PREDICTIONS
CREATE POLICY "special_select_member" ON public.special_predictions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
      AND (locked_at IS NOT NULL)
    )
  );

CREATE POLICY "special_insert_own" ON public.special_predictions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
    AND locked_at IS NULL
  );

CREATE POLICY "special_update_own" ON public.special_predictions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND locked_at IS NULL
  );
-- =============================================
-- Functions and Triggers
-- =============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Calculate prediction points
CREATE OR REPLACE FUNCTION public.calculate_prediction_points(
  pred_home integer,
  pred_away integer,
  real_home integer,
  real_away integer
) RETURNS integer AS $$
DECLARE
  pred_result text;
  real_result text;
BEGIN
  IF pred_home > pred_away THEN pred_result := 'H';
  ELSIF pred_home < pred_away THEN pred_result := 'A';
  ELSE pred_result := 'D'; END IF;

  IF real_home > real_away THEN real_result := 'H';
  ELSIF real_home < real_away THEN real_result := 'A';
  ELSE real_result := 'D'; END IF;

  IF pred_home = real_home AND pred_away = real_away THEN RETURN 5;
  ELSIF pred_result = real_result THEN RETURN 3;
  ELSE RETURN 0; END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: calculate points when match finishes
CREATE OR REPLACE FUNCTION public.update_prediction_points_on_finish()
RETURNS trigger AS $$
BEGIN
  -- Only run when status changes to 'finished' and scores are set
  IF NEW.status = 'finished'
    AND OLD.status != 'finished'
    AND NEW.home_score_full IS NOT NULL
    AND NEW.away_score_full IS NOT NULL
  THEN
    UPDATE public.predictions
    SET
      points_earned = public.calculate_prediction_points(
        predicted_home_score,
        predicted_away_score,
        NEW.home_score_full,
        NEW.away_score_full
      ),
      calculated_at = now()
    WHERE match_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_match_finished
  AFTER UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_prediction_points_on_finish();

-- Ranking view
CREATE OR REPLACE VIEW public.ranking_by_group AS
SELECT
  gm.group_id,
  gm.user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  COALESCE(SUM(pr.points_earned), 0)
    + COALESCE(sp.champion_points, 0)
    + COALESCE(sp.runner_up_points, 0)
    + COALESCE(sp.third_place_points, 0) AS total_points,
  COUNT(CASE WHEN pr.points_earned > 0 THEN 1 END) AS correct_predictions
FROM public.group_members gm
JOIN public.profiles p ON p.id = gm.user_id
LEFT JOIN public.predictions pr
  ON pr.user_id = gm.user_id AND pr.group_id = gm.group_id
LEFT JOIN public.special_predictions sp
  ON sp.user_id = gm.user_id AND sp.group_id = gm.group_id
GROUP BY
  gm.group_id,
  gm.user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  sp.champion_points,
  sp.runner_up_points,
  sp.third_place_points;

-- RLS on view (security_invoker ensures caller's RLS applies)
ALTER VIEW public.ranking_by_group SET (security_invoker = on);
-- =============================================
-- FIFA World Cup 2026 — 48 Teams Seed
-- Groups A-L (4 teams each) — approximate seeding
-- Final draw determines exact groups
-- =============================================

INSERT INTO public.teams (name, code, flag_emoji, group_code, confederation) VALUES
-- Group A (USA host)
('Estados Unidos', 'USA', '🇺🇸', 'A', 'CONCACAF'),
('Portugal', 'POR', '🇵🇹', 'A', 'UEFA'),
('Uruguay', 'URU', '🇺🇾', 'A', 'CONMEBOL'),
('República Democrática del Congo', 'COD', '🇨🇩', 'A', 'CAF'),

-- Group B
('España', 'ESP', '🇪🇸', 'B', 'UEFA'),
('Argentina', 'ARG', '🇦🇷', 'B', 'CONMEBOL'),
('Marruecos', 'MAR', '🇲🇦', 'B', 'CAF'),
('Japón', 'JPN', '🇯🇵', 'B', 'AFC'),

-- Group C
('Francia', 'FRA', '🇫🇷', 'C', 'UEFA'),
('Brasil', 'BRA', '🇧🇷', 'C', 'CONMEBOL'),
('Nigeria', 'NGA', '🇳🇬', 'C', 'CAF'),
('Arabia Saudita', 'KSA', '🇸🇦', 'C', 'AFC'),

-- Group D
('Alemania', 'GER', '🇩🇪', 'D', 'UEFA'),
('Colombia', 'COL', '🇨🇴', 'D', 'CONMEBOL'),
('Senegal', 'SEN', '🇸🇳', 'D', 'CAF'),
('Corea del Sur', 'KOR', '🇰🇷', 'D', 'AFC'),

-- Group E (México host)
('México', 'MEX', '🇲🇽', 'E', 'CONCACAF'),
('Inglaterra', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'E', 'UEFA'),
('Ecuador', 'ECU', '🇪🇨', 'E', 'CONMEBOL'),
('Irán', 'IRN', '🇮🇷', 'E', 'AFC'),

-- Group F (Canadá host)
('Canadá', 'CAN', '🇨🇦', 'F', 'CONCACAF'),
('Países Bajos', 'NED', '🇳🇱', 'F', 'UEFA'),
('Costa de Marfil', 'CIV', '🇨🇮', 'F', 'CAF'),
('Australia', 'AUS', '🇦🇺', 'F', 'AFC'),

-- Group G
('Bélgica', 'BEL', '🇧🇪', 'G', 'UEFA'),
('Chile', 'CHI', '🇨🇱', 'G', 'CONMEBOL'),
('Egipto', 'EGY', '🇪🇬', 'G', 'CAF'),
('Iraq', 'IRQ', '🇮🇶', 'G', 'AFC'),

-- Group H
('Croacia', 'CRO', '🇭🇷', 'H', 'UEFA'),
('Paraguay', 'PAR', '🇵🇾', 'H', 'CONMEBOL'),
('Argelia', 'ALG', '🇩🇿', 'H', 'CAF'),
('Uzbekistán', 'UZB', '🇺🇿', 'H', 'AFC'),

-- Group I
('Italia', 'ITA', '🇮🇹', 'I', 'UEFA'),
('Bolivia', 'BOL', '🇧🇴', 'I', 'CONMEBOL'),
('Ghana', 'GHA', '🇬🇭', 'I', 'CAF'),
('Panamá', 'PAN', '🇵🇦', 'I', 'CONCACAF'),

-- Group J
('Serbia', 'SRB', '🇷🇸', 'J', 'UEFA'),
('Perú', 'PER', '🇵🇪', 'J', 'CONMEBOL'),
('Camerún', 'CMR', '🇨🇲', 'J', 'CAF'),
('Costa Rica', 'CRC', '🇨🇷', 'J', 'CONCACAF'),

-- Group K
('Turquía', 'TUR', '🇹🇷', 'K', 'UEFA'),
('Venezuela', 'VEN', '🇻🇪', 'K', 'CONMEBOL'),
('Sudáfrica', 'RSA', '🇿🇦', 'K', 'CAF'),
('Jamaica', 'JAM', '🇯🇲', 'K', 'CONCACAF'),

-- Group L
('Ucrania', 'UKR', '🇺🇦', 'L', 'UEFA'),
('Honduras', 'HON', '🇭🇳', 'L', 'CONCACAF'),
('Guinea', 'GIN', '🇬🇳', 'L', 'CAF'),
('Jordania', 'JOR', '🇯🇴', 'L', 'AFC')

ON CONFLICT (code) DO NOTHING;
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
