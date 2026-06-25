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
  Trophy, BarChart3, Flame, Users, TrendingUp, ExternalLink,
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
    <TableHead className="cursor-pointer text-center text-caption uppercase tracking-wider text-muted p-2 sm:p-3 h-9 font-medium" onClick={() => handleSort(column)}>
      <div className="inline-flex items-center gap-0.5">{children}{active ? (userSortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
    </TableHead>
  )}

  const statItems = [
    { label: 'Usuarios rastreados', value: users.length, icon: Users, suffix: '' },
    { label: 'Score total', value: totalScore.toLocaleString(), icon: Trophy, suffix: 'pts', isYellow: true },
    { label: 'Envíos totales', value: totalSubs.toLocaleString(), icon: TrendingUp, suffix: '', isGreen: true },
    { label: 'Mejor racha', value: `${topStreak}`, icon: Flame, suffix: 'días', isYellow: true },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-sm text-on-dark">Leaderboard</h1>
          <p className="text-body-sm sm:text-body-md text-muted mt-0.5 sm:mt-1">Rendimiento de los usuarios en el periodo actual</p>
        </div>
        <PeriodFilter period={period} onPeriodChange={setPeriod} />
      </div>

      {/* Stat callout cards — Binance style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map(({ label, value, icon: Icon, suffix, isYellow, isGreen }) => (
          <Card key={label} className="flex flex-col justify-between p-3 sm:p-4 rounded-xl min-h-[80px] sm:min-h-[100px]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isYellow ? 'text-primary' : isGreen ? 'text-trading-up' : 'text-muted'}`} />
              <span className="text-caption text-muted font-medium truncate">{label}</span>
            </div>
            <div className="mt-1 sm:mt-2">
              <span className={`text-title-lg sm:text-number-display font-bold ${isYellow ? 'text-primary' : isGreen ? 'text-trading-up' : 'text-on-dark'}`}>
                {value}
              </span>
              {suffix && <span className="text-caption text-muted ml-0.5 sm:ml-1">{suffix}</span>}
            </div>
          </Card>
        ))}
      </div>

      {/* Tracker meta */}
      <div className="flex items-center justify-between">
        {lastTrackerRun && (
          <div className="flex items-center gap-1.5 text-caption text-muted">
            <RefreshCw className="h-3 w-3" />
            Última actualización: {lastTrackerRun}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          {/* Markets table */}
          <div className="rounded-xl border border-hairline-on-dark/60 overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-elevated-dark flex items-center justify-between border-b border-hairline-on-dark/60">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-body-sm sm:text-body-md font-semibold text-on-dark">Clasificación</span>
              </div>
              <span className="text-caption sm:text-body-sm text-muted whitespace-nowrap">{sortedUsers.length} participantes</span>
            </div>
            <div className="overflow-x-auto">
              <Table className="min-w-[600px] sm:min-w-0">
                <TableHeader>
                  <TableRow className="bg-surface-elevated-dark/50">
                    <TableHead className="w-8 text-center text-caption uppercase text-muted p-2 sm:p-3 font-medium">#</TableHead>
                    <TableHead className="text-caption uppercase text-muted p-2 sm:p-3 font-medium">Usuario</TableHead>
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
                    const rankColor = index === 0 ? 'text-primary' : index === 1 ? 'text-muted-strong' : index === 2 ? 'text-amber-600' : ''
                    return (
                      <TableRow key={user.id} className="transition-colors hover:bg-surface-elevated-dark/50 border-t border-hairline-on-dark/60">
                        <TableCell className="text-center p-2 sm:p-3">
                          <span className={`text-body-sm sm:text-body-md font-bold ${rankColor || 'text-muted'}`}>{index + 1}</span>
                        </TableCell>
                        <TableCell className="p-2 sm:p-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Link href={`/user/${user.handle}`}>
                              {user.avatar_url ? <div className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-surface-elevated-dark"><Image src={user.avatar_url} alt={user.handle} width={36} height={36} className="h-full w-full object-cover" unoptimized /></div>
                                : <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated-dark"><User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted" /></div>}
                            </Link>
                            <div className="min-w-0 leading-tight">
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <Link href={`/user/${user.handle}`} className="hover:underline leading-none">
                                  <span className={`text-body-sm sm:text-body-md font-semibold ${getRatingColorClass(user.rating)}`}>{user.handle}</span>
                                </Link>
                                <StreakBadge streak={user.current_streak} isActive={user.streak_active} />
                              </div>
                              {handles.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {handles.map(h => <span key={h} className="rounded-sm bg-surface-elevated-dark px-1 py-0.5 text-[9px] sm:text-[10px] text-muted">{h}</span>)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-dark">{user.count_no_rating || 0}</span></TableCell>
                        <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-dark">{user.count_800_900 || 0}</span></TableCell>
                        <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-dark">{user.count_1000 || 0}</span></TableCell>
                        <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-dark">{user.count_1100 || 0}</span></TableCell>
                        <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-dark">{user.count_1200_plus || 0}</span></TableCell>
                        <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-dark">{user.total_submissions || 0}</span></TableCell>
                        <TableCell className="text-center p-2 sm:p-3">
                          <Badge className="bg-primary text-on-primary font-bold font-mono text-body-sm sm:text-body-md px-1.5 sm:px-2.5 py-0.5 rounded-sm">{user.total_score || 0}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Latest submissions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-trading-up" />
              <h2 className="text-title-sm text-on-dark">Últimos envíos</h2>
            </div>
            <div className="rounded-xl border border-hairline-on-dark/60 overflow-hidden">
              <LatestSubmissions submissions={submissions} loading={loadingSubmissions} sortBy={sortBy} sortOrder={sortOrder} platformFilter={platformFilter} atcoderEnabled={atcoderEnabled}
                onPlatformChange={setPlatformFilter} onSortChange={(f, o) => { setSortBy(f); setSortOrder(o) }} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-hairline-on-dark/60 overflow-hidden">
            <div className="p-4 border-b border-hairline-on-dark/60 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-body-md font-semibold text-on-dark">Contests recientes</span>
            </div>
            <div className="p-3 space-y-2">
              {loadingContests ? (
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-surface-elevated-dark animate-pulse" />
                  <div className="h-16 rounded-lg bg-surface-elevated-dark animate-pulse" />
                </div>
              ) : contestFeed.length > 0 ? (
                <div className="space-y-1.5">
                  {visibleContests.map(contest => (
                    <a key={`${contest.platform}:${contest.id}`} href={getContestLink(contest)} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-lg bg-surface-elevated-dark/50 px-3 py-2.5 transition-colors hover:bg-surface-elevated-dark group">
                      {getPlatformIcon(contest.platform) && (
                        <Image src={getPlatformIcon(contest.platform)} alt={contest.platform} width={16} height={16} className="mt-0.5 h-4 w-4 shrink-0 object-contain" unoptimized />
                      )}
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="truncate text-body-md font-semibold text-on-dark">{contest.name}</div>
                        <div className="text-caption text-muted mt-0.5">{fmtDate(contest.startTimeSeconds)} · {fmtDur(contest.durationSeconds)}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contest.participants.map(p => (
                            <span key={p.id || p.handle} className="inline-flex items-center gap-1 rounded-sm bg-surface-card-dark px-1.5 py-0.5 text-[10px] text-muted">
                              {p.avatar_url ? <Image src={p.avatar_url} alt={p.handle} width={10} height={10} className="h-3 w-3 rounded-full object-cover" unoptimized /> : <User className="h-2.5 w-2.5" />}
                              {p.handle}
                            </span>
                          ))}
                          {contest.participantCount > contest.participants.length && (
                            <span className="text-[10px] text-muted">+{contest.participantCount - contest.participants.length}</span>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-hairline-on-dark/60 p-4 text-center text-body-md text-muted">
                  Sin datos de contests
                </div>
              )}
              {!loadingContests && contestFeed.length > 0 && (
                <div className="flex items-center justify-between border-t border-hairline-on-dark/60 pt-3 mt-2">
                  <span className="text-caption text-muted">
                    {(contestPage - 1) * CONTESTS_PER_PAGE + 1}-{Math.min(contestPage * CONTESTS_PER_PAGE, contestFeed.length)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setContestPage(p => Math.max(1, p - 1))} disabled={contestPage === 1}
                      className="rounded-sm border border-hairline-on-dark/60 px-2 py-1 text-caption font-medium hover:bg-surface-elevated-dark disabled:opacity-30">Anterior</button>
                    <span className="text-caption text-muted px-1">{contestPage}/{totalContestPages}</span>
                    <button onClick={() => setContestPage(p => Math.min(totalContestPages, p + 1))} disabled={contestPage === totalContestPages}
                      className="rounded-sm border border-hairline-on-dark/60 px-2 py-1 text-caption font-medium hover:bg-surface-elevated-dark disabled:opacity-30">Siguiente</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick links — Binance trust-badge style */}
          <div className="rounded-xl border border-hairline-on-dark/60 overflow-hidden p-3 sm:p-4">
            <p className="text-caption text-muted uppercase tracking-wider mb-2 sm:mb-3">Explora</p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {[
                { href: '/contests', label: 'Contests', icon: TrendingUp },
                { href: '/resources', label: 'Recursos', icon: Trophy },
                { href: '/judges', label: 'Jueces', icon: Users },
                { href: '/communities', label: 'Comunidades', icon: Flame },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2 rounded-lg bg-surface-elevated-dark/50 px-3 py-2.5 text-body-sm text-muted hover:text-primary hover:bg-surface-elevated-dark transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
