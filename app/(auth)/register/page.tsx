'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from './actions'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-[#C8102E]">PRO</span>DE 2026
          </h1>
          <p className="text-[#8B8FA8] mt-1">Creá tu cuenta y empezá a jugar</p>
        </div>

        <div className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Nombre de usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
                placeholder="tu_nombre"
              />
              {state?.errors?.username && (
                <p className="text-[#C8102E] text-xs mt-1">{state.errors.username[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
                placeholder="tu@email.com"
              />
              {state?.errors?.email && (
                <p className="text-[#C8102E] text-xs mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-[#0D0D1A] border border-[#2A2D4A] rounded-xl text-white placeholder-[#8B8FA8] focus:outline-none focus:border-[#C8102E] transition-colors"
                placeholder="Mínimo 8 caracteres"
              />
              {state?.errors?.password && (
                <p className="text-[#C8102E] text-xs mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.error && (
              <p className="text-[#C8102E] text-sm">{state.error}</p>
            )}

            {state?.success && (
              <p className="text-[#00A651] text-sm">
                ¡Cuenta creada! Revisá tu email para confirmar.
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 bg-[#C8102E] hover:bg-[#a50d26] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
            >
              {pending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8B8FA8] text-sm mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-[#FFB81C] hover:underline font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
