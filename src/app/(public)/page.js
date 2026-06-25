"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { DateTime } from 'luxon'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw, User, ArrowUpDown, ArrowUp, ArrowDown,
  Trophy, BarChart3, Flame, Users,
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import LatestSubmissions from '@/components/LatestSubmissions'
import PeriodFilter from '@/components/PeriodFilter'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'

export default function HomePage() {
  const CONTESTS_PER_PAGE = 5
  const [users, setUsers] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [contestFeed, setContestFeed] = useState([])
  const [contestPage, setContestPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [loadingContests, setLoadingContests] = useState(true)
  const [lastTrackerRun, setLastTrackerRun] = useState(null)
  const [period, setPeriod] = useState('month')
  const [sortBy, setSortBy] = useState('submission_time')
  const [sortOrder, setSortOrder] = useState('desc')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [atcoderEnabled, setAtcoderEnabled] = useState(false)
  const [userSortBy, setUserSortBy] = useState('total_score')
  const [userSortOrder, setUserSortOrder] = useState('desc')

  const fetchUsers = async () => {
    try { setLoading(true); const r = await apiClient.getUsers(period); if (r.success) { setUsers(r.data); setLastTrackerRun(r.lastTrackerRun || (r.data.length ? r.data[0].last_updated : null)) } } catch (_) {} finally { setLoading(false) }
  }
  const fetchSubmissions = async () => {
    try { setLoadingSubmissions(true); const r = await apiClient.getAllLatestSubmissions(period, sortBy, sortOrder, 80, platformFilter); if (r.success) { setSubmissions(r.data.submissions); setAtcoderEnabled(!!r.data?.flags?.atcoderSubmissions); if (r.data?.platform && r.data.platform !== platformFilter) setPlatformFilter(r.data.platform) } } catch (_) {} finally { setLoadingSubmissions(false) }
  }
  const fetchContestFeed = async () => {
    try { setLoadingContests(true); const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; const r = await axios.get(`${apiUrl}/contests`); if (!r.data.success || !Array.isArray(r.data.data)) { setContestFeed([]); return }
      const now = Math.floor(Date.now() / 1000); const sorted = [...r.data.data].sort((a, b) => (b.startTimeSeconds || 0) - (a.startTimeSeconds || 0))
      const f = sorted.filter(c => (c.startTimeSeconds || 0) + (c.durationSeconds > 3e9 ? 0 : (c.durationSeconds || 0)) <= now)
      const candidates = [...f, ...sorted].slice(0, 120); const found = []; const visited = new Set()
      for (const c of candidates) { const id = String(c.id || c.contestId || ''); if (!id) continue; const key = `${String(c.platform || 'CODEFORCES').toUpperCase()}:${id}`; if (visited.has(key)) continue; visited.add(key); try { const p = await apiClient.getContestParticipants(c.platform || 'CODEFORCES', id); const participants = p.success ? (p.data || []) : []; if (!participants.length) continue; found.push({ ...c, id, participants: participants.slice(0, 4), participantCount: participants.length }); if (found.length >= 25) break } catch (_) {} }
      setContestFeed(found) } catch (_) { setContestFeed([]) } finally { setLoadingContests(false) }
  }
  const getContestLink = (c) => { const p = String(c.platform || 'CODEFORCES').toUpperCase(); const id = c.id || c.contestId; if (p === 'LEETCODE') return `https://leetcode.com/contest/${id}`; if (p === 'ATCODER') return `https://atcoder.jp/contests/${id}`; if (p === 'CODECHEF') return `https://www.codechef.com/${id}`; return `https://codeforces.com/contest/${id}` }
  const getPlatformIcon = (p) => { const v = String(p || '').toLowerCase(); if (v === 'codeforces') return '/codeforces.svg'; if (v === 'leetcode') return '/leetcode.svg'; if (v === 'atcoder') return '/atcoder.svg'; if (v === 'codechef') return '/codechef.svg'; return null }
  const fmtDate = (s) => s ? DateTime.fromSeconds(s).setZone('America/Lima').setLocale('es').toFormat('dd LLL yyyy, HH:mm') : ''
  const fmtDur = (s) => { const d = s > 3e9 ? 0 : s; return `${Math.floor(d / 3600)}h ${Math.floor((d % 3600) / 60)}m` }
  const handleSort = (col) => { if (userSortBy === col) setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc'); else { setUserSortBy(col); setUserSortOrder('desc') } }
  const sortedUsers = [...users].sort((a, b) => ((a[userSortBy] || 0) - (b[userSortBy] || 0)) * (userSortOrder === 'asc' ? 1 : -1))
  const totalScore = users.reduce((a, u) => a + Number(u.total_score || 0), 0)
  const totalSubs = users.reduce((a, u) => a + Number(u.total_submissions || 0), 0)
  const topStreak = users.reduce((m, u) => Math.max(m, Number(u.current_streak || 0)), 0)
  const totalContestPages = Math.max(1, Math.ceil(contestFeed.length / CONTESTS_PER_PAGE))
  const visibleContests = contestFeed.slice((contestPage - 1) * CONTESTS_PER_PAGE, contestPage * CONTESTS_PER_PAGE)
  useEffect(() => { setContestPage(1) }, [contestFeed.length])
  useEffect(() => { fetchUsers(); fetchSubmissions(); fetchContestFeed() }, [period, sortBy, sortOrder, platformFilter])
  if (loading && !users.length) return <div className="space-y-3"><Skeleton className="h-11 w-full rounded-lg" /><Skeleton className="h-72 w-full rounded-lg" /></div>

  const SortableHeader = ({ column, children }) => { const active = userSortBy === column; return (
    <TableHead className="cursor-pointer text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground p-2 h-9" onClick={() => handleSort(column)}>
      <div className="inline-flex items-center gap-0.5">{children}{active ? (userSortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
    </TableHead>
  )}

  const stats = [
    { label: 'Participantes', value: users.length, icon: Users },
    { label: 'Score total', value: totalScore.toLocaleString(), icon: Trophy },
    { label: 'Envíos', value: totalSubs.toLocaleString(), icon: BarChart3 },
    { label: 'Mejor racha', value: `${topStreak}d`, icon: Flame },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 pb-6">
      <div className="flex items-center justify-between rounded-lg border border-border/30 bg-card px-4 py-2.5">
        <div className="flex items-center divide-x divide-border/20">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 px-4 first:pl-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-base font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          <RefreshCw className="h-3 w-3" />{lastTrackerRun || 'Cargando...'}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr] xl:items-start">
        <div className="space-y-4">
          <PeriodFilter period={period} onPeriodChange={setPeriod} />

          <Card className="overflow-hidden rounded-lg border border-border/30">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="w-8 text-center text-xs font-semibold uppercase text-muted-foreground p-2 h-9">#</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-muted-foreground p-2 h-9">Usuario</TableHead>
                    <SortableHeader column="count_no_rating">Sin rtg</SortableHeader>
                    <SortableHeader column="count_800_900">800</SortableHeader>
                    <SortableHeader column="count_1000">1000</SortableHeader>
                    <SortableHeader column="count_1100">1100</SortableHeader>
                    <SortableHeader column="count_1200_plus">1200+</SortableHeader>
                    <SortableHeader column="total_submissions">Envíos</SortableHeader>
                    <SortableHeader column="total_score">Score</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user, index) => {
                    const handles = [user.leetcode_handle && `LC:${user.leetcode_handle}`, user.atcoder_handle && `AC:${user.atcoder_handle}`, user.codechef_handle && `CC:${user.codechef_handle}`].filter(Boolean)
                    return (
                      <TableRow key={user.id} className="transition-colors hover:bg-muted/15">
                        <TableCell className="text-center text-xs text-muted-foreground p-2">{index + 1}</TableCell>
                        <TableCell className="p-2">
                          <div className="flex items-center gap-2.5">
                            <Link href={`/user/${user.handle}`}>
                              {user.avatar_url ? <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full ring-1 ring-border"><Image src={user.avatar_url} alt={user.handle} width={28} height={28} className="h-full w-full object-cover" unoptimized /></div>
                                : <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border"><User className="h-3.5 w-3.5 text-muted-foreground" /></div>}
                            </Link>
                            <div className="min-w-0 leading-tight">
                              <div className="flex items-center gap-1.5">
                                <Link href={`/user/${user.handle}`} className="hover:underline leading-none"><span className={`text-sm font-semibold ${getRatingColorClass(user.rating)}`}>{user.handle}</span></Link>
                                <StreakBadge streak={user.current_streak} isActive={user.streak_active} />
                              <Link href={`/compare?handles=${user.handle}`} className="text-muted-foreground/40 hover:text-indigo-500 transition-colors" title="Comparar"><BarChart3 className="h-3 w-3" /></Link>
                              </div>
                              {handles.length > 0 && <div className="flex flex-wrap gap-1 mt-0.5">{handles.map(h => <span key={h} className="rounded-sm bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">{h}</span>)}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center p-2"><span className="font-mono text-sm tabular-nums">{user.count_no_rating || 0}</span></TableCell>
                        <TableCell className="text-center p-2"><span className="font-mono text-sm tabular-nums">{user.count_800_900 || 0}</span></TableCell>
                        <TableCell className="text-center p-2"><span className="font-mono text-sm tabular-nums">{user.count_1000 || 0}</span></TableCell>
                        <TableCell className="text-center p-2"><span className="font-mono text-sm tabular-nums">{user.count_1100 || 0}</span></TableCell>
                        <TableCell className="text-center p-2"><span className="font-mono text-sm tabular-nums">{user.count_1200_plus || 0}</span></TableCell>
                        <TableCell className="text-center p-2"><span className="font-mono text-sm tabular-nums">{user.total_submissions || 0}</span></TableCell>
                        <TableCell className="text-center p-2"><Badge className="bg-indigo-600 text-white font-bold font-mono text-xs px-1.5 py-0.5">{user.total_score || 0}</Badge></TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="overflow-hidden rounded-lg border border-border/30">
            <LatestSubmissions submissions={submissions} loading={loadingSubmissions} sortBy={sortBy} sortOrder={sortOrder} platformFilter={platformFilter} atcoderEnabled={atcoderEnabled}
              onPlatformChange={setPlatformFilter} onSortChange={(f, o) => { setSortBy(f); setSortOrder(o) }} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-lg border border-border/30">
            <div className="p-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contests recientes</p>
              {loadingContests ? <div className="space-y-2"><div className="h-16 rounded-lg border bg-muted/30 animate-pulse" /><div className="h-16 rounded-lg border bg-muted/30 animate-pulse" /></div>
              : contestFeed.length > 0 ? <div className="space-y-1.5">{visibleContests.map(contest => (
                <a key={`${contest.platform}:${contest.id}`} href={getContestLink(contest)} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2.5 rounded-lg border border-border/20 bg-card/80 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  {getPlatformIcon(contest.platform) && <Image src={getPlatformIcon(contest.platform)} alt={contest.platform} width={16} height={16} className="mt-0.5 h-4 w-4 shrink-0 object-contain" unoptimized />}
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-sm font-semibold">{contest.name}</div>
                    <div className="text-xs text-muted-foreground">{fmtDate(contest.startTimeSeconds)} &middot; {fmtDur(contest.durationSeconds)}</div>
                    <div className="flex flex-wrap gap-1 mt-1">{contest.participants.map(p => (
                      <span key={p.id || p.handle} className="inline-flex items-center gap-1 rounded-sm bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {p.avatar_url ? <Image src={p.avatar_url} alt={p.handle} width={10} height={10} className="h-3 w-3 rounded-full object-cover" unoptimized /> : <User className="h-2.5 w-2.5" />}{p.handle}</span>))}
                      {contest.participantCount > contest.participants.length && <span className="text-[10px] text-muted-foreground">+{contest.participantCount - contest.participants.length}</span>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs px-1.5 py-0.5">{contest.participantCount}</Badge>
                </a>
              ))}</div>
              : <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-center text-sm text-muted-foreground">Sin datos de contests.</div>}
              {!loadingContests && contestFeed.length > 0 && <div className="flex items-center justify-between border-t border-border/20 pt-2">
                <span className="text-xs text-muted-foreground">{(contestPage - 1) * CONTESTS_PER_PAGE + 1}-{Math.min(contestPage * CONTESTS_PER_PAGE, contestFeed.length)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setContestPage(p => Math.max(1, p - 1))} disabled={contestPage === 1} className="rounded border border-border/30 px-2 py-0.5 text-xs font-medium hover:bg-muted/50 disabled:opacity-30">Anterior</button>
                  <span className="text-xs text-muted-foreground px-1">{contestPage}/{totalContestPages}</span>
                  <button onClick={() => setContestPage(p => Math.min(totalContestPages, p + 1))} disabled={contestPage === totalContestPages} className="rounded border border-border/30 px-2 py-0.5 text-xs font-medium hover:bg-muted/50 disabled:opacity-30">Siguiente</button>
                </div>
              </div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
