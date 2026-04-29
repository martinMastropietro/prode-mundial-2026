const TZ = 'America/Buenos_Aires'

export function formatMatchDate(dateStr: string | null): string {
  if (!dateStr) return 'Por confirmar'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-AR', {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isMatchClosed(matchDate: string | null, status: string): boolean {
  if (status !== 'scheduled') return true
  if (!matchDate) return false
  return new Date(matchDate) <= new Date()
}

// Detecta "en vivo" por tiempo cuando el admin no lo marcó todavía
// Considera en vivo entre el inicio y +150 minutos (incluye prórroga y penales)
export function isMatchAutoLive(matchDate: string | null, status: string): boolean {
  if (status === 'live') return true
  if (status !== 'scheduled' || !matchDate) return false
  const now = Date.now()
  const start = new Date(matchDate).getTime()
  const minutesSince = (now - start) / 60000
  return minutesSince >= 0 && minutesSince < 150
}

export type DisplayStatus = 'open' | 'live' | 'finished' | 'cancelled' | 'closed'

export function getDisplayStatus(matchDate: string | null, status: string): DisplayStatus {
  if (status === 'finished') return 'finished'
  if (status === 'cancelled') return 'cancelled'
  if (status === 'live') return 'live'
  if (!matchDate) return 'open'
  const now = Date.now()
  const start = new Date(matchDate).getTime()
  const minutesSince = (now - start) / 60000
  if (minutesSince >= 0 && minutesSince < 150) return 'live'
  if (minutesSince >= 150) return 'closed'
  return 'open'
}

export function timeUntilMatch(matchDate: string | null): string {
  if (!matchDate) return ''
  const diff = new Date(matchDate).getTime() - Date.now()
  if (diff <= 0) return 'En curso / Finalizado'
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return `${Math.floor(diff / 60000)} min`
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}
