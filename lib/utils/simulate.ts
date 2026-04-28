import type { Match, Prediction, Team } from '@/types'

export type Standing = {
  team: Team
  mp: number; w: number; d: number; l: number
  gf: number; ga: number; gd: number; pts: number
  groupCode: string
  position?: number
}

export type ProjectedQualifiers = Map<string, Team> // key: "1A", "2B", "3rd-1", etc.

export function simulateGroupStandings(
  matches: Match[],
  predictions: Map<string, Prediction>,
  teams: Team[]
): Map<string, Standing[]> {
  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const result = new Map<string, Standing[]>()

  for (const g of groups) {
    const groupTeams = teams.filter(t => t.group_code === g)
    if (!groupTeams.length) continue

    const standings = new Map<string, Standing>()
    for (const t of groupTeams) {
      standings.set(t.id, { team: t, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, groupCode: g })
    }

    const groupMatches = matches.filter(m => m.phase === 'group' && m.group_code === g)

    for (const match of groupMatches) {
      if (!match.home_team_id || !match.away_team_id) continue

      let hg: number, ag: number

      if (match.status === 'finished' && match.home_score_full !== null && match.away_score_full !== null) {
        hg = match.home_score_full
        ag = match.away_score_full
      } else {
        const pred = predictions.get(match.id)
        if (!pred) continue
        hg = pred.predicted_home_score
        ag = pred.predicted_away_score
      }

      const home = standings.get(match.home_team_id)
      const away = standings.get(match.away_team_id)
      if (!home || !away) continue

      home.mp++; away.mp++
      home.gf += hg; home.ga += ag; home.gd += hg - ag
      away.gf += ag; away.ga += hg; away.gd += ag - hg

      if (hg > ag) { home.w++; home.pts += 3; away.l++ }
      else if (hg < ag) { away.w++; away.pts += 3; home.l++ }
      else { home.d++; home.pts++; away.d++; away.pts++ }
    }

    const sorted = Array.from(standings.values()).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      return b.gf - a.gf
    }).map((s, i) => ({ ...s, position: i + 1 }))

    result.set(g, sorted)
  }

  return result
}

// Mapeo R32: match_number → [slot_local, slot_visitante]
// Aproximación del bracket FIFA 2026 (estructura oficial TBD)
export const R32_BRACKET: Record<number, [string, string]> = {
  73:  ['1A', '2B'],
  74:  ['1C', '2D'],
  75:  ['1E', '2F'],
  76:  ['1G', '2H'],
  77:  ['1I', '2J'],
  78:  ['1K', '2L'],
  79:  ['1B', '2A'],
  80:  ['1D', '2C'],
  81:  ['1F', '2E'],
  82:  ['1H', '2G'],
  83:  ['1J', '2I'],
  84:  ['1L', '2K'],
  85:  ['3rd-1', '3rd-2'],
  86:  ['3rd-3', '3rd-4'],
  87:  ['3rd-5', '3rd-6'],
  88:  ['3rd-7', '3rd-8'],
}

export function buildProjectedQualifiers(
  standings: Map<string, Standing[]>
): ProjectedQualifiers {
  const qualifiers = new Map<string, Team>()

  for (const [g, rows] of standings) {
    if (rows[0]?.team && rows[0].mp > 0) qualifiers.set(`1${g}`, rows[0].team)
    if (rows[1]?.team && rows[1].mp > 0) qualifiers.set(`2${g}`, rows[1].team)
  }

  // Best 8 third-place teams
  const thirds = Array.from(standings.values())
    .map(rows => rows[2])
    .filter(Boolean)
    .filter(s => s.mp > 0)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      return b.gf - a.gf
    })
    .slice(0, 8)

  thirds.forEach((s, i) => {
    if (s?.team) qualifiers.set(`3rd-${i + 1}`, s.team)
  })

  return qualifiers
}
