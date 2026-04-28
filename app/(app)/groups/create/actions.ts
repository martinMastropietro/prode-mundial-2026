'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generatePublicId } from '@/lib/utils/groupId'

const CreateGroupSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres').trim(),
  access_password: z.string().min(4, 'Mínimo 4 caracteres'),
})

type FieldErrors = { name?: string[]; access_password?: string[] }
type CreateGroupState =
  | { errors: FieldErrors; error?: never }
  | { errors?: never; error: string }
  | undefined

export async function createGroup(
  _state: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const parsed = CreateGroupSchema.safeParse({
    name: formData.get('name'),
    access_password: formData.get('access_password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as FieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  let publicId = generatePublicId()
  let attempts = 0
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from('groups')
      .select('id')
      .eq('public_id', publicId)
      .maybeSingle()
    if (!existing) break
    publicId = generatePublicId()
    attempts++
  }

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      public_id: publicId,
      name: parsed.data.name,
      access_password: parsed.data.access_password,
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (error || !group) {
    return { error: 'Error al crear el grupo. Intentá de nuevo.' }
  }

  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'admin',
  })

  redirect(`/groups/${group.id}`)
}
