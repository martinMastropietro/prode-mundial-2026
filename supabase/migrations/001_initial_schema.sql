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
