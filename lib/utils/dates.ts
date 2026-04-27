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

export function timeUntilMatch(matchDate: string | null): string {
  if (!matchDate) return ''
  const diff = new Date(matchDate).getTime() - Date.now()
  if (diff <= 0) return 'En curso / Finalizado'
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return `${Math.floor(diff / 60000)} min`
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}
