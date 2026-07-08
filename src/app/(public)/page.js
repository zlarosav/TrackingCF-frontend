"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DateTime } from 'luxon'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  RefreshCw, User, Trophy, Flame, Users, TrendingUp, ExternalLink,
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import LatestSubmissions from '@/components/LatestSubmissions'
import PeriodFilter from '@/components/PeriodFilter'
import LeaderboardTable from '@/components/LeaderboardTable'
import { JudgeIcon } from '@/components/JudgeIcon'

const CONTESTS_PER_PAGE = 5

// Helpers puros a nivel de módulo (no se recrean por render).
const getContestLink = (c) => { const p = String(c.platform || 'CODEFORCES').toUpperCase(); const id = c.id || c.contestId; if (p === 'LEETCODE') return `https://leetcode.com/contest/${id}`; if (p === 'ATCODER') return `https://atcoder.jp/contests/${id}`; if (p === 'CODECHEF') return `https://www.codechef.com/${id}`; return `https://codeforces.com/contest/${id}` }
const getPlatformIcon = (p) => { const v = String(p || '').toLowerCase(); if (v === 'codeforces') return '/codeforces.svg'; if (v === 'leetcode') return '/leetcode.svg'; if (v === 'atcoder') return '/atcoder.svg'; if (v === 'codechef') return '/codechef.svg'; return null }
const fmtDate = (s) => s ? DateTime.fromSeconds(s).setZone('America/Lima').setLocale('es').toFormat('dd LLL yyyy, HH:mm') : ''
const fmtDur = (s) => { const d = s > 3e9 ? 0 : s; return `${Math.floor(d / 3600)}h ${Math.floor((d % 3600) / 60)}m` }

