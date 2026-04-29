import Image from 'next/image'
import type { Team } from '@/types'

const FLAG_IMAGES: Record<string, string> = {
  MEX: 'https://flagcdn.com/w40/mx.png',
  RSA: 'https://flagcdn.com/w40/za.png',
}

type Props = {
  team?: Pick<Team, 'code' | 'flag_emoji'> | null
  className?: string
}

export default function FlagIcon({ team, className = '' }: Props) {
  const src = team?.code ? FLAG_IMAGES[team.code] : undefined

  if (!src) {
    return (
      <span className={`inline-flex leading-none ${className}`}>
        {team?.flag_emoji ?? '🏳️'}
      </span>
    )
  }

  return (
    <span className={`relative inline-flex h-4 w-6 overflow-hidden rounded-[2px] border border-white/20 shadow-sm ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        sizes="24px"
        className="object-cover"
      />
    </span>
  )
}
