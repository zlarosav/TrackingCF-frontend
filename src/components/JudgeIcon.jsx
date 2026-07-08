import Image from 'next/image'

const ICONS = {
  CODEFORCES: '/codeforces.svg',
  ATCODER: '/atcoder.svg',
  LEETCODE: '/leetcode.svg',
  CODECHEF: '/codechef.svg',
}

export function JudgeIcon({ platform, className = "h-3.5 w-3.5" }) {
  const p = String(platform || 'CODEFORCES').toUpperCase()
  const src = ICONS[p] || ICONS.CODEFORCES
  return (
    <Image src={src} alt={p} width={16} height={16} className={`shrink-0 object-contain ${className}`} unoptimized />
  )
}
