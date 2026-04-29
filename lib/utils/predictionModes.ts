import type { MatchPhase } from '@/types'

export type PredictionMode = 'phase_by_phase' | 'full_bracket' | 'hybrid'

export const PREDICTION_MODE_LABELS: Record<PredictionMode, string> = {
  phase_by_phase: 'Fase por fase, la clásica',
  full_bracket: 'Cuadro completo',
  hybrid: 'Híbrido',
}

export const PREDICTION_MODE_DESCRIPTIONS: Record<PredictionMode, string> = {
  phase_by_phase: 'Primero grupos; después cada fase se abre con cruces oficiales.',
  full_bracket: 'La modalidad actual: se predice todo el cuadro completo.',
  hybrid: 'Cuadro pre-torneo con más puntaje, y luego votaciones complementarias por fase.',
}

const MODE_OPTIONS: PredictionMode[] = ['phase_by_phase', 'full_bracket', 'hybrid']
export const PREDICTION_MODE_OPTIONS = MODE_OPTIONS.map((value) => ({
  value,
  label: PREDICTION_MODE_LABELS[value],
  description: PREDICTION_MODE_DESCRIPTIONS[value],
}))

const PHASE_WINDOWS: Record<MatchPhase, { open: string; close: string }> = {
  group: { open: '2026-01-01T00:00:00Z', close: '2026-06-11T00:00:00Z' },
  round_of_32: { open: '2026-06-27T03:00:00Z', close: '2026-06-28T00:00:00Z' },
  round_of_16: { open: '2026-07-03T03:00:00Z', close: '2026-07-04T00:00:00Z' },
  quarterfinal: { open: '2026-07-08T03:00:00Z', close: '2026-07-09T00:00:00Z' },
  semifinal: { open: '2026-07-13T03:00:00Z', close: '2026-07-14T00:00:00Z' },
  third_place: { open: '2026-07-17T03:00:00Z', close: '2026-07-18T00:00:00Z' },
  final: { open: '2026-07-18T03:00:00Z', close: '2026-07-19T00:00:00Z' },
}

const PRE_TOURNAMENT_LOCK = '2026-06-11T00:00:00Z'

export function normalizePredictionMode(value: unknown): PredictionMode {
  return MODE_OPTIONS.includes(value as PredictionMode) ? value as PredictionMode : 'phase_by_phase'
}

export function isPredictionOpenForMode(
  mode: PredictionMode,
  phase: MatchPhase,
  matchDate: string | null,
  status: string,
  phaseCloseDate?: string | null,
  now = new Date()
) {
  if (status !== 'scheduled') return false

  if (mode === 'phase_by_phase') {
    const window = PHASE_WINDOWS[phase]
    const closeAt = phaseCloseDate ?? window.close
    return now >= new Date(window.open) && now < new Date(closeAt)
  }

  if (mode === 'hybrid') {
    return now < new Date(PRE_TOURNAMENT_LOCK)
  }

  if (!matchDate) return true
  return new Date(matchDate) > now
}

export function predictionClosedMessage(mode: PredictionMode, phase: MatchPhase) {
  if (mode === 'phase_by_phase') {
    const window = PHASE_WINDOWS[phase]
    return `Esta fase se puede predecir entre ${new Date(window.open).toLocaleDateString('es-AR')} y ${new Date(window.close).toLocaleDateString('es-AR')}.`
  }
  if (mode === 'hybrid') return 'El cuadro pre-torneo se cerró al comenzar el Mundial.'
  return 'El partido ya está cerrado.'
}
