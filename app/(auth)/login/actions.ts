'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

type LoginState = { error: string } | undefined

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identifier = (formData.get('identifier') as string)?.trim()
  const password = formData.get('password') as string

  if (!identifier || !password) {
    return { error: 'Completá todos los campos.' }
  }

  const supabase = await createClient()
  let email = identifier

  // Si no tiene @ es un nombre de usuario — buscar el email via admin
  if (!identifier.includes('@')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', identifier.toLowerCase())
      .maybeSingle()

    if (!profile) {
      return { error: 'Usuario o contraseña incorrectos.' }
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user } } = await admin.auth.admin.getUserById(profile.id)
    if (!user?.email) {
      return { error: 'Usuario o contraseña incorrectos.' }
    }
    email = user.email
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Usuario o contraseña incorrectos.' }
  }

  redirect('/dashboard')
}
