'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const CreateGroupSchema = z.object({
  public_id: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'Solo letras, números, guión o guión bajo')
    .trim(),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres').trim(),
  access_password: z.string().min(4, 'Mínimo 4 caracteres'),
})

type FieldErrors = { public_id?: string[]; name?: string[]; access_password?: string[] }
type CreateGroupState =
  | { errors: FieldErrors; error?: never; values?: Record<string, string> }
  | { errors?: never; error: string; values?: Record<string, string> }
  | undefined

export async function createGroup(
  _state: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const raw = {
    public_id: (formData.get('public_id') as string)?.trim().toUpperCase(),
    name: formData.get('name') as string,
    access_password: formData.get('access_password') as string,
  }

  const parsed = CreateGroupSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as FieldErrors, values: raw }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado', values: raw }

  // Verificar que el ID no esté tomado
  const { data: existing } = await supabase
    .from('groups')
    .select('id')
    .eq('public_id', parsed.data.public_id)
    .maybeSingle()

  if (existing) {
    return {
      errors: { public_id: [`El ID "${parsed.data.public_id}" ya está en uso, elegí otro`] },
      values: raw,
    }
  }

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      public_id: parsed.data.public_id,
      name: parsed.data.name,
      access_password: parsed.data.access_password,
      owner_id: user.id,
    })
    .select('id')
    .single()

  if (error || !group) {
    return { error: 'Error al crear el grupo. Intentá de nuevo.', values: raw }
  }

  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'admin',
  })

  redirect(`/groups/${group.id}`)
}
