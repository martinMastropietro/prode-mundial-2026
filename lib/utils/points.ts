export type MatchResult = 'H' | 'D' | 'A'

export function getResult(home: number, away: number): MatchResult {
  if (home > away) return 'H'
  if (home < away) return 'A'
  return 'D'
}

export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  realHome: number,
  realAway: number
): number {
  if (predictedHome === realHome && predictedAway === realAway) return 5
  if (getResult(predictedHome, predictedAway) === getResult(realHome, realAway)) return 3
  return 0
}

export const SPECIAL_POINTS = {
  champion: 15,
  runnerUp: 10,
  thirdPlace: 5,
} as const

export const PHASE_LABELS: Record<string, string> = {
  group: 'Fase de grupos',
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de final',
  quarterfinal: 'Cuartos de final',
  semifinal: 'Semifinal',
  third_place: 'Tercer puesto',
  final: 'Final',
}
