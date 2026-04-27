'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y guión bajo')
    .trim(),
  email: z.email('Email inválido').trim(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FieldErrors = { username?: string[]; email?: string[]; password?: string[] }
type RegisterState =
  | { errors: FieldErrors; error?: never; success?: never }
  | { errors?: never; error: string; success?: never }
  | { errors?: never; error?: never; success: boolean }
  | undefined

export async function register(
  _state: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as FieldErrors }
  }

  const { username, email, password } = parsed.data
  const supabase = await createClient()

  // Check username availability
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existing) {
    return { errors: { username: ['Ese nombre de usuario ya está en uso'] } as FieldErrors }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: username },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { errors: { email: ['Ese email ya está registrado'] } as FieldErrors }
    }
    return { error: 'Ocurrió un error. Intentá de nuevo.' }
  }

  return { success: true }
}
