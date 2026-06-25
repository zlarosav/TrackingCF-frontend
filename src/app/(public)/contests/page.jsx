'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DateTime } from 'luxon'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, User, Calendar, Zap } from 'lucide-react'
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

  useEffect(() => { fetchContests(); const t = setInterval(() => setNow(DateTime.now()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { if (allContests.length) applyFilters() }, [filter, allContests, now])

  const fetchContests = async () => {
    try { const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; const r = await axios.get(`${apiUrl}/contests`); if (r.data.success) { setAllContests(r.data.data); if (r.data.lastUpdated) setLastUpdated(r.data.lastUpdated) } } catch (_) {} finally { setLoading(false) }
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

  if (loading) return <div className="flex items-center justify-center h-[40vh]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div><h1 className="text-2xl font-black tracking-tight">Contests</h1>{lastUpdated && <p className="text-xs text-muted-foreground mt-0.5"><Calendar className="inline h-3 w-3 mr-0.5" />Actualizado: {DateTime.fromISO(lastUpdated).setZone('America/Lima').setLocale('es').toFormat('dd LLL HH:mm')}</p>}</div>
        <div className="flex rounded-lg border border-border/30 bg-card p-0.5 shadow-sm">
          {['ALL','CODEFORCES','LEETCODE','ATCODER','CODECHEF'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >{f === 'ALL' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}</button>
          ))}
        </div>
      </div>

      {!allContests.length ? <Card className="border-border/30"><CardContent className="py-10 text-center text-sm text-muted-foreground">No hay contests registrados.</CardContent></Card>
      : <><section className="space-y-3"><h2 className="text-lg font-bold flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" />Próximos</h2>
        {upcoming.length === 0 && <p className="text-sm text-muted-foreground italic">Sin contests próximos.</p>}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">{upcoming.map(c => card(c, false, getLink, getPI, fmtDur, getTimeLeft, toggleP, expandedContest, participantsByContest, loadingParticipants, getKey))}</div></section>
        {past.length > 0 && <div className="border-t border-border/20" />}
        <section className="space-y-3"><h2 className="text-lg font-bold text-muted-foreground/80">Recientes</h2>
        {past.length === 0 && <p className="text-sm text-muted-foreground italic">Sin contests recientes.</p>}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 opacity-70 hover:opacity-100 transition-opacity">{past.map(c => card(c, true, getLink, getPI, fmtDur, getTimeLeft, toggleP, expandedContest, participantsByContest, loadingParticipants, getKey))}</div></section>
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
  const border = isLive ? 'border-l-[3px] border-l-emerald-500' : isSoon ? 'border-l-[3px] border-l-indigo-500' : ''
  return (
    <div className={`relative overflow-hidden rounded-lg border border-border/30 bg-card/90 p-4 transition-colors hover:bg-muted/15 ${border} ${isPast ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon(contest.platform) && <img src={icon(contest.platform)} alt={contest.platform} className="h-5 w-5 shrink-0 object-contain" onError={e => e.target.style.display = 'none'} />}
            <h3 className="truncate text-sm font-bold">{contest.name}</h3>
            {isLive && <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0">En curso</Badge>}
            {isSoon && <Badge className="bg-indigo-500 text-white text-xs px-1.5 py-0">Próximo</Badge>}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">{contest.id} &middot; {startDate.setLocale('es').toFormat('ccc dd LLL HH:mm')}</div>
        </div>
        <a href={link(contest)} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border/30 bg-background/70 p-1.5 text-muted-foreground hover:border-indigo-200 hover:text-indigo-600"><ExternalLink size={14} /></a>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs font-medium px-1.5 py-0.5 border-border/30">{contest.platform}</Badge>
        <span>{dur(contest.durationSeconds)}</span>
        {!isPast && <span className="inline-flex items-center gap-0.5"><Clock size={12} />{timeLeft(contest.startTimeSeconds, contest.durationSeconds)}</span>}
      </div>
      <div className="mt-3 rounded-md border border-border/20 bg-muted/10 p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />Participantes</span>
          <button onClick={() => toggle(contest)} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">{expanded === k ? 'Ocultar' : 'Ver'}</button>
        </div>
        {expanded === k ? (loadingP[k] ? <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />Cargando...</div>
          : p.length > 0 ? <div className="flex flex-wrap gap-1.5">{p.map(pt => (
            <Link key={pt.id} href={`/user/${pt.handle}`} className="inline-flex items-center gap-1 rounded-md border border-border/30 bg-background px-2 py-1 text-xs font-medium hover:border-indigo-200">
              {pt.avatar_url ? <Image src={pt.avatar_url} alt={pt.handle} width={14} height={14} className="h-3.5 w-3.5 rounded-full object-cover" unoptimized /> : <User className="h-3 w-3" />}
              <span className="truncate max-w-[80px]">{pt.handle}</span>
            </Link>
          ))}</div> : <span className="text-xs text-muted-foreground italic">Sin participantes rastreados.</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">{p.slice(0, 4).map(pt => (
            <span key={pt.id} className="inline-flex items-center gap-1 rounded-md border border-border/30 bg-background px-1.5 py-1 text-xs text-muted-foreground">
              {pt.avatar_url ? <Image src={pt.avatar_url} alt={pt.handle} width={12} height={12} className="h-3 w-3 rounded-full object-cover" unoptimized /> : <User className="h-2.5 w-2.5" />}
              <span className="truncate max-w-[60px]">{pt.handle}</span>
            </span>
          ))}{p.length > 4 && <span className="inline-flex items-center rounded-md border border-border/30 bg-background px-1.5 py-1 text-xs text-muted-foreground">+{p.length - 4}</span>}{!p.length && <span className="text-xs text-muted-foreground">Sin participantes.</span>}</div>
        )}
      </div>
    </div>
  )
}
