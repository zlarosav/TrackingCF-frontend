"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { DateTime } from 'luxon'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  RefreshCw,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trophy,
  BarChart3,
  Flame,
  Users,
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
  const [error, setError] = useState(null)
  const [lastTrackerRun, setLastTrackerRun] = useState(null)
  const [period, setPeriod] = useState('month')
  const [sortBy, setSortBy] = useState('submission_time')
  const [sortOrder, setSortOrder] = useState('desc')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [atcoderEnabled, setAtcoderEnabled] = useState(false)
  const [userSortBy, setUserSortBy] = useState('total_score')
  const [userSortOrder, setUserSortOrder] = useState('desc')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getUsers(period)
      if (response.success) {
        setUsers(response.data)
        const trackerTime = response.lastTrackerRun || (response.data.length > 0 ? response.data[0].last_updated : null)
        if (trackerTime) {
          setLastTrackerRun(trackerTime)
        }
      }
    } catch (err) {
      console.error('Error backend:', err)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true)
      const response = await apiClient.getAllLatestSubmissions(period, sortBy, sortOrder, 80, platformFilter)
      if (response.success) {
        setSubmissions(response.data.submissions)
        setAtcoderEnabled(!!response.data?.flags?.atcoderSubmissions)
        if (response.data?.platform && response.data.platform !== platformFilter) {
          setPlatformFilter(response.data.platform)
        }
      }
    } catch (err) {
      console.error('Error al cargar submissions:', err)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const fetchContestFeed = async () => {
    try {
      setLoadingContests(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await axios.get(`${apiUrl}/contests`)

      if (!response.data.success || !Array.isArray(response.data.data)) {
        setContestFeed([])
        return
      }

      const nowSeconds = Math.floor(Date.now() / 1000)
      const sortedContests = [...response.data.data].sort((a, b) => (b.startTimeSeconds || 0) - (a.startTimeSeconds || 0))

      const finishedContests = sortedContests.filter((contest) => {
        const duration = contest.durationSeconds > 3e9 ? 0 : (contest.durationSeconds || 0)
        return (contest.startTimeSeconds || 0) + duration <= nowSeconds
      })

      const candidateContests = [...finishedContests, ...sortedContests].slice(0, 120)
      const foundCards = []
      const visited = new Set()

      for (const contest of candidateContests) {
        const contestId = String(contest.id || contest.contestId || '')
        if (!contestId) continue

        const dedupeKey = `${String(contest.platform || 'CODEFORCES').toUpperCase()}:${contestId}`
        if (visited.has(dedupeKey)) continue
        visited.add(dedupeKey)

        try {
          const participantResponse = await apiClient.getContestParticipants(
            contest.platform || 'CODEFORCES',
            contestId,
          )
          const participants = participantResponse.success ? (participantResponse.data || []) : []
          if (participants.length === 0) continue

          foundCards.push({
            ...contest,
            id: contestId,
            participants: participants.slice(0, 4),
            participantCount: participants.length,
          })

          if (foundCards.length >= 25) break
        } catch (err) {
          console.error('Error loading contest participants:', err)
        }
      }

      setContestFeed(foundCards)
    } catch (err) {
      console.error('Error loading contest feed:', err)
      setContestFeed([])
    } finally {
      setLoadingContests(false)
    }
  }

  const getContestLink = (contest) => {
    const platform = String(contest.platform || 'CODEFORCES').toUpperCase()
    const contestId = contest.id || contest.contestId
    if (platform === 'LEETCODE') return `https://leetcode.com/contest/${contestId}`
    if (platform === 'ATCODER') return `https://atcoder.jp/contests/${contestId}`
    if (platform === 'CODECHEF') return `https://www.codechef.com/${contestId}`
    return `https://codeforces.com/contest/${contestId}`
  }

  const getPlatformIcon = (platform) => {
    const value = String(platform || 'CODEFORCES').toLowerCase()
    if (value === 'codeforces') return '/codeforces.svg'
    if (value === 'leetcode') return '/leetcode.svg'
    if (value === 'atcoder') return '/atcoder.svg'
    if (value === 'codechef') return '/codechef.svg'
    return null
  }

  const formatContestDate = (seconds) => {
    if (!seconds) return ''
    return DateTime.fromSeconds(seconds).setZone('America/Lima').setLocale('es').toFormat('dd LLL yyyy, HH:mm')
  }

  const formatContestDuration = (seconds) => {
    const safeSeconds = seconds > 3e9 ? 0 : seconds
    const hours = Math.floor(safeSeconds / 3600)
    const minutes = Math.floor((safeSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const handleUserSort = (column) => {
    if (userSortBy === column) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setUserSortBy(column)
      setUserSortOrder('desc')
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aVal = a[userSortBy] || 0
    const bVal = b[userSortBy] || 0
    return userSortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  const totalScore = users.reduce((acc, user) => acc + Number(user.total_score || 0), 0)
  const totalSubmissions = users.reduce((acc, user) => acc + Number(user.total_submissions || 0), 0)
  const topStreak = users.reduce((max, user) => Math.max(max, Number(user.current_streak || 0)), 0)
  const totalContestPages = Math.max(1, Math.ceil(contestFeed.length / CONTESTS_PER_PAGE))
  const visibleContests = contestFeed.slice(
    (contestPage - 1) * CONTESTS_PER_PAGE,
    contestPage * CONTESTS_PER_PAGE,
  )

  useEffect(() => {
    setContestPage(1)
  }, [contestFeed.length])

  useEffect(() => {
    fetchUsers()
    fetchSubmissions()
    fetchContestFeed()
  }, [period, sortBy, sortOrder, platformFilter])

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const SortableHeader = ({ column, children }) => {
    const isActive = userSortBy === column
    return (
      <TableHead
        className="cursor-pointer text-center transition-colors hover:bg-muted/50"
        onClick={() => handleUserSort(column)}
      >
        <div className="flex items-center justify-center gap-1">
          {children}
          {isActive ? (
            userSortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-50" />
          )}
        </div>
      </TableHead>
    )
  }

  const statCards = [
    {
      label: 'Participantes',
      value: users.length,
      icon: Users,
      tone: 'from-cyan-500/24 via-cyan-300/10 to-transparent',
    },
    {
      label: 'Score total',
      value: totalScore,
      icon: Trophy,
      tone: 'from-emerald-500/24 via-emerald-300/10 to-transparent',
    },
    {
      label: 'Envíos',
      value: totalSubmissions,
      icon: BarChart3,
      tone: 'from-sky-500/24 via-sky-300/10 to-transparent',
    },
    {
      label: 'Mejor racha',
      value: `${topStreak} días`,
      icon: Flame,
      tone: 'from-teal-500/24 via-teal-300/10 to-transparent',
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-4 lg:gap-7">
      <motion.section
        className="hero-grid surface-panel relative overflow-hidden rounded-[1.75rem] p-4 md:p-5 lg:p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-primary/32 to-accent/34 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-20 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/22 to-transparent blur-3xl" />

        <div className="relative z-10 grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              Ranking Competitivo
            </p>
            <h1 className="max-w-2xl text-2xl font-black leading-tight md:text-4xl lg:text-5xl">
              TrackingCF en vivo para equipos que entrenan en serio.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Visualiza progresos, rachas y consistencia de resolución en una sola vista. Ordena,
              filtra y entra a cada perfil para revisar su evolución.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <RefreshCw className="h-3.5 w-3.5" />
              Última sincronización: {lastTrackerRun || 'Cargando...'}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`surface-panel soft-enter rounded-2xl bg-gradient-to-br ${stat.tone} p-3 md:p-4`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    <Icon className="h-4 w-4 shrink-0 text-foreground/75" />
                  </div>
                  <p className="text-xl font-black leading-none md:text-2xl">{stat.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr] xl:items-start">
        <div className="space-y-5">
          <PeriodFilter period={period} onPeriodChange={setPeriod} />

          <Card className="surface-panel rounded-[1.75rem]">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-[2rem]">Tabla de Clasificación</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click en un usuario para ver detalles
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                  Actualizado: {lastTrackerRun || 'Cargando...'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border bg-background/65">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Usuario</TableHead>
                      <SortableHeader column="count_no_rating">Sin rating</SortableHeader>
                      <SortableHeader column="count_800_900">800-900</SortableHeader>
                      <SortableHeader column="count_1000">1000</SortableHeader>
                      <SortableHeader column="count_1100">1100</SortableHeader>
                      <SortableHeader column="count_1200_plus">1200+</SortableHeader>
                      <SortableHeader column="total_submissions">Total</SortableHeader>
                      <SortableHeader column="total_score">Score</SortableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((user, index) => {
                      const platformHandles = [
                        user.leetcode_handle ? `LC: ${user.leetcode_handle}` : null,
                        user.atcoder_handle ? `AC: ${user.atcoder_handle}` : null,
                        user.codechef_handle ? `CC: ${user.codechef_handle}` : null,
                      ].filter(Boolean)

                      return (
                        <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Link href={`/user/${user.handle}`}>
                                {user.avatar_url ? (
                                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full transition-all hover:ring-2 hover:ring-primary/20">
                                    <Image
                                      src={user.avatar_url}
                                      alt={user.handle}
                                      width={32}
                                      height={32}
                                      className="h-full w-full object-cover"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </Link>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link href={`/user/${user.handle}`} className="hover:underline">
                                    <span className={getRatingColorClass(user.rating)}>{user.handle}</span>
                                  </Link>
                                  <StreakBadge streak={user.current_streak} isActive={user.streak_active} />
                                </div>
                                {user.rating && (
                                  <div className="text-xs text-muted-foreground">
                                    {user.rank} • {user.rating}
                                  </div>
                                )}
                                {platformHandles.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
                                    {platformHandles.map((handleLabel) => (
                                      <span
                                        key={handleLabel}
                                        className="rounded-full border border-border bg-background/70 px-2 py-0.5"
                                      >
                                        {handleLabel}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-base">
                              {user.count_no_rating || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-base">
                              {user.count_800_900 || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-base">
                              {user.count_1000 || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-base">
                              {user.count_1100 || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-base">
                              {user.count_1200_plus || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-base">
                              {user.total_submissions || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="text-base font-bold shadow-sm">
                              {user.total_score || 0}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel rounded-[1.75rem]">
            <CardContent className="p-4 md:p-5">
              <LatestSubmissions
                submissions={submissions}
                loading={loadingSubmissions}
                sortBy={sortBy}
                sortOrder={sortOrder}
                platformFilter={platformFilter}
                atcoderEnabled={atcoderEnabled}
                onPlatformChange={setPlatformFilter}
                onSortChange={(field, order) => {
                  setSortBy(field)
                  setSortOrder(order)
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="surface-panel rounded-[1.75rem]">
            <CardContent className="p-5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Resumen</p>
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border bg-background/50 p-4">
                    <p className="text-xs text-muted-foreground">Usuarios</p>
                    <p className="mt-1 text-2xl font-black">{users.length}</p>
                  </div>
                  <div className="rounded-2xl border bg-background/50 p-4">
                    <p className="text-xs text-muted-foreground">Top racha</p>
                    <p className="mt-1 text-2xl font-black">{topStreak}</p>
                  </div>
                  <div className="rounded-2xl border bg-background/50 p-4">
                    <p className="text-xs text-muted-foreground">Última sync</p>
                    <p className="mt-1 text-sm font-medium leading-5">{lastTrackerRun || 'Cargando...'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel rounded-[1.75rem]">
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contests</p>
                  <h3 className="mt-1 text-lg font-bold">Contests recientes con participantes</h3>
                  <p className="text-sm text-muted-foreground">
                    Lista desde el contest más reciente hacia abajo, mostrando solo los que tienen usuarios rastreados.
                  </p>
                </div>

                <div className="space-y-3">
                  {loadingContests ? (
                    <div className="space-y-3">
                      <div className="h-24 rounded-2xl border bg-muted/30" />
                      <div className="h-24 rounded-2xl border bg-muted/30" />
                    </div>
                  ) : contestFeed.length > 0 ? (
                    visibleContests.map((contest) => (
                      <a
                        key={`${contest.platform}:${contest.id}`}
                        href={getContestLink(contest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-2xl border bg-card/90 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgba(2,51,82,0.55)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(contest.platform) && (
                                <Image
                                  src={getPlatformIcon(contest.platform)}
                                  alt={contest.platform}
                                  width={18}
                                  height={18}
                                  className="h-4.5 w-4.5 flex-shrink-0 object-contain"
                                  unoptimized
                                />
                              )}
                              <span className="truncate text-sm font-semibold">{contest.name}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{contest.id}</span>
                              <span>•</span>
                              <span>{formatContestDate(contest.startTimeSeconds)}</span>
                              <span>•</span>
                              <span>{formatContestDuration(contest.durationSeconds)}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {contest.participantCount}
                          </Badge>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {contest.participants.map((participant) => (
                            <span
                              key={participant.id || participant.handle}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
                            >
                              {participant.avatar_url ? (
                                <Image
                                  src={participant.avatar_url}
                                  alt={participant.handle}
                                  width={16}
                                  height={16}
                                  className="h-4 w-4 rounded-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted">
                                  <User className="h-2.5 w-2.5 text-muted-foreground" />
                                </div>
                              )}
                              <span className="truncate">{participant.handle}</span>
                            </span>
                          ))}
                          {contest.participantCount > contest.participants.length && (
                            <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
                              +{contest.participantCount - contest.participants.length}
                            </span>
                          )}
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed bg-background/55 p-4 text-sm text-muted-foreground">
                      No contest data available yet.
                    </div>
                  )}
                </div>

                {!loadingContests && contestFeed.length > 0 && (
                  <div className="flex items-center justify-between gap-2 border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      Mostrando {(contestPage - 1) * CONTESTS_PER_PAGE + 1}-
                      {Math.min(contestPage * CONTESTS_PER_PAGE, contestFeed.length)} de {contestFeed.length}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setContestPage((p) => Math.max(1, p - 1))}
                        disabled={contestPage === 1}
                        className="rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Anterior
                      </button>
                      <span className="px-1.5 text-xs text-muted-foreground">
                        {contestPage}/{totalContestPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setContestPage((p) => Math.min(totalContestPages, p + 1))}
                        disabled={contestPage === totalContestPages}
                        className="rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
