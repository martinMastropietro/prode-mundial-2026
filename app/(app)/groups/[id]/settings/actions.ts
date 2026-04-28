'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SettingsState = { error?: string; success?: boolean } | undefined

export async function updateGroupSettings(
  _state: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const groupId = formData.get('group_id') as string
  const accessPassword = (formData.get('access_password') as string)?.trim()
  const predictionsVisible = formData.get('predictions_visible') === 'on'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (!group || group.owner_id !== user.id) return { error: 'Sin permisos' }

  const updates: Record<string, unknown> = { predictions_visible: predictionsVisible }
  if (accessPassword) updates.access_password = accessPassword

  const { error } = await supabase.from('groups').update(updates).eq('id', groupId)
  if (error) return { error: 'Error al guardar' }

  revalidatePath(`/groups/${groupId}/settings`)
  return { success: true }
}
