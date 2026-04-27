const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generatePublicId(): string {
  let id = 'WC26-'
  for (let i = 0; i < 6; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return id
}
