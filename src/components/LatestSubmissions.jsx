'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { ExternalLink, User, Search } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image'
import Link from 'next/link'

const RC = { gray: 'bg-muted-foreground/30', green: 'bg-green-500', cyan: 'bg-cyan-500', blue: 'bg-blue-600', purple: 'bg-purple-600', orange: 'bg-orange-500', red: 'bg-red-600' }
const getColor = (r) => { if (!r) return RC.gray; if (r < 1200) return RC.gray; if (r < 1400) return RC.green; if (r < 1600) return RC.cyan; if (r < 1900) return RC.blue; if (r < 2100) return RC.purple; if (r < 2300) return RC.orange; return RC.red }

export default function LatestSubmissions({ submissions, loading, sortBy, sortOrder, platformFilter, atcoderEnabled, onPlatformChange, onSortChange }) {
  const PER_PAGE = 10; const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(submissions.length / PER_PAGE))
  const visible = submissions.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  useEffect(() => { setPage(1) }, [submissions.length, platformFilter, sortBy, sortOrder])

  const getUrl = (sub) => { const p = String(sub.platform || 'CODEFORCES').toUpperCase(); return p === 'ATCODER' ? `https://atcoder.jp/contests/${sub.contest_id}/tasks/${sub.problem_index}` : `https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}` }
  const getCfEq = (sub) => { const tag = (sub.tags || []).find(t => String(t).startsWith('CF_EQ_')); return tag ? tag.replace('CF_EQ_', '~') : null }

  if (loading) return <div className="space-y-1.5 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}</div>
  if (!submissions.length) return <div className="flex flex-col items-center gap-2 py-12 text-center"><Search className="h-8 w-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">Sin submissions en el periodo</p></div>

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b border-border/20 bg-muted/10 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submissions</span>
          <div className="flex rounded-md border border-border/30 bg-muted/30 p-0.5">
            {[{ key: 'all', label: 'Todas' }, { key: 'codeforces', label: 'CF' }, { key: 'atcoder', label: 'AC', disabled: !atcoderEnabled }].map(({ key, label, disabled }) => (
              <button key={key} onClick={() => !disabled && onPlatformChange(key)} disabled={disabled}
                className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${platformFilter === key ? 'bg-white text-foreground shadow-sm dark:bg-primary dark:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground hidden sm:inline">Orden:</span>
          {['rating', 'submission_time'].map(f => (
            <button key={f} onClick={() => onSortChange(f, sortBy === f ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc')}
              className={`px-2 py-1 text-xs font-medium rounded-sm transition-all ${sortBy === f ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>{f === 'rating' ? 'Rating' : 'Fecha'}</button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border/10">
        {visible.map((sub, i) => {
          const url = getUrl(sub); const date = new Date(sub.submission_time); const plat = String(sub.platform || 'CODEFORCES').toUpperCase(); const cfEq = getCfEq(sub)
          return (
            <div key={sub.id || i} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/15">
              <div className={`h-7 w-0.5 shrink-0 rounded-full ${getColor(sub.rating)}`} />
              <div className="flex-1 min-w-0 leading-tight">
                <div className="flex items-center gap-2">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:text-primary transition-colors truncate max-w-[280px]" title={sub.problem_name}>{sub.problem_name}</a>
                  <span className={`text-[11px] font-mono font-medium px-1.5 rounded-sm ${plat === 'ATCODER' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'}`}>{plat}</span>
                  {sub.rating != null && <span className="text-xs font-mono text-muted-foreground">{sub.rating}</span>}
                  {cfEq && <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 px-1.5 rounded-sm">{cfEq}</span>}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground opacity-0 hover:text-primary hover:opacity-100 transition-opacity"><ExternalLink className="h-3 w-3" /></a>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground mt-0.5">
                  <Link href={`/user/${sub.handle}`} className="flex items-center gap-1 hover:opacity-80">
                    {sub.avatar_url ? <Image src={sub.avatar_url} alt={sub.handle} width={14} height={14} className="h-3.5 w-3.5 rounded-full object-cover" unoptimized /> : <User className="h-3 w-3" />}
                    <span className="font-medium">{sub.handle}</span>
                  </Link>
                  <span>{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} {date.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/20 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">{(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, submissions.length)}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded border border-border/30 px-2 py-1 text-xs font-medium hover:bg-muted/50 disabled:opacity-30">Anterior</button>
            <span className="text-xs text-muted-foreground px-1">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded border border-border/30 px-2 py-1 text-xs font-medium hover:bg-muted/50 disabled:opacity-30">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  )
}