export default function HomePage() {
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

  const fetchUsers = useCallback(async () => {
    try { setLoading(true); const r = await apiClient.getUsers(period); if (r.success) { setUsers(r.data); setLastTrackerRun(r.lastTrackerRun || (r.data.length ? r.data[0].last_updated : null)) } } catch (_) {} finally { setLoading(false) }
  }, [period])

  const fetchSubmissions = useCallback(async () => {
    try { setLoadingSubmissions(true); const r = await apiClient.getAllLatestSubmissions(period, sortBy, sortOrder, 80, platformFilter); if (r.success) { setSubmissions(r.data.submissions); setAtcoderEnabled(!!r.data?.flags?.atcoderSubmissions); if (r.data?.platform && r.data.platform !== platformFilter) setPlatformFilter(r.data.platform) } } catch (_) {} finally { setLoadingSubmissions(false) }
  }, [period, sortBy, sortOrder, platformFilter])

  const fetchContestFeed = useCallback(async () => {
    try { setLoadingContests(true); const r = await apiClient.getRecentContests(25); setContestFeed(r.success && Array.isArray(r.data) ? r.data : []) } catch (_) { setContestFeed([]) } finally { setLoadingContests(false) }
  }, [])

  // Efectos separados por dependencia real: ordenar submissions ya no refetchea
  // usuarios ni el feed de contests.
  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])
  useEffect(() => { fetchContestFeed() }, [fetchContestFeed])

  // Ref con los fetchers más recientes para que los listeners (montados una vez)
  // siempre llamen a la versión actual sin re-registrarse en cada cambio de orden.
  const fetchersRef = useRef({ fetchUsers, fetchSubmissions, fetchContestFeed })
  fetchersRef.current = { fetchUsers, fetchSubmissions, fetchContestFeed }

  // Revalidación exacta: al montar y al volver a la pestaña, un GET /meta barato
  // (throttleado) detecta si el cron corrió. Solo refetchea las porciones que
  // cambiaron — si nada cambió, cero red y cero parpadeo de loading.
  useEffect(() => {
    let cancelled = false
    const applyChanges = ({ trackerChanged, contestChanged }) => {
      if (cancelled) return
      const f = fetchersRef.current
      if (trackerChanged) { f.fetchUsers(); f.fetchSubmissions() }
      if (contestChanged) { f.fetchContestFeed() }
    }
    const revalidate = async () => { applyChanges(await apiClient.checkFreshness()) }
    apiClient.checkFreshness({ force: true }).then(applyChanges)
    const onVisible = () => { if (document.visibilityState === 'visible') revalidate() }
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', onVisible)
    return () => { cancelled = true; window.removeEventListener('focus', revalidate); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  useEffect(() => { setContestPage(1) }, [contestFeed.length])

  const handleSort = useCallback((col) => {
    if (userSortBy === col) { setUserSortOrder(o => o === 'asc' ? 'desc' : 'asc') }
    else { setUserSortBy(col); setUserSortOrder('desc') }
  }, [userSortBy])

  const handleSubmissionSort = useCallback((f, o) => { setSortBy(f); setSortOrder(o) }, [])

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => ((a[userSortBy] || 0) - (b[userSortBy] || 0)) * (userSortOrder === 'asc' ? 1 : -1)),
    [users, userSortBy, userSortOrder]
  )
  const { totalScore, totalSubs, topStreak } = useMemo(() => ({
    totalScore: users.reduce((a, u) => a + Number(u.total_score || 0), 0),
    totalSubs: users.reduce((a, u) => a + Number(u.total_submissions || 0), 0),
    topStreak: users.reduce((m, u) => Math.max(m, Number(u.current_streak || 0)), 0),
  }), [users])
  const totalContestPages = useMemo(() => Math.max(1, Math.ceil(contestFeed.length / CONTESTS_PER_PAGE)), [contestFeed.length])
  const visibleContests = useMemo(() => contestFeed.slice((contestPage - 1) * CONTESTS_PER_PAGE, contestPage * CONTESTS_PER_PAGE), [contestFeed, contestPage])

  const statItems = useMemo(() => [
    { label: 'Usuarios rastreados', value: users.length, icon: Users, suffix: '' },
    { label: 'Score total', value: totalScore.toLocaleString(), icon: Trophy, suffix: 'pts', isYellow: true },
    { label: 'Envíos totales', value: totalSubs.toLocaleString(), icon: TrendingUp, suffix: '', isGreen: true },
    { label: 'Mejor racha', value: `${topStreak}`, icon: Flame, suffix: 'días', isYellow: true },
  ], [users.length, totalScore, totalSubs, topStreak])

  if (loading && !users.length) return <div className="space-y-3"><Skeleton className="h-11 w-full rounded-lg" /><Skeleton className="h-72 w-full rounded-lg" /></div>

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-sm text-on-surface">Leaderboard</h1>
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
              <span className={`text-title-lg sm:text-number-display font-bold ${isYellow ? 'text-primary' : isGreen ? 'text-trading-up' : 'text-on-surface'}`}>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {/* Markets table */}
          <LeaderboardTable users={sortedUsers} sortBy={userSortBy} sortOrder={userSortOrder} onSort={handleSort} />

          {/* Latest submissions */}
          <div className="rounded-xl border border-hairline/60 overflow-hidden">
            <LatestSubmissions submissions={submissions} loading={loadingSubmissions} sortBy={sortBy} sortOrder={sortOrder} platformFilter={platformFilter} atcoderEnabled={atcoderEnabled}
              onPlatformChange={setPlatformFilter} onSortChange={handleSubmissionSort} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-hairline/60 overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-elevated border-b border-hairline/60">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-body-sm sm:text-body-md font-semibold text-on-surface">Contests recientes</span>
              </div>
              <span className="text-caption sm:text-body-sm text-muted whitespace-nowrap">{contestFeed.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {loadingContests ? (
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-surface-elevated animate-pulse" />
                  <div className="h-16 rounded-lg bg-surface-elevated animate-pulse" />
                </div>
              ) : contestFeed.length > 0 ? (
                <div className="space-y-1.5">
                  {visibleContests.map(contest => (
                    <a key={`${contest.platform}:${contest.id}`} href={getContestLink(contest)} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-lg bg-surface-elevated/50 px-3 py-2.5 transition-colors hover:bg-surface-elevated group">
                      {getPlatformIcon(contest.platform) && (
                        <JudgeIcon platform={contest.platform} className="mt-0.5 h-4 w-4" />
                      )}
                      <div className="min-w-0 flex-1 leading-tight">
                        <div className="truncate text-body-md font-semibold text-on-surface">{contest.name}</div>
                        <div className="text-caption text-muted mt-0.5">{fmtDate(contest.startTimeSeconds)} · {fmtDur(contest.durationSeconds)}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contest.participants.map(p => (
                            <span key={p.id || p.handle} className="inline-flex items-center gap-1 rounded-sm bg-surface-card px-1.5 py-0.5 text-[10px] text-muted">
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
                <div className="rounded-lg border border-dashed border-hairline/60 p-4 text-center text-body-md text-muted">
                  Sin datos de contests
                </div>
              )}
              {!loadingContests && contestFeed.length > 0 && (
                <div className="flex items-center justify-between border-t border-hairline/60 pt-3 mt-2">
                  <span className="text-caption text-muted">
                    {(contestPage - 1) * CONTESTS_PER_PAGE + 1}-{Math.min(contestPage * CONTESTS_PER_PAGE, contestFeed.length)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setContestPage(p => Math.max(1, p - 1))} disabled={contestPage === 1}
                      className="rounded-sm border border-hairline/60 px-2 py-1 text-caption font-medium hover:bg-surface-elevated disabled:opacity-30">Anterior</button>
                    <span className="text-caption text-muted px-1">{contestPage}/{totalContestPages}</span>
                    <button onClick={() => setContestPage(p => Math.min(totalContestPages, p + 1))} disabled={contestPage === totalContestPages}
                      className="rounded-sm border border-hairline/60 px-2 py-1 text-caption font-medium hover:bg-surface-elevated disabled:opacity-30">Siguiente</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick links — Binance trust-badge style */}
          <div className="rounded-xl border border-hairline/60 overflow-hidden p-3 sm:p-4">
            <p className="text-caption text-muted uppercase tracking-wider mb-2 sm:mb-3">Explora</p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {[
                { href: '/contests', label: 'Contests', icon: TrendingUp },
                { href: '/resources', label: 'Recursos', icon: Trophy },
                { href: '/judges', label: 'Jueces', icon: Users },
                { href: '/communities', label: 'Comunidades', icon: Flame },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2 rounded-lg bg-surface-elevated/50 px-3 py-2.5 text-body-sm text-muted hover:text-primary hover:bg-surface-elevated transition-colors">
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
