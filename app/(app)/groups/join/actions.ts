'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type SearchState =
  | { group?: { id: string; name: string; public_id: string }; error?: string }
  | undefined

type JoinState = { error?: string } | undefined

export async function searchGroup(
  _state: SearchState,
  formData: FormData
): Promise<SearchState> {
  const publicId = (formData.get('public_id') as string)?.trim().toUpperCase()
  if (!publicId) return { error: 'Ingresá un ID de grupo' }

  const supabase = await createClient()
  const { data: group } = await supabase
    .from('groups')
    .select('id, name, public_id')
    .eq('public_id', publicId)
    .maybeSingle()

  if (!group) return { error: 'Grupo no encontrado. Verificá el ID.' }
  return { group }
}

export async function joinGroup(
  _state: JoinState,
  formData: FormData
): Promise<JoinState> {
  const groupId = formData.get('group_id') as string
  const accessCode = (formData.get('access_code') as string)?.trim().toUpperCase()
  const accessPassword = formData.get('access_password') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  // Verify credentials
  const { data: group } = await supabase
    .from('groups')
    .select('id, access_code, access_password')
    .eq('id', groupId)
    .single()

  if (!group) return { error: 'Grupo no encontrado' }
  if (group.access_code !== accessCode) return { error: 'Código incorrecto' }
  if (group.access_password !== accessPassword) return { error: 'Contraseña incorrecta' }

  // Check already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    redirect(`/groups/${groupId}`)
  }

  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: user.id,
    role: 'member',
  })

  if (error) return { error: 'Error al unirse. Intentá de nuevo.' }

  redirect(`/groups/${groupId}`)
}
