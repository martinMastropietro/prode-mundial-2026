'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isPredictionOpenForMode, normalizePredictionMode } from '@/lib/utils/predictionModes'

export async function savePrediction(formData: FormData) {
  const matchId = formData.get('match_id') as string
  const groupId = formData.get('group_id') as string
  const homeGoals = parseInt(formData.get('home_goals') as string, 10)
  const awayGoals = parseInt(formData.get('away_goals') as string, 10)
  const penaltyWinner = formData.get('penalty_winner') as string | null

  if (isNaN(homeGoals) || isNaN(awayGoals)) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Server-side closure check
  const [{ data: match }, { data: group }] = await Promise.all([
    supabase
      .from('matches')
      .select('match_date, status, phase')
      .eq('id', matchId)
      .single(),
    supabase
      .from('groups')
      .select('prediction_mode')
      .eq('id', groupId)
      .single(),
  ])

  const mode = normalizePredictionMode(group?.prediction_mode)
  if (!match || !isPredictionOpenForMode(mode, match.phase, match.match_date, match.status)) return

  const upsertData: Record<string, unknown> = {
    user_id: user.id,
    group_id: groupId,
    match_id: matchId,
    predicted_home_score: homeGoals,
    predicted_away_score: awayGoals,
  }
  // Solo guardar penalty_winner si el score es empate
  if (homeGoals === awayGoals && (penaltyWinner === 'home' || penaltyWinner === 'away')) {
    upsertData.predicted_penalty_winner = penaltyWinner
  } else {
    upsertData.predicted_penalty_winner = null
  }

  await supabase.from('predictions').upsert(upsertData, { onConflict: 'user_id,group_id,match_id' })

  revalidatePath(`/groups/${groupId}/matches`)
  revalidatePath('/calendario')
}
