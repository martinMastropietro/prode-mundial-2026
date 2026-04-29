'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { normalizePredictionMode } from '@/lib/utils/predictionModes'

const CreateGroupSchema = z.object({
  public_id: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'Solo letras, números, guión o guión bajo')
    .trim(),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres').trim(),
  access_password: z.string().min(4, 'Mínimo 4 caracteres'),
  prediction_mode: z.enum(['phase_by_phase', 'full_bracket', 'hybrid']).default('phase_by_phase'),
  predictions_visible: z.boolean().default(false),
  has_top_scorer: z.boolean().default(false),
  has_top_assist: z.boolean().default(false),
  has_mvp: z.boolean().default(false),
})

type FieldErrors = { public_id?: string[]; name?: string[]; access_password?: string[] }
type FormValues = { public_id?: string; name?: string; access_password?: string; prediction_mode?: string; predictions_visible?: boolean; has_top_scorer?: boolean; has_top_assist?: boolean; has_mvp?: boolean }
type CreateGroupState =
  | { errors: FieldErrors; error?: never; values?: FormValues }
  | { errors?: never; error: string; values?: FormValues }
  | undefined

export async function createGroup(
  _state: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  const raw = {
    public_id: (formData.get('public_id') as string)?.trim().toUpperCase(),
    name: formData.get('name') as string,
    access_password: formData.get('access_password') as string,
    prediction_mode: normalizePredictionMode(formData.get('prediction_mode')),
    predictions_visible: formData.get('predictions_visible') === 'on',
    has_top_scorer: formData.get('has_top_scorer') === 'on',
    has_top_assist: formData.get('has_top_assist') === 'on',
    has_mvp: formData.get('has_mvp') === 'on',
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
      prediction_mode: parsed.data.prediction_mode,
      predictions_visible: parsed.data.predictions_visible,
      has_top_scorer: parsed.data.has_top_scorer,
      has_top_assist: parsed.data.has_top_assist,
      has_mvp: parsed.data.has_mvp,
    })
    .select('id')
    .single()

  if (error || !group) {
    const msg = error?.message?.includes('access_code')
      ? 'Falta ejecutar la migración SQL en Supabase (005_remove_access_code.sql)'
      : error?.message?.includes('does not exist')
      ? 'Las tablas no existen. Ejecutá DEPLOY_ALL.sql en Supabase.'
      : `Error al crear el grupo: ${error?.message ?? 'desconocido'}`
    return { error: msg, values: raw }
  }

  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'admin',
  })

  redirect(`/groups/${group.id}`)
}
