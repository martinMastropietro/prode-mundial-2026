'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function saveMatchResult(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Solo el admin puede usar esta action
  if (!user || user.email !== process.env.ADMIN_EMAIL) return

  const matchId    = formData.get('match_id') as string
  const homeScore  = parseInt(formData.get('home_score') as string, 10)
  const awayScore  = parseInt(formData.get('away_score') as string, 10)
  const wentToET   = !!formData.get('went_to_extra_time')
  const wentToPens = !!formData.get('went_to_penalties')
  const penWinner  = formData.get('penalty_winner') as 'home' | 'away' | null

  if (isNaN(homeScore) || isNaN(awayScore)) return

  // Usar service role para bypass de RLS (matches solo son modificables por admin)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await admin
    .from('matches')
    .update({
      home_score:          homeScore,
      away_score:          awayScore,
      home_score_full:     homeScore,
      away_score_full:     awayScore,
      went_to_extra_time:  wentToET,
      went_to_penalties:   wentToPens,
      penalty_winner:      wentToPens ? penWinner : null,
      status:              'finished',
    })
    .eq('id', matchId)

  revalidatePath('/admin')
  revalidatePath('/calendario')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
}
