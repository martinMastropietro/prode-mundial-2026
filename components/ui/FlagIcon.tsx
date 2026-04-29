import Image from 'next/image'
import type { Team } from '@/types'

const FLAG_CODES: Record<string, string> = {
  ALG: 'dz',
  ARG: 'ar',
  AUS: 'au',
  AUT: 'at',
  BEL: 'be',
  BIH: 'ba',
  BRA: 'br',
  CAN: 'ca',
  CIV: 'ci',
  COD: 'cd',
  COL: 'co',
  CPV: 'cv',
  CRO: 'hr',
  CUW: 'cw',
  CZE: 'cz',
  ECU: 'ec',
  EGY: 'eg',
  ENG: 'gb-eng',
  ESP: 'es',
  FRA: 'fr',
  GER: 'de',
  GHA: 'gh',
  HAI: 'ht',
  IRN: 'ir',
  IRQ: 'iq',
  JOR: 'jo',
  JPN: 'jp',
  KOR: 'kr',
  KSA: 'sa',
  MAR: 'ma',
  MEX: 'mx',
  NED: 'nl',
  NOR: 'no',
  NZL: 'nz',
  PAN: 'pa',
  PAR: 'py',
  POR: 'pt',
  QAT: 'qa',
  RSA: 'za',
  SCO: 'gb-sct',
  SEN: 'sn',
  SUI: 'ch',
  SWE: 'se',
  TUN: 'tn',
  TUR: 'tr',
  URU: 'uy',
  USA: 'us',
  UZB: 'uz',
}

type Props = {
  team?: Pick<Team, 'code' | 'flag_emoji'> | null
  className?: string
}

export default function FlagIcon({ team, className = '' }: Props) {
  const flagCode = team?.code ? FLAG_CODES[team.code] : undefined
  const src = flagCode ? `https://flagcdn.com/w40/${flagCode}.png` : undefined

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
