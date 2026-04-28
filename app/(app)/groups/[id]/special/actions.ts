'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const LOCK_DATE = new Date('2026-06-11T00:00:00Z')

export async function saveSpecialPrediction(formData: FormData) {
  const groupId          = formData.get('group_id') as string
  const championTeamId   = formData.get('champion_team_id') as string
  const runnerUpTeamId   = formData.get('runner_up_team_id') as string
  const thirdPlaceTeamId = formData.get('third_place_team_id') as string
  const topScorerName    = (formData.get('top_scorer_name') as string)?.trim() || null
  const topAssistName    = (formData.get('top_assist_name') as string)?.trim() || null
  const mvpName          = (formData.get('mvp_name') as string)?.trim() || null

  if (!championTeamId || !runnerUpTeamId || !thirdPlaceTeamId) return
  if (new Date() >= LOCK_DATE) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('special_predictions').upsert(
    {
      user_id: user.id,
      group_id: groupId,
      champion_team_id: championTeamId,
      runner_up_team_id: runnerUpTeamId,
      third_place_team_id: thirdPlaceTeamId,
      top_scorer_name: topScorerName,
      top_assist_name: topAssistName,
      mvp_name: mvpName,
    },
    { onConflict: 'user_id,group_id' }
  )

  revalidatePath(`/groups/${groupId}/special`)
}
