'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { register } from './actions'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/10 via-[#0A0A16] to-[#003087]/10 pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="relative w-16 h-16 drop-shadow-[0_0_20px_rgba(255,184,28,0.3)]">
              <Image src="/logo.png" alt="FIFA World Cup 2026" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-[#C8102E]">PRO</span>DE <span className="text-[#FFB81C]">'26</span>
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
                placeholder="solo letras, números y _"
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
