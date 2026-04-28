import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: '🏠' },
  { href: '/calendario', label: 'Calendario', icon: '📅' },
  { href: '/groups/create', label: 'Crear', icon: '➕' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
]

export default function MobileNav() {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A2E] border-t border-[#2A2D4A]">
      <div className="grid grid-cols-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center py-3 gap-1 text-[#8B8FA8] hover:text-white transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
