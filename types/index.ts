export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string | null
}

export type Team = {
  id: string
  name: string
  code: string
  flag_emoji: string | null
  group_code: string | null
  confederation: string | null
}

export type MatchPhase =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarterfinal'
  | 'semifinal'
  | 'third_place'
  | 'final'

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'cancelled'

export type Match = {
  id: string
  match_number: number
  phase: MatchPhase
  group_code: string | null
  home_team_id: string | null
  away_team_id: string | null
  match_date: string | null
  stadium: string | null
  city: string | null
  home_score: number | null
  away_score: number | null
  home_score_full: number | null
  away_score_full: number | null
  went_to_extra_time: boolean
  went_to_penalties: boolean
  penalty_winner: 'home' | 'away' | null
  status: MatchStatus
  created_at: string
  home_team?: Team | null
  away_team?: Team | null
}

export type Group = {
  id: string
  public_id: string
  name: string
  access_code: string
  owner_id: string
  max_members: number
  predictions_visible: boolean
  has_top_scorer: boolean
  has_top_assist: boolean
  has_mvp: boolean
  created_at: string
  updated_at: string | null
}

export type GroupMemberRole = 'member' | 'admin'

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  role: GroupMemberRole
  joined_at: string
  profile?: Profile
}

export type Prediction = {
  id: string
  user_id: string
  group_id: string
  match_id: string
  predicted_home_score: number
  predicted_away_score: number
  points_earned: number
  calculated_at: string | null
  created_at: string
  updated_at: string | null
  match?: Match
}

export type SpecialPrediction = {
  id: string
  user_id: string
  group_id: string
  champion_team_id: string | null
  runner_up_team_id: string | null
  third_place_team_id: string | null
  champion_points: number
  runner_up_points: number
  third_place_points: number
  top_scorer_name: string | null
  top_assist_name: string | null
  mvp_name: string | null
  top_scorer_points: number
  top_assist_points: number
  mvp_points: number
  locked_at: string | null
  created_at: string
  updated_at: string | null
  champion_team?: Team | null
  runner_up_team?: Team | null
  third_place_team?: Team | null
}

export type RankingRow = {
  group_id: string
  user_id: string
  display_name: string | null
  username: string
  total_points: number
  correct_predictions: number
  avatar_url: string | null
}

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }
