import type { Match, Prediction, Team } from '@/types'

export type Standing = {
  team: Team
  mp: number; w: number; d: number; l: number
  gf: number; ga: number; gd: number; pts: number
  groupCode: string
  position?: number
}

export type ProjectedQualifiers = Map<string, Team> // key: "1A", "2B", "3rd-1", etc.

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// Tiebreaker FIFA (simplificado: no incluye tarjetas ni ranking FIFA)
function compareStandings(a: Standing, b: Standing, all: Standing[], matches: Match[], predictions: Map<string, Prediction>): number {
  if (b.pts !== a.pts) return b.pts - a.pts

  // Head-to-head entre equipos empatados
  const tiedTeams = all.filter(s => s.pts === a.pts)
  if (tiedTeams.length >= 2) {
    const h2h = getHeadToHead([a, b], matches, predictions)
    const aH2H = h2h.get(a.team.id)
    const bH2H = h2h.get(b.team.id)
    if (aH2H && bH2H) {
      if (bH2H.pts !== aH2H.pts) return bH2H.pts - aH2H.pts
      if (bH2H.gd  !== aH2H.gd)  return bH2H.gd  - aH2H.gd
      if (bH2H.gf  !== aH2H.gf)  return bH2H.gf  - aH2H.gf
    }
  }

  // Diferencia de goles general
  if (b.gd !== a.gd) return b.gd - a.gd
  // Goles marcados general
  if (b.gf !== a.gf) return b.gf - a.gf
  return 0
}

function getHeadToHead(
  teams: Standing[],
  matches: Match[],
  predictions: Map<string, Prediction>
): Map<string, { pts: number; gd: number; gf: number }> {
  const ids = new Set(teams.map(t => t.team.id))
  const result = new Map<string, { pts: number; gd: number; gf: number }>()
  for (const t of teams) result.set(t.team.id, { pts: 0, gd: 0, gf: 0 })

  for (const match of matches) {
    if (!match.home_team_id || !match.away_team_id) continue
    if (!ids.has(match.home_team_id) || !ids.has(match.away_team_id)) continue

    let hg: number, ag: number
    if (match.status === 'finished' && match.home_score_full !== null && match.away_score_full !== null) {
      hg = match.home_score_full; ag = match.away_score_full
    } else {
      const pred = predictions.get(match.id)
      if (!pred) continue
      hg = pred.predicted_home_score; ag = pred.predicted_away_score
    }

    const h = result.get(match.home_team_id)!
    const a = result.get(match.away_team_id)!
    h.gf += hg; h.gd += hg - ag
    a.gf += ag; a.gd += ag - hg
    if (hg > ag) { h.pts += 3 }
    else if (hg < ag) { a.pts += 3 }
    else { h.pts += 1; a.pts += 1 }
  }
  return result
}

export function simulateGroupStandings(
  matches: Match[],
  predictions: Map<string, Prediction>,
  teams: Team[]
): Map<string, Standing[]> {
  const result = new Map<string, Standing[]>()

  for (const g of GROUPS) {
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
        hg = match.home_score_full; ag = match.away_score_full
      } else {
        const pred = predictions.get(match.id)
        if (!pred) continue
        hg = pred.predicted_home_score; ag = pred.predicted_away_score
      }

      const home = standings.get(match.home_team_id)
      const away = standings.get(match.away_team_id)
      if (!home || !away) continue

      home.mp++; away.mp++
      home.gf += hg; home.ga += ag; home.gd += hg - ag
      away.gf += ag; away.ga += hg; away.gd += ag - hg

      if (hg > ag)      { home.w++; home.pts += 3; away.l++ }
      else if (hg < ag) { away.w++; away.pts += 3; home.l++ }
      else              { home.d++; home.pts++;     away.d++; away.pts++ }
    }

    const arr = Array.from(standings.values())
    const sorted = arr
      .sort((a, b) => compareStandings(a, b, arr, groupMatches, predictions))
      .map((s, i) => ({ ...s, position: i + 1 }))

    result.set(g, sorted)
  }

  return result
}

// Slot map FIFA 2026 Round of 32 (oficial)
export const R32_BRACKET: Record<number, [string, string]> = {
  73: ['2A', '2B'],
  74: ['1E', '3rd'],
  75: ['1F', '2C'],
  76: ['1C', '2F'],
  77: ['1I', '3rd'],
  78: ['2E', '2I'],
  79: ['1A', '3rd'],
  80: ['1L', '3rd'],
  81: ['1D', '3rd'],
  82: ['1G', '3rd'],
  83: ['2K', '2L'],
  84: ['1H', '2J'],
  85: ['1B', '3rd'],
  86: ['1J', '2H'],
  87: ['1K', '3rd'],
  88: ['2D', '2G'],
}

// Nombres legibles para cada slot
export const SLOT_LABELS: Record<string, string> = {
  '1A':'1° Grupo A','2A':'2° Grupo A',
  '1B':'1° Grupo B','2B':'2° Grupo B',
  '1C':'1° Grupo C','2C':'2° Grupo C',
  '1D':'1° Grupo D','2D':'2° Grupo D',
  '1E':'1° Grupo E','2E':'2° Grupo E',
  '1F':'1° Grupo F','2F':'2° Grupo F',
  '1G':'1° Grupo G','2G':'2° Grupo G',
  '1H':'1° Grupo H','2H':'2° Grupo H',
  '1I':'1° Grupo I','2I':'2° Grupo I',
  '1J':'1° Grupo J','2J':'2° Grupo J',
  '1K':'1° Grupo K','2K':'2° Grupo K',
  '1L':'1° Grupo L','2L':'2° Grupo L',
  '3rd':'3° Mejor',
}

export function buildProjectedQualifiers(
  standings: Map<string, Standing[]>
): ProjectedQualifiers {
  const qualifiers = new Map<string, Team>()

  for (const [g, rows] of standings) {
    if (rows[0]?.team && rows[0].mp > 0) qualifiers.set(`1${g}`, rows[0].team)
    if (rows[1]?.team && rows[1].mp > 0) qualifiers.set(`2${g}`, rows[1].team)
  }

  // 8 mejores terceros según criterios FIFA
  const thirds: Standing[] = []
  for (const rows of standings.values()) {
    if (rows[2]?.mp > 0) thirds.push(rows[2])
  }

  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd  !== a.gd)  return b.gd  - a.gd
    return b.gf - a.gf
  })

  thirds.slice(0, 8).forEach((s, i) => {
    qualifiers.set(`3rd-${i + 1}`, s.team)
  })

  // El "3rd" genérico apunta al mejor tercero disponible
  if (thirds[0]?.team) qualifiers.set('3rd', thirds[0].team)

  return qualifiers
}
