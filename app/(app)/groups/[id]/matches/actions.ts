'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function savePrediction(formData: FormData) {
  const matchId      = formData.get('match_id') as string
  const groupId      = formData.get('group_id') as string
  const homeGoals    = parseInt(formData.get('home_goals') as string, 10)
  const awayGoals    = parseInt(formData.get('away_goals') as string, 10)
  const penaltyWinner = formData.get('penalty_winner') as string | null

  if (isNaN(homeGoals) || isNaN(awayGoals)) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verificar que el partido todavía se puede predecir
  const { data: match } = await supabase
    .from('matches')
    .select('match_date, status')
    .eq('id', matchId)
    .single()

  if (!match) return
  if (match.status !== 'scheduled') return
  if (match.match_date && new Date(match.match_date) <= new Date()) return

  // Upsert de la predicción
  const upsertData: Record<string, unknown> = {
    user_id: user.id,
    group_id: groupId,
    match_id: matchId,
    predicted_home_score: homeGoals,
    predicted_away_score: awayGoals,
    predicted_penalty_winner:
      homeGoals === awayGoals && (penaltyWinner === 'home' || penaltyWinner === 'away')
        ? penaltyWinner
        : null,
  }

  const { error } = await supabase
    .from('predictions')
    .upsert(upsertData, { onConflict: 'user_id,group_id,match_id' })

  if (error) throw new Error(error.message)

  revalidatePath(`/groups/${groupId}/matches`)
  revalidatePath('/calendario')
}
