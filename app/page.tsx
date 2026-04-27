import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/20 via-[#0D0D1A] to-[#003087]/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#7B2D8B15_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A2E] border border-[#2A2D4A] text-sm text-[#8B8FA8] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00A651] animate-pulse" />
            Mundial 2026 · USA · México · Canadá
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-none mb-4">
            <span className="text-white">PRODE</span>
            <br />
            <span className="bg-gradient-to-r from-[#C8102E] via-[#FFB81C] to-[#003087] bg-clip-text text-transparent">
              MUNDIAL
            </span>
            <br />
            <span className="text-white">2026</span>
          </h1>

          <p className="text-[#8B8FA8] text-lg sm:text-xl max-w-md mx-auto mb-10">
            Competí con tus amigos. Predecí los partidos. Ganá el ranking.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-[#C8102E] hover:bg-[#a50d26] text-white font-bold rounded-xl transition-colors text-lg"
            >
              Crear mi Prode
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-[#1A1A2E] hover:bg-[#16213E] text-white font-bold rounded-xl border border-[#2A2D4A] transition-colors text-lg"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-4xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: '🏆', title: 'Creá tu grupo', desc: 'Invitá a tus amigos con un código único.' },
            { icon: '⚽', title: 'Predecí partidos', desc: 'Cargá tus pronósticos antes de cada partido.' },
            { icon: '📊', title: 'Ranking en tiempo real', desc: 'Seguí quién va ganando en tu grupo.' },
          ].map((f) => (
            <div key={f.title} className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A]">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-[#8B8FA8] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-[#8B8FA8] text-sm py-8 border-t border-[#2A2D4A]">
        PRODE Mundial 2026 · Hecho para competir entre amigos
      </footer>
    </main>
  )
}
