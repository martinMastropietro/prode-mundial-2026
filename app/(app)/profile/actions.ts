'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ProfileState = { error?: string; success?: boolean } | undefined

const MAX_AVATAR_SIZE = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function updateProfile(
  _state: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const displayName = (formData.get('display_name') as string)?.trim()
  const avatar = formData.get('avatar')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  let avatarUrl: string | undefined
  if (avatar instanceof File && avatar.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.includes(avatar.type)) {
      return { error: 'La foto debe ser JPG, PNG o WebP' }
    }
    if (avatar.size > MAX_AVATAR_SIZE) {
      return { error: 'La foto no puede superar 2 MB' }
    }

    const ext = avatar.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatar, {
        upsert: true,
        contentType: avatar.type,
        cacheControl: '0',
      })

    if (uploadError) return { error: 'Error al subir la foto' }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    avatarUrl = `${data.publicUrl}?v=${Date.now()}`
  }

  const updates: Record<string, string | null> = {
    display_name: displayName || null,
    updated_at: new Date().toISOString(),
  }
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: 'Error al actualizar' }

  revalidatePath('/profile')
  revalidatePath('/', 'layout')
  return { success: true }
}
