'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

type PredictionRow = {
  id: string
  group_id: string
  predicted_home_score: number
  predicted_away_score: number
  predicted_penalty_winner: 'home' | 'away' | null
}

type GroupModeRow = {
  id: string
  prediction_mode: string | null
}

function getWinner(home: number, away: number, penaltyWinner?: 'home' | 'away' | null) {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return penaltyWinner ?? 'draw'
}

function calculatePredictionPoints(
  prediction: PredictionRow,
  realHome: number,
  realAway: number,
  realPenaltyWinner: 'home' | 'away' | null,
  matchNumber: number,
  phase: string,
  groupMode: string | null | undefined
) {
  const exactScore =
    prediction.predicted_home_score === realHome &&
    prediction.predicted_away_score === realAway &&
    (!prediction.predicted_penalty_winner || prediction.predicted_penalty_winner === realPenaltyWinner)

  const hybridPoints: Record<string, { exact: number; winner: number }> = {
    group: { exact: 3, winner: 1 },
    round_of_32: { exact: 6, winner: 3 },
    round_of_16: { exact: 9, winner: 6 },
    quarterfinal: { exact: 15, winner: 10 },
    semifinal: { exact: 25, winner: 18 },
    third_place: { exact: 15, winner: 10 },
    final: { exact: 50, winner: 35 },
  }
  const scoring = groupMode === 'hybrid'
    ? hybridPoints[phase] ?? { exact: 5, winner: 3 }
    : { exact: 5, winner: 3 }

  const basePoints = exactScore
    ? scoring.exact
    : getWinner(
      prediction.predicted_home_score,
      prediction.predicted_away_score,
      prediction.predicted_penalty_winner
    ) === getWinner(realHome, realAway, realPenaltyWinner)
      ? scoring.winner
      : 0

  const predictedWinner = getWinner(
    prediction.predicted_home_score,
    prediction.predicted_away_score,
    prediction.predicted_penalty_winner
  )
  const realWinner = getWinner(realHome, realAway, realPenaltyWinner)

  let bonus = 0
  if (groupMode !== 'hybrid') {
    if (matchNumber === 104 && predictedWinner === realWinner) bonus = 25
    if (matchNumber === 103 && predictedWinner === realWinner) bonus = 5
  }

  return basePoints + bonus
}

async function requireAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) return null

  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function revalidateAdminResultViews() {
  revalidatePath('/admin')
  revalidatePath('/calendario')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
}

export async function saveMatchResult(formData: FormData) {
  const admin = await requireAdminClient()
  if (!admin) return

  const matchId    = formData.get('match_id') as string
  const homeScore  = parseInt(formData.get('home_score') as string, 10)
  const awayScore  = parseInt(formData.get('away_score') as string, 10)
  const wentToET   = !!formData.get('went_to_extra_time')
  const wentToPens = !!formData.get('went_to_penalties')
  const penWinner  = formData.get('penalty_winner') as 'home' | 'away' | null

  if (isNaN(homeScore) || isNaN(awayScore)) return

  // El cálculo de puntos lo hace el trigger SQL (on_match_finished).
  // Solo actualizamos el partido — el trigger se encarga del resto.
  await admin
    .from('matches')
    .update({
      home_score:         homeScore,
      away_score:         awayScore,
      home_score_full:    homeScore,
      away_score_full:    awayScore,
      went_to_extra_time: wentToET,
      went_to_penalties:  wentToPens,
      penalty_winner:     wentToPens ? penWinner : null,
      status:             'finished',
    })
    .eq('id', matchId)

  revalidateAdminResultViews()
}

export async function startMatch(formData: FormData) {
  const admin = await requireAdminClient()
  if (!admin) return
  const matchId = formData.get('match_id') as string
  if (!matchId) return
  await admin.from('matches').update({ status: 'live' }).eq('id', matchId)
  revalidateAdminResultViews()
}

export async function clearMatchResult(formData: FormData) {
  const admin = await requireAdminClient()
  if (!admin) return

  const matchId = formData.get('match_id') as string
  if (!matchId) return

  await admin
    .from('matches')
    .update({
      home_score: null,
      away_score: null,
      home_score_full: null,
      away_score_full: null,
      went_to_extra_time: false,
      went_to_penalties: false,
      penalty_winner: null,
      status: 'scheduled',
    })
    .eq('id', matchId)

  await admin
    .from('predictions')
    .update({
      points_earned: 0,
      calculated_at: null,
    })
    .eq('match_id', matchId)

  revalidateAdminResultViews()
}
