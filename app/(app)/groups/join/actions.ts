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
  const query = (formData.get('public_id') as string)?.trim()
  if (!query) return { error: 'Ingresá el ID o nombre del grupo' }

  const supabase = await createClient()

  // Primero buscar por public_id exacto
  const { data: byId } = await supabase
    .from('groups')
    .select('id, name, public_id')
    .eq('public_id', query.toUpperCase())
    .maybeSingle()

  if (byId) return { group: byId }

  // Si no encontró, buscar por nombre (case-insensitive)
  const { data: byName } = await supabase
    .from('groups')
    .select('id, name, public_id')
    .ilike('name', `%${query}%`)
    .limit(1)
    .maybeSingle()

  if (byName) return { group: byName }

  return { error: 'Grupo no encontrado. Buscá por ID (WC26-XXXXXX) o nombre.' }
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

  const { data: group } = await supabase
    .from('groups')
    .select('id, access_code, access_password')
    .eq('id', groupId)
    .single()

  if (!group) return { error: 'Grupo no encontrado' }
  if (group.access_code !== accessCode) return { error: 'Código incorrecto' }
  if (group.access_password !== accessPassword) return { error: 'Contraseña incorrecta' }

  // Si ya es miembro, redirigir directo
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

  if (error) return { error: 'Error al unirse. Intentá de nuevo.' }

  redirect(`/groups/${groupId}`)
}
