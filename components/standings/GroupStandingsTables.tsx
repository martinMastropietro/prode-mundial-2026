import type { Standing } from '@/lib/utils/simulate'

type Props = {
  standings: Map<string, Standing[]>
  title?: string
  compact?: boolean
  groupFilter?: string | null
}

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

function qualificationClass(index: number) {
  if (index < 2) return 'bg-[#00E83A]/15'
  if (index === 2) return 'bg-[#16A9E8]/15'
  return ''
}

function positionClass(index: number) {
  if (index < 2) return 'bg-[#00E83A] text-white'
  if (index === 2) return 'bg-[#16A9E8] text-white'
  return 'text-[#8B8FA8]'
}

export default function GroupStandingsTables({ standings, title, compact = false, groupFilter }: Props) {
  const groups = GROUPS
    .filter(group => !groupFilter || group === groupFilter)
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
              <table className="w-full min-w-[640px] table-fixed text-sm">
                <colgroup>
                  <col className="w-12" />
                  <col />
                  <col className="w-16" />
                  <col className="w-16" />
                  <col className="w-16" />
                  <col className="w-16" />
                  <col className="w-16" />
                  <col className="w-16" />
                  <col className="w-16" />
                  <col className="w-16" />
                </colgroup>
                <thead>
                  <tr className="text-[#8B8FA8] border-b border-[#2A2D4A]">
                    <th className="px-3 py-2 text-left">#</th>
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
                      className={`border-b border-[#2A2D4A]/40 last:border-0 ${qualificationClass(index)}`}
                    >
                      <td className="px-3 py-2">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-black ${positionClass(index)}`}>
                          {index + 1}
                        </span>
                      </td>
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
            <div className="grid gap-2 border-t border-[#2A2D4A] px-4 py-3 text-xs font-bold text-white sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#00E83A]" />
                <span>Clasificado a 16avos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#16A9E8]" />
                <span>Posible clasificado</span>
              </div>
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
