'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ProfileState = { error?: string; success?: boolean } | undefined

export async function updateProfile(
  _state: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const displayName = (formData.get('display_name') as string)?.trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName || null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'Error al actualizar' }

  revalidatePath('/profile')
  return { success: true }
}
