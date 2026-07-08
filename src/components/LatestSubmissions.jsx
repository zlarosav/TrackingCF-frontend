'use client'

import { memo, useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { ExternalLink, User, Search, BarChart3 } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { JudgeIcon } from "@/components/JudgeIcon"
import Image from 'next/image'
import Link from 'next/link'
import { useUserHoverTrigger } from '@/components/user-hover-card/useUserHoverTrigger'

const RC = { gray: 'bg-muted-foreground/30', green: 'bg-green-500', cyan: 'bg-cyan-500', blue: 'bg-blue-600', purple: 'bg-purple-600', orange: 'bg-orange-500', red: 'bg-red-600' }
const getColor = (r) => { if (!r) return RC.gray; if (r < 1200) return RC.gray; if (r < 1400) return RC.green; if (r < 1600) return RC.cyan; if (r < 1900) return RC.blue; if (r < 2100) return RC.purple; if (r < 2300) return RC.orange; return RC.red }
const getUrl = (sub) => { const p = String(sub.platform || 'CODEFORCES').toUpperCase(); return p === 'ATCODER' ? `https://atcoder.jp/contests/${sub.contest_id}/tasks/${sub.problem_index}` : `https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}` }
const getCfEq = (sub) => { const tag = (sub.tags || []).find(t => String(t).startsWith('CF_EQ_')); return tag ? tag.replace('CF_EQ_', '~') : null }

const PLATFORM_TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'codeforces', label: 'Codeforces', platform: 'CODEFORCES' },
  { key: 'atcoder', label: 'Atcoder', platform: 'ATCODER' },
]

function SubmissionRow({ sub }) {
  const url = getUrl(sub); const date = new Date(sub.submission_time); const plat = String(sub.platform || 'CODEFORCES').toUpperCase(); const cfEq = getCfEq(sub)
  const hoverProps = useUserHoverTrigger(sub.handle, { handle: sub.handle, avatar_url: sub.avatar_url })
  return (
    <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 transition-colors hover:bg-surface-card">
      <div className={`h-7 w-0.5 shrink-0 rounded-full ${getColor(sub.rating)}`} />
      <div className="flex-1 min-w-0 leading-tight">
        <div className="flex items-center gap-1.5 flex-wrap">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold hover:text-primary transition-colors truncate max-w-[180px] sm:max-w-[280px]" title={sub.problem_name}>{sub.problem_name}</a>
          <JudgeIcon platform={plat} className="h-4 w-4" />
          {sub.rating != null && <span className="text-[10px] sm:text-xs font-mono text-muted">{sub.rating}</span>}
          {cfEq && <span className="text-[10px] sm:text-xs font-mono text-cyan-400 bg-cyan-900/30 px-1.5 rounded-sm">{cfEq}</span>}
          <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted opacity-0 hover:text-primary hover:opacity-100 transition-opacity"><ExternalLink className="h-3 w-3" /></a>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted mt-0.5">
          <Link href={`/user/${sub.handle}`} className="flex items-center gap-1 hover:opacity-80" {...hoverProps}>
            {sub.avatar_url ? <Image src={sub.avatar_url} alt={sub.handle} width={14} height={14} className="h-3.5 w-3.5 rounded-full object-cover" unoptimized /> : <User className="h-3 w-3" />}
            <span className="font-medium">{sub.handle}</span>
          </Link>
          <span>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} {date.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}

function LatestSubmissions({ submissions, loading, sortBy, sortOrder, platformFilter, atcoderEnabled, onPlatformChange, onSortChange }) {
  const PER_PAGE = 10; const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(submissions.length / PER_PAGE))
  const visible = submissions.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  useEffect(() => { setPage(1) }, [submissions.length, platformFilter, sortBy, sortOrder])

  if (loading) return <div className="space-y-1.5 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}</div>
  if (!submissions.length) return <div className="flex flex-col items-center gap-2 py-12 text-center"><Search className="h-8 w-8 text-muted/30" /><p className="text-body-md text-muted">Sin submissions en el periodo</p></div>

  return (
    <div>
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-elevated border-b border-hairline/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-trading-up" />
          <span className="text-body-sm sm:text-body-md font-semibold text-on-surface">Últimos envíos</span>
        </div>
        <span className="text-caption sm:text-body-sm text-muted whitespace-nowrap">{submissions.length} envíos</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline/60 bg-surface-card px-3 sm:px-4 py-2">
        <div className="flex rounded-md border border-hairline/60 bg-surface-elevated p-0.5">
          {PLATFORM_TABS.map(({ key, label, platform, disabled: fixedDisabled }) => {
            const disabled = fixedDisabled || (key === 'atcoder' && !atcoderEnabled)
            return (
              <button key={key} onClick={() => !disabled && onPlatformChange(key)} disabled={disabled}
                className={`flex items-center gap-1 justify-center px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${platformFilter === key ? 'bg-primary text-on-primary' : 'text-muted hover:text-on-surface'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                {platform && <JudgeIcon platform={platform} className="h-3.5 w-3.5" />}
                {label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted hidden sm:inline">Orden:</span>
          {['rating', 'submission_time'].map(f => (
            <button key={f} onClick={() => onSortChange(f, sortBy === f ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc')}
              className={`px-2 py-1 text-xs font-medium rounded-sm transition-all ${sortBy === f ? 'bg-primary text-on-primary' : 'text-muted hover:text-on-surface'}`}>{f === 'rating' ? 'Rating' : 'Fecha'}</button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-hairline/60">
        {visible.map((sub, i) => <SubmissionRow key={sub.id || i} sub={sub} />)}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-hairline/60 px-4 py-2.5">
          <span className="text-xs text-muted">{(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, submissions.length)}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded border border-hairline/60 px-2 py-1 text-xs font-medium hover:bg-surface-elevated disabled:opacity-30">Anterior</button>
            <span className="text-xs text-muted px-1">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded border border-hairline/60 px-2 py-1 text-xs font-medium hover:bg-surface-elevated disabled:opacity-30">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(LatestSubmissions)
