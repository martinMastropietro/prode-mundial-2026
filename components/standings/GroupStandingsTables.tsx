import type { Standing } from '@/lib/utils/simulate'

type Props = {
  standings: Map<string, Standing[]>
  title?: string
  compact?: boolean
}

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function GroupStandingsTables({ standings, title, compact = false }: Props) {
  const groups = GROUPS
    .map(group => ({ group, rows: standings.get(group) ?? [] }))
    .filter(({ rows }) => rows.length > 0)

  return (
    <section className="space-y-4">
      {title && <h2 className="text-xl font-black">{title}</h2>}
      <div className="space-y-4">
        {groups.map(({ group, rows }) => (
          <div key={group} className="bg-[#1A1A2E] rounded-xl border border-[#2A2D4A] overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-[#C8102E]/20 to-[#003087]/20 border-b border-[#2A2D4A]">
              <h3 className="text-[#FFB81C] text-sm font-black uppercase tracking-widest">Grupo {group}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-[#8B8FA8] border-b border-[#2A2D4A]">
                    <th className="w-10 px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">País</th>
                    <th className="px-2 py-2 text-center">Pts</th>
                    <th className="px-2 py-2 text-center">PJ</th>
                    <th className="px-2 py-2 text-center">PG</th>
                    <th className="px-2 py-2 text-center">PE</th>
                    <th className="px-2 py-2 text-center">PP</th>
                    <th className="px-2 py-2 text-center">GF</th>
                    <th className="px-2 py-2 text-center">GC</th>
                    <th className="px-2 py-2 text-center">Dif.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.team.id}
                      className={`border-b border-[#2A2D4A]/40 last:border-0 ${
                        index < 2 ? 'bg-[#003087]/10' : index === 2 ? 'bg-[#FFB81C]/5' : ''
                      }`}
                    >
                      <td className="px-3 py-2 font-black text-[#8B8FA8]">{index + 1}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg leading-none">{row.team.flag_emoji ?? '🏳️'}</span>
                          <span className="font-bold truncate">{row.team.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center font-black text-[#FFB81C]">{row.pts}</td>
                      <td className="px-2 py-2 text-center text-[#D0D0D0]">{row.mp}</td>
                      <td className="px-2 py-2 text-center text-[#D0D0D0]">{row.w}</td>
                      <td className="px-2 py-2 text-center text-[#D0D0D0]">{row.d}</td>
                      <td className="px-2 py-2 text-center text-[#D0D0D0]">{row.l}</td>
                      <td className="px-2 py-2 text-center text-[#D0D0D0]">{row.gf}</td>
                      <td className="px-2 py-2 text-center text-[#D0D0D0]">{row.ga}</td>
                      <td className="px-2 py-2 text-center text-[#D0D0D0]">{row.gd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      {!compact && (
        <p className="text-xs text-[#8B8FA8]">
          Ordenado por puntos, desempate directo, diferencia de gol y goles a favor.
        </p>
      )}
    </section>
  )
}
