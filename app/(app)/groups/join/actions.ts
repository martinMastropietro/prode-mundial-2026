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
  if (!publicId) return { error: 'Ingresá el ID del grupo' }

  const supabase = await createClient()
  const { data: group } = await supabase
    .from('groups')
    .select('id, name, public_id')
    .eq('public_id', publicId)
    .maybeSingle()

  if (!group) return { error: 'Grupo no encontrado. Verificá el ID (ej: WC26-PSASP8).' }
  return { group }
}

export async function joinGroup(
  _state: JoinState,
  formData: FormData
): Promise<JoinState> {
  const groupId = formData.get('group_id') as string
  const accessPassword = formData.get('access_password') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: group } = await supabase
    .from('groups')
    .select('id, access_password')
    .eq('id', groupId)
    .single()

  if (!group) return { error: 'Grupo no encontrado' }
  if (group.access_password !== accessPassword) return { error: 'Contraseña incorrecta' }

  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) redirect(`/groups/${groupId}`)

  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: user.id,
    role: 'member',
  })

  if (error) {
    // duplicate key = ya sos miembro, redirigir igual
    if (error.code === '23505') redirect(`/groups/${groupId}`)
    return { error: `Error: ${error.message}` }
  }

  redirect(`/groups/${groupId}`)
}
