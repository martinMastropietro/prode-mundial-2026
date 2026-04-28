'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ImportResult =
  | { success: true; count: number }
  | { success: false; error: string }

export async function importPredictions(
  sourceGroupId: string,
  targetGroupId: string
): Promise<ImportResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Verificar que el usuario es miembro de ambos grupos
  const [srcMembership, tgtMembership] = await Promise.all([
    supabase
      .from('group_members')
      .select('id')
      .eq('group_id', sourceGroupId)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('group_members')
      .select('id')
      .eq('group_id', targetGroupId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!srcMembership.data) return { success: false, error: 'No sos miembro del grupo de origen' }
  if (!tgtMembership.data) return { success: false, error: 'No sos miembro del grupo de destino' }

  // Obtener predicciones del grupo origen
  const { data: sourcePredictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home_score, predicted_away_score, predicted_penalty_winner')
    .eq('user_id', user.id)
    .eq('group_id', sourceGroupId)

  if (!sourcePredictions || sourcePredictions.length === 0) {
    return { success: false, error: 'El grupo de origen no tiene predicciones' }
  }

  // Solo importar partidos que todavía no empezaron
  const now = new Date().toISOString()
  const { data: openMatches } = await supabase
    .from('matches')
    .select('id')
    .gt('match_date', now)
    .eq('status', 'scheduled')

  const openMatchIds = new Set((openMatches ?? []).map(m => m.id))

  const toImport = sourcePredictions
    .filter(p => openMatchIds.has(p.match_id))
    .map(p => ({
      user_id: user.id,
      group_id: targetGroupId,
      match_id: p.match_id,
      predicted_home_score: p.predicted_home_score,
      predicted_away_score: p.predicted_away_score,
      predicted_penalty_winner: p.predicted_penalty_winner ?? null,
    }))

  if (toImport.length === 0) {
    return { success: false, error: 'No hay predicciones de partidos abiertos para importar' }
  }

  // Upsert → crea nuevas o sobreescribe si ya existen en el grupo destino
  const { error } = await supabase
    .from('predictions')
    .upsert(toImport, { onConflict: 'user_id,group_id,match_id' })

  if (error) return { success: false, error: `Error al importar: ${error.message}` }

  revalidatePath(`/groups/${targetGroupId}/matches`)
  revalidatePath('/calendario')
  return { success: true, count: toImport.length }
}
