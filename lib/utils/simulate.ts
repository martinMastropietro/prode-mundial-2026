import type { Match, Prediction, Team } from '@/types'

export type Standing = {
  team: Team
  mp: number; w: number; d: number; l: number
  gf: number; ga: number; gd: number; pts: number
  groupCode: string
  position?: number
}

export type ProjectedQualifiers = Map<string, Team>
export type MatchProjection = { home: Team | null; away: Team | null }

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

// ─── TIEBREAKER FIFA ──────────────────────────────────────────────────────────

function compareStandings(
  a: Standing, b: Standing, all: Standing[],
  matches: Match[], predictions: Map<string, Prediction>
): number {
  if (b.pts !== a.pts) return b.pts - a.pts
  // Head-to-head entre equipos con mismos puntos
  const h2h = getHeadToHead([a, b], matches, predictions)
  const aH = h2h.get(a.team.id)!
  const bH = h2h.get(b.team.id)!
  if (bH.pts !== aH.pts) return bH.pts - aH.pts
  if (bH.gd  !== aH.gd)  return bH.gd  - aH.gd
  if (bH.gf  !== aH.gf)  return bH.gf  - aH.gf
  // Diferencia/goles generales
  if (b.gd !== a.gd) return b.gd - a.gd
  return b.gf - a.gf
}

function getHeadToHead(
  teams: Standing[], matches: Match[], predictions: Map<string, Prediction>
): Map<string, { pts: number; gd: number; gf: number }> {
  const ids = new Set(teams.map(t => t.team.id))
  const res = new Map<string, { pts: number; gd: number; gf: number }>()
  for (const t of teams) res.set(t.team.id, { pts: 0, gd: 0, gf: 0 })
  for (const m of matches) {
    if (!m.home_team_id || !m.away_team_id) continue
    if (!ids.has(m.home_team_id) || !ids.has(m.away_team_id)) continue
    let hg: number, ag: number
    if (m.status === 'finished' && m.home_score_full !== null && m.away_score_full !== null) {
      hg = m.home_score_full; ag = m.away_score_full
    } else {
      const p = predictions.get(m.id)
      if (!p) continue
      hg = p.predicted_home_score; ag = p.predicted_away_score
    }
    const h = res.get(m.home_team_id)!
    const a = res.get(m.away_team_id)!
    h.gf += hg; h.gd += hg - ag
    a.gf += ag; a.gd += ag - hg
    if (hg > ag)      { h.pts += 3 }
    else if (hg < ag) { a.pts += 3 }
    else              { h.pts++; a.pts++ }
  }
  return res
}

// ─── STANDINGS ────────────────────────────────────────────────────────────────

