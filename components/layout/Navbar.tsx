import Link from 'next/link'
import Image from 'next/image'
import { logout } from '@/app/(app)/actions'

type Props = {
  profile: { username: string; display_name: string | null; avatar_url: string | null } | null
  isAdmin?: boolean
}

export default function Navbar({ profile, isAdmin }: Props) {
  return (
    <header className="border-b border-[#2A2D4A]/60 bg-[#0D0D1A]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="FIFA World Cup 2026"
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-200"
              priority
            />
          </div>
          <div className="leading-none">
            <div className="font-black text-base tracking-tight">
              <span className="text-[#C8102E]">PRO</span>
              <span className="text-white">DE</span>
            </div>
            <div className="text-[#FFB81C] font-black text-xs tracking-widest">MUNDIAL &apos;26</div>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm font-medium">
          <Link href="/dashboard" className="text-[#8B8FA8] hover:text-white transition-colors">
            Inicio
          </Link>
          <Link href="/calendario" className="text-[#8B8FA8] hover:text-white transition-colors">
            Fixture y tablas
          </Link>
          <Link href="/groups/join" className="text-[#8B8FA8] hover:text-white transition-colors">
            Unirse a un grupo
          </Link>
          <Link href="/groups/create" className="text-[#8B8FA8] hover:text-white transition-colors">
            Crear un grupo
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-[#FFB81C] hover:text-[#FFD700] transition-colors font-bold">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/profile" className="flex items-center gap-2 text-sm">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#C8102E] to-[#7B2D8B] flex items-center justify-center font-bold text-xs shadow-lg overflow-hidden">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                (profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()
              )}
            </div>
            <span className="hidden sm:block text-[#8B8FA8] hover:text-white transition-colors">
              {profile?.display_name ?? profile?.username}
            </span>
          </Link>
          <form action={logout}>
            <button type="submit" className="text-[#8B8FA8] hover:text-white text-sm transition-colors px-2 py-1">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
