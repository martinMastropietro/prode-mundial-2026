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
// Fuente: fixture oficial FIFA 2026
export const R32_BRACKET: Record<number, [string, string]> = {
  73: ['2A', '2B'],
  74: ['1E', '3rd'],   // 3° mejor de A/B/C/D/F
  75: ['1F', '2C'],
  76: ['1C', '2F'],
  77: ['1I', '3rd'],   // 3° mejor de C/D/F/G/H
  78: ['2E', '2I'],
  79: ['1A', '3rd'],   // 3° mejor de C/E/F/H/I
  80: ['1L', '3rd'],   // 3° mejor de E/H/I/J/K
  81: ['1D', '3rd'],   // 3° mejor de B/E/F/I/J
  82: ['1G', '3rd'],   // 3° mejor de A/E/H/I/J
  83: ['2K', '2L'],
  84: ['1H', '2J'],
  85: ['1B', '3rd'],   // 3° mejor de E/F/G/I/J
  86: ['1J', '2H'],
  87: ['1K', '3rd'],   // 3° mejor de D/E/I/J/L
  88: ['2D', '2G'],
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