export function simulateGroupStandings(
  matches: Match[], predictions: Map<string, Prediction>, teams: Team[]
): Map<string, Standing[]> {
  const result = new Map<string, Standing[]>()
  for (const g of GROUPS) {
    const groupTeams = teams.filter(t => t.group_code === g)
    if (!groupTeams.length) continue
    const standings = new Map<string, Standing>()
    for (const t of groupTeams) {
      standings.set(t.id, { team: t, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, groupCode: g })
    }
    const gMatches = matches.filter(m => m.phase === 'group' && m.group_code === g)
    for (const m of gMatches) {
      if (!m.home_team_id || !m.away_team_id) continue
      let hg: number, ag: number
      if (m.status === 'finished' && m.home_score_full !== null && m.away_score_full !== null) {
        hg = m.home_score_full; ag = m.away_score_full
      } else {
        const p = predictions.get(m.id)
        if (!p) continue
        hg = p.predicted_home_score; ag = p.predicted_away_score
      }
      const home = standings.get(m.home_team_id)
      const away = standings.get(m.away_team_id)
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
      .sort((a, b) => compareStandings(a, b, arr, gMatches, predictions))
      .map((s, i) => ({ ...s, position: i + 1 }))
    result.set(g, sorted)
  }
  return result
}

// ─── BRACKET SLOT MAPS ────────────────────────────────────────────────────────

// R32: match_number → [home_slot, away_slot]
export const R32_BRACKET: Record<number, [string, string]> = {
  73: ['2A',    '2B'],
  74: ['1E',    '3rd-1'],   // 3° de A/B/C/D/F
  75: ['1F',    '2C'],
  76: ['1C',    '2F'],
  77: ['1I',    '3rd-2'],   // 3° de C/D/F/G/H
  78: ['2E',    '2I'],
  79: ['1A',    '3rd-3'],   // 3° de C/E/F/H/I
  80: ['1L',    '3rd-4'],   // 3° de E/H/I/J/K
  81: ['1D',    '3rd-5'],   // 3° de B/E/F/I/J
  82: ['1G',    '3rd-6'],   // 3° de A/E/H/I/J
  83: ['2K',    '2L'],
  84: ['1H',    '2J'],
  85: ['1B',    '3rd-7'],   // 3° de E/F/G/I/J
  86: ['1J',    '2H'],
  87: ['1K',    '3rd-8'],   // 3° de D/E/I/J/L
  88: ['2D',    '2G'],
}

// Donde va el GANADOR de cada partido de eliminatorias
export const BRACKET_WINNER: Record<number, { match: number; slot: 'home' | 'away' }> = {
  // R32 → R16
  73: { match: 90, slot: 'home' }, 75: { match: 90, slot: 'away' },
  74: { match: 89, slot: 'home' }, 77: { match: 89, slot: 'away' },
  76: { match: 91, slot: 'home' }, 78: { match: 91, slot: 'away' },
  79: { match: 92, slot: 'home' }, 80: { match: 92, slot: 'away' },
  81: { match: 94, slot: 'home' }, 82: { match: 94, slot: 'away' },
  83: { match: 93, slot: 'home' }, 84: { match: 93, slot: 'away' },
  85: { match: 96, slot: 'home' }, 87: { match: 96, slot: 'away' },
  86: { match: 95, slot: 'home' }, 88: { match: 95, slot: 'away' },
  // R16 → QF
  89: { match: 97, slot: 'home' }, 90: { match: 97, slot: 'away' },
  91: { match: 99, slot: 'home' }, 92: { match: 99, slot: 'away' },
  93: { match: 98, slot: 'home' }, 94: { match: 98, slot: 'away' },
  95: { match: 100, slot: 'home' }, 96: { match: 100, slot: 'away' },
  // QF → SF
  97: { match: 101, slot: 'home' }, 98: { match: 101, slot: 'away' },
  99: { match: 102, slot: 'home' }, 100: { match: 102, slot: 'away' },
  // SF → Final
  101: { match: 104, slot: 'home' }, 102: { match: 104, slot: 'away' },
}

// Donde va el PERDEDOR (solo semis → 3er puesto)
const BRACKET_LOSER: Record<number, { match: number; slot: 'home' | 'away' }> = {
  101: { match: 103, slot: 'home' },
  102: { match: 103, slot: 'away' },
}

export const SLOT_LABELS: Record<string, string> = {
  '1A':'1° Grupo A','2A':'2° Grupo A','1B':'1° Grupo B','2B':'2° Grupo B',
  '1C':'1° Grupo C','2C':'2° Grupo C','1D':'1° Grupo D','2D':'2° Grupo D',
  '1E':'1° Grupo E','2E':'2° Grupo E','1F':'1° Grupo F','2F':'2° Grupo F',
  '1G':'1° Grupo G','2G':'2° Grupo G','1H':'1° Grupo H','2H':'2° Grupo H',
  '1I':'1° Grupo I','2I':'2° Grupo I','1J':'1° Grupo J','2J':'2° Grupo J',
  '1K':'1° Grupo K','2K':'2° Grupo K','1L':'1° Grupo L','2L':'2° Grupo L',
  '3rd-1':'3° Mejor (A/B/C/D/F)','3rd-2':'3° Mejor (C/D/F/G/H)',
  '3rd-3':'3° Mejor (C/E/F/H/I)','3rd-4':'3° Mejor (E/H/I/J/K)',
  '3rd-5':'3° Mejor (B/E/F/I/J)','3rd-6':'3° Mejor (A/E/H/I/J)',
  '3rd-7':'3° Mejor (E/F/G/I/J)','3rd-8':'3° Mejor (D/E/I/J/L)',
}

// ─── QUALIFIERS ───────────────────────────────────────────────────────────────

export function buildProjectedQualifiers(standings: Map<string, Standing[]>): ProjectedQualifiers {
  const q = new Map<string, Team>()
  for (const [g, rows] of standings) {
    if (rows[0]?.mp > 0) q.set(`1${g}`, rows[0].team)
    if (rows[1]?.mp > 0) q.set(`2${g}`, rows[1].team)
  }
  const thirds = Array.from(standings.values())
    .map(rows => rows[2]).filter(s => s?.mp > 0)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd  !== a.gd)  return b.gd  - a.gd
      return b.gf - a.gf
    }).slice(0, 8)
  thirds.forEach((s, i) => { if (s?.team) q.set(`3rd-${i + 1}`, s.team) })
  return q
}

