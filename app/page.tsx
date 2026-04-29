import Link from 'next/link'
import Image from 'next/image'
import FlagIcon from '@/components/ui/FlagIcon'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">

        {/* Multi-layer background — more energetic */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/30 via-[#0D0D1A] to-[#003087]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_#7B2D8B25_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8102E] via-[#FFB81C] to-[#003087]" />

        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-[#C8102E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-[#003087]/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Trophy logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28 drop-shadow-[0_0_30px_rgba(255,184,28,0.4)]">
              <Image src="/logo.png" alt="FIFA World Cup 2026" fill className="object-contain" priority />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-black tracking-tighter leading-none mb-4">
            <div className="text-5xl sm:text-7xl">
              <span className="text-white">PRODE</span>
            </div>
            <div className="text-6xl sm:text-8xl">
              <span className="bg-gradient-to-r from-[#C8102E] via-[#FFB81C] to-[#FFD700] bg-clip-text text-transparent">
                MUNDIAL
              </span>
            </div>
            <div className="text-5xl sm:text-7xl text-white">2026</div>
          </h1>

          <p className="text-[#8B8FA8] text-lg sm:text-xl max-w-sm mx-auto mb-10 mt-3">
            Predecí. Competí. Ganale a tus amigos.
          </p>

          {/* Stats bar */}
          <div className="flex justify-center gap-8 mb-10 text-center">
            {[
              { n: '48', label: 'Selecciones' },
              { n: '104', label: 'Partidos' },
              { n: '39', label: 'Días de torneo' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black text-[#FFB81C]">{s.n}</div>
                <div className="text-[#8B8FA8] text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-[#C8102E] to-[#a50d26] hover:from-[#a50d26] hover:to-[#8a0b20] text-white font-black rounded-2xl transition-all text-lg shadow-[0_4px_20px_rgba(200,16,46,0.4)] hover:shadow-[0_6px_24px_rgba(200,16,46,0.6)] hover:scale-105"
            >
              🚀 Crear mi Prode
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-[#1A1A2E] hover:bg-[#16213E] text-white font-bold rounded-2xl border border-[#2A2D4A] hover:border-[#FFB81C]/40 transition-all text-lg"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="px-4 py-12 max-w-4xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: '⚽',
              title: 'Predecí cada partido',
              desc: 'Cargá tu marcador exacto. El cuadro se actualiza automáticamente.',
              color: '#00A651',
            },
            {
              icon: '🏆',
              title: 'Competí con amigos',
              desc: 'Creá tu grupo privado. Solo los que tengan el ID y contraseña entran.',
              color: '#FFB81C',
            },
            {
              icon: '📊',
              title: 'Ranking en tiempo real',
              desc: 'Seguí la tabla al instante. Ver el cuadro proyectado de cada uno.',
              color: '#C8102E',
            },
          ].map(f => (
            <div
              key={f.title}
              className="bg-[#1A1A2E] rounded-2xl p-6 border border-[#2A2D4A] hover:border-[#2A2D4A]/80 transition-colors relative overflow-hidden group"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity"
                style={{ background: f.color }}
              />
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-base mb-1">{f.title}</h3>
              <p className="text-[#8B8FA8] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOSTS ────────────────────────────────────────── */}
      <section className="px-4 pb-10 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-r from-[#C8102E]/10 via-[#1A1A2E] to-[#003087]/10 rounded-2xl p-5 border border-[#2A2D4A] flex flex-wrap justify-center gap-6 text-center">
          {[
            { code: 'USA', country: 'Estados Unidos' },
            { code: 'MEX', country: 'México' },
            { code: 'CAN', country: 'Canadá' },
          ].map(h => (
            <div key={h.country} className="flex flex-col items-center">
              <FlagIcon team={{ code: h.code, flag_emoji: null }} className="mb-2 h-5 w-8" />
              <div className="text-[#8B8FA8] text-xs">{h.country}</div>
            </div>
          ))}
          <div className="flex items-center text-[#8B8FA8] text-xs self-center">
            3 sedes · 16 ciudades · 11 jun – 19 jul 2026
          </div>
        </div>
      </section>

      <footer className="text-center text-[#8B8FA8] text-xs py-6 border-t border-[#2A2D4A]">
        PRODE Mundial 2026 · Hecho para competir entre amigos 🏆
      </footer>
    </main>
  )
}
