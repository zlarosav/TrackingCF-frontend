'use client'

import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, User, Calendar, TrendingUp } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function ContestsPage() {
  const [allContests, setAllContests] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [expandedContest, setExpandedContest] = useState(null)
  const [participantsByContest, setParticipantsByContest] = useState({})
  const [loadingParticipants, setLoadingParticipants] = useState({})
  const [now, setNow] = useState(DateTime.now())

  // El tick de 1 s solo alimenta el contador regresivo (display).
  useEffect(() => { fetchContests(); apiClient.checkFreshness(); const t = setInterval(() => setNow(DateTime.now()), 1000); return () => clearInterval(t) }, [])
  // La partición upcoming/past (filtro + orden de toda la lista) solo se recalcula
  // por minuto y ante cambios de filtro/data — no cada segundo.
  const nowMinute = Math.floor(now.toSeconds() / 60)
  useEffect(() => { if (allContests.length) applyFilters() }, [filter, allContests, nowMinute])

  const fetchContests = async () => {
    try { const r = await apiClient.getContests(); if (r.success) { setAllContests(r.data); if (r.lastUpdated) setLastUpdated(r.lastUpdated) } } catch (_) {} finally { setLoading(false) }
  }
  const applyFilters = () => {
    let filtered = allContests; if (filter !== 'ALL') filtered = filtered.filter(c => c.platform === filter)
    const nowSec = now.toSeconds(); const ten = 10 * 24 * 3600
    const cur = filtered.filter(c => { const d = c.durationSeconds > 3e9 ? 0 : c.durationSeconds; return (c.startTimeSeconds + d > nowSec) && c.startTimeSeconds < (nowSec + ten) }).sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    const fin = filtered.filter(c => (c.startTimeSeconds + (c.durationSeconds > 3e9 ? 0 : c.durationSeconds) <= nowSec)).sort((a, b) => b.startTimeSeconds - a.startTimeSeconds)
    setUpcoming(cur.slice(0, 20)); setPast(fin.slice(0, 10))
  }
  const fmtDur = (s) => { const d = s > 3e9 ? 0 : s; return `${Math.floor(d / 3600)}h ${Math.floor((d % 3600) / 60)}m` }
  const getTimeLeft = (start, dur) => { const end = DateTime.fromSeconds(start).plus({ seconds: dur > 3e9 ? 0 : dur }); if (now >= DateTime.fromSeconds(start) && now < end) return 'En curso'; if (now >= end) return 'Finalizado'; const d = DateTime.fromSeconds(start).diff(now, ['days','hours','minutes','seconds']); if (d.milliseconds < 0) return 'En curso'; return [d.days > 0 && `${d.days}d`, d.hours > 0 && `${d.hours}h`, d.minutes > 0 && `${d.minutes}m`, `${Math.floor(d.seconds)}s`].filter(Boolean).join(' ') }
  const getPI = (p) => { const v = (p || '').toLowerCase(); if (v === 'codeforces') return '/codeforces.svg'; if (v === 'leetcode') return '/leetcode.svg'; if (v === 'atcoder') return '/atcoder.svg'; if (v === 'codechef') return '/codechef.svg'; return null }
  const getLink = (c) => { const p = String(c.platform || 'CODEFORCES').toUpperCase(); const id = c.id || c.contestId; if (p === 'LEETCODE') return `https://leetcode.com/contest/${id}`; if (p === 'ATCODER') return `https://atcoder.jp/contests/${id}`; if (p === 'CODECHEF') return `https://www.codechef.com/${id}`; return `https://codeforces.com/contests/${id}` }
  const getKey = c => `${c.platform || 'CODEFORCES'}:${c.id || c.contestId}`

  const toggleP = async (contest) => {
    const k = getKey(contest); if (expandedContest === k) { setExpandedContest(null); return }; setExpandedContest(k)
    if (participantsByContest[k]) return; setLoadingParticipants(p => ({ ...p, [k]: true }))
    try { const r = await apiClient.getContestParticipants(contest.platform || 'CODEFORCES', contest.id || contest.contestId); setParticipantsByContest(p => ({ ...p, [k]: r.success ? (r.data || []) : [] })) } catch (_) { setParticipantsByContest(p => ({ ...p, [k]: [] })) } finally { setLoadingParticipants(p => ({ ...p, [k]: false })) }
  }

  if (loading) return <div className="flex items-center justify-center h-[40vh]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div><h1 className="text-display-sm text-on-surface">Contests</h1>{lastUpdated && <p className="text-caption text-muted mt-0.5"><Calendar className="inline h-3 w-3 mr-0.5" />Actualizado: {DateTime.fromISO(lastUpdated).setZone('America/Lima').setLocale('es').toFormat('dd LLL HH:mm')}</p>}</div>
        <div className="flex rounded-lg bg-surface-card border border-hairline/60 p-0.5">
          {['ALL','CODEFORCES','LEETCODE','ATCODER','CODECHEF'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-body-md font-medium rounded-md transition-all ${filter === f ? 'bg-primary text-on-primary' : 'text-muted hover:text-on-surface'}`}
            >{f === 'ALL' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}</button>
          ))}
        </div>
      </div>

      {!allContests.length ? <Card className="rounded-xl"><CardContent className="py-10 text-center text-body-md text-muted">No hay contests registrados.</CardContent></Card>
      : <><section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-title-lg text-on-surface">Próximos</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <span className="text-caption text-muted">{upcoming.length} contests</span>
          </div>
          {upcoming.length === 0 && <p className="text-body-md text-muted italic">Sin contests próximos.</p>}
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">{upcoming.map(c => card(c, false, getLink, getPI, fmtDur, getTimeLeft, toggleP, expandedContest, participantsByContest, loadingParticipants, getKey))}</div>
        </section>
        {past.length > 0 && <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-hairline/60" /></div>
            <div className="relative flex justify-center"><span className="bg-canvas px-4 text-caption text-muted">Historial</span></div>
          </div>
          <section className="space-y-3">
            <p className="text-caption text-muted-strong uppercase tracking-wider">Recientes</p>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 opacity-60 hover:opacity-100 transition-opacity">{past.map(c => card(c, true, getLink, getPI, fmtDur, getTimeLeft, toggleP, expandedContest, participantsByContest, loadingParticipants, getKey))}</div>
          </section>
        </>}
      </>}
    </div>
  )
}

function card(contest, isPast, link, icon, dur, timeLeft, toggle, expanded, participants, loadingP, getKey) {
  const k = getKey(contest); const p = participants[k] || []
  const startDate = DateTime.fromSeconds(contest.startTimeSeconds).setZone('America/Lima')
  const nowMs = Date.now(); const startMs = contest.startTimeSeconds * 1000
  const duration = contest.durationSeconds > 3e9 ? 1 : contest.durationSeconds; const endMs = startMs + duration * 1000
  const isLive = nowMs >= startMs && nowMs < endMs; const isSoon = !isPast && !isLive && (startMs - nowMs) < 24 * 60 * 60 * 1000
  const border = isLive ? 'border-l-[3px] border-l-trading-up' : isSoon ? 'border-l-[3px] border-l-primary' : ''
  return (
    <div className={`rounded-xl bg-surface-card p-4 transition-colors hover:bg-surface-elevated ${border} ${isPast ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon(contest.platform) && <img src={icon(contest.platform)} alt={contest.platform} className="h-5 w-5 shrink-0 object-contain" onError={e => e.target.style.display = 'none'} />}
            <h3 className="truncate text-body-md font-semibold">{contest.name}</h3>
            {isLive && <Badge className="bg-trading-up text-on-surface text-caption px-1.5 py-0">En curso</Badge>}
            {isSoon && <Badge className="bg-primary text-on-primary text-caption px-1.5 py-0">Próximo</Badge>}
          </div>
          <div className="text-caption text-muted mt-0.5 font-mono">{contest.id} · {startDate.setLocale('es').toFormat('ccc dd LLL HH:mm')}</div>
        </div>
        <a href={link(contest)} target="_blank" rel="noopener noreferrer" className="rounded-sm bg-surface-elevated p-1.5 text-muted hover:text-primary"><ExternalLink size={14} /></a>
      </div>
      <div className="flex items-center gap-2 mt-2 text-caption text-muted">
        <Badge variant="secondary" className="text-caption font-medium px-1.5 py-0.5">{contest.platform}</Badge>
        <span>{dur(contest.durationSeconds)}</span>
        {!isPast && <span className="inline-flex items-center gap-0.5"><Clock size={12} />{timeLeft(contest.startTimeSeconds, contest.durationSeconds)}</span>}
      </div>
      <div className="mt-3 rounded-lg bg-surface-elevated/50 p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-caption uppercase tracking-wider text-muted flex items-center gap-1"><User className="h-3 w-3" />Participantes</span>
          <button onClick={() => toggle(contest)} className="text-caption font-medium text-primary hover:text-primary/80">{expanded === k ? 'Ocultar' : 'Ver'}</button>
        </div>
        {expanded === k ? (loadingP[k] ? <div className="flex items-center gap-1.5 text-caption text-muted"><div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />Cargando...</div>
          : p.length > 0 ? <div className="flex flex-wrap gap-1.5">{p.map(pt => (
            <Link key={pt.id} href={`/user/${pt.handle}`} className="inline-flex items-center gap-1 rounded-sm border border-hairline/60 bg-surface-card px-2 py-1 text-caption font-medium hover:border-primary/30">
              {pt.avatar_url ? <Image src={pt.avatar_url} alt={pt.handle} width={14} height={14} className="h-3.5 w-3.5 rounded-full object-cover" unoptimized /> : <User className="h-3 w-3" />}
              <span className="truncate max-w-[80px]">{pt.handle}</span>
            </Link>
          ))}</div> : <span className="text-caption text-muted italic">Sin participantes rastreados.</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">{p.slice(0, 4).map(pt => (
            <span key={pt.id} className="inline-flex items-center gap-1 rounded-sm border border-hairline/60 bg-surface-card px-1.5 py-1 text-caption text-muted">
              {pt.avatar_url ? <Image src={pt.avatar_url} alt={pt.handle} width={12} height={12} className="h-3 w-3 rounded-full object-cover" unoptimized /> : <User className="h-2.5 w-2.5" />}
              <span className="truncate max-w-[60px]">{pt.handle}</span>
            </span>
          ))}{p.length > 4 && <span className="inline-flex items-center rounded-sm border border-hairline/60 bg-surface-card px-1.5 py-1 text-caption text-muted">+{p.length - 4}</span>}{!p.length && <span className="text-caption text-muted">Sin participantes.</span>}</div>
        )}
      </div>
    </div>
  )
}