// ─── FULL BRACKET PROJECTION ──────────────────────────────────────────────────

export function buildFullBracketProjection(
  qualifiers: ProjectedQualifiers,
  matches: Match[],
  predictions: Map<string, Prediction>
): Map<number, MatchProjection> {
  const proj = new Map<number, MatchProjection>()
  const byNum = new Map(matches.map(m => [m.match_number, m]))

  // Inicializar R32 con clasificados del grupo
  for (const [num, [hs, as_]] of Object.entries(R32_BRACKET)) {
    proj.set(Number(num), {
      home: qualifiers.get(hs) ?? null,
      away: qualifiers.get(as_) ?? null,
    })
  }

  // Propagar resultado por el bracket en orden
  const rounds = [
    Object.keys(R32_BRACKET).map(Number),
    [89,90,91,92,93,94,95,96],
    [97,98,99,100],
    [101,102],
  ]

  for (const round of rounds) {
    for (const num of round) {
      const p = proj.get(num)
      if (!p?.home || !p?.away) continue
      const match = byNum.get(num)
      if (!match) continue
      // Usar resultado real si ya terminó
      let hg: number, ag: number, penWinner: string | null | undefined = null
      if (match.status === 'finished' && match.home_score_full !== null && match.away_score_full !== null) {
        hg = match.home_score_full; ag = match.away_score_full
        penWinner = match.penalty_winner
      } else {
        const pred = predictions.get(match.id)
        if (!pred) continue
        hg = pred.predicted_home_score; ag = pred.predicted_away_score
        penWinner = pred.predicted_penalty_winner
      }

      let winner: Team | null = null
      let loser: Team | null = null
      if (hg > ag)               { winner = p.home; loser = p.away }
      else if (ag > hg)          { winner = p.away; loser = p.home }
      else if (penWinner === 'home') { winner = p.home; loser = p.away }
      else if (penWinner === 'away') { winner = p.away; loser = p.home }
      else continue // Empate sin penales definidos → no propagar

      const winNext = BRACKET_WINNER[num]
      if (winNext && winner) {
        const cur = proj.get(winNext.match) ?? { home: null, away: null }
        proj.set(winNext.match, winNext.slot === 'home'
          ? { ...cur, home: winner }
          : { ...cur, away: winner })
      }

      const loseNext = BRACKET_LOSER[num]
      if (loseNext && loser) {
        const cur = proj.get(loseNext.match) ?? { home: null, away: null }
        proj.set(loseNext.match, loseNext.slot === 'home'
          ? { ...cur, home: loser }
          : { ...cur, away: loser })
      }
    }
  }

  return proj
}
