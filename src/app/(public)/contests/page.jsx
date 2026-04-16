'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DateTime } from 'luxon'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Clock, User } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { Badge } from '@/components/ui/badge'

export default function ContestsPage() {
  const [allContests, setAllContests] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filter, setFilter] = useState('ALL') // ALL, CODEFORCES, LEETCODE, ATCODER, CODECHEF
  const [expandedContest, setExpandedContest] = useState(null)
  const [participantsByContest, setParticipantsByContest] = useState({})
  const [loadingParticipants, setLoadingParticipants] = useState({})
  
  // Refresh counters every second
  const [now, setNow] = useState(DateTime.now())

  useEffect(() => {
    fetchContests()
    const timer = setInterval(() => {
      setNow(DateTime.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Re-run filtering when filter state changes or contests are loaded
  useEffect(() => {
      if (!allContests.length) return;
      applyFilters();
  }, [filter, allContests, now])

  const fetchContests = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await axios.get(`${apiUrl}/contests`)
      
      if (response.data.success) {
        setAllContests(response.data.data)
        if (response.data.lastUpdated) {
            setLastUpdated(response.data.lastUpdated)
        }
      } else {
        setError('Error al cargar contests')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
      let filtered = allContests;
      
      if (filter !== 'ALL') {
          filtered = filtered.filter(c => c.platform === filter);
      }

      const nowSec = now.toSeconds(); 
      const tenDaysInSec = 10 * 24 * 3600;
        
      // Upcoming: Contest hasn't finished yet (now < startTime + duration)
      // PLUS Filter: start time must be less than Now + 10 days
      const currentOrFuture = filtered.filter(c => {
          const duration = c.durationSeconds > 3e9 ? 0 : c.durationSeconds; // Safeguard for infinite duration
          const hasNotFinished = (c.startTimeSeconds + duration > nowSec);
          if (!hasNotFinished) return false;
          
          return c.startTimeSeconds < (nowSec + tenDaysInSec);
      });
      
      // Finished: current time is past the end time (now >= startTime + duration)
      const finished = filtered.filter(c => 
          (c.startTimeSeconds + (c.durationSeconds > 3e9 ? 0 : c.durationSeconds) <= nowSec)
      );

      // Sort Upcoming: ASC by start time (soonest first)
      currentOrFuture.sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
      
      // Sort Past: DESC by start time (most recent first)
      finished.sort((a, b) => b.startTimeSeconds - a.startTimeSeconds);

      setUpcoming(currentOrFuture.slice(0, 20)); 
      setPast(finished.slice(0, 10));
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getTimeRemaining = (startTimeSeconds, durationSeconds) => {
    const start = DateTime.fromSeconds(startTimeSeconds)
    const duration = durationSeconds > 3e9 ? 0 : durationSeconds;
    const end = start.plus({ seconds: duration })
    
    if (now >= start && now < end) return "En curso"
    if (now >= end) return "Finalizado"
    
    const diff = start.diff(now, ['days', 'hours', 'minutes', 'seconds'])
    
    if (diff.milliseconds < 0) return "En curso" 
    
    const parts = []
    if (diff.days > 0) parts.push(`${diff.days}d`)
    if (diff.hours > 0) parts.push(`${diff.hours}h`)
    if (diff.minutes > 0) parts.push(`${diff.minutes}m`)
    parts.push(`${Math.floor(diff.seconds)}s`)
    
    return parts.join(' ')
  }

  const getPlatformIcon = (platform) => {
      const p = platform ? platform.toLowerCase() : 'codeforces';
      if (p === 'codeforces') return '/codeforces.svg';
      if (p === 'leetcode') return '/leetcode.svg';
      if (p === 'atcoder') return '/atcoder.svg';
      if (p === 'codechef') return '/codechef.svg';
      return null;
  }
  
  const getContestLink = (contest) => {
      const p = contest.platform ? contest.platform.toUpperCase() : 'CODEFORCES';
      if (p === 'LEETCODE') return `https://leetcode.com/contest/${contest.id}`;
      if (p === 'ATCODER') return `https://atcoder.jp/contests/${contest.id}`;
      if (p === 'CODECHEF') return `https://www.codechef.com/${contest.id}`;
      return `https://codeforces.com/contests/${contest.id}`;
  }

    const getContestKey = (contest) => `${contest.platform || 'CODEFORCES'}:${contest.id}`

    const toggleParticipants = async (contest) => {
      const key = getContestKey(contest)

      if (expandedContest === key) {
        setExpandedContest(null)
        return
      }

      setExpandedContest(key)

      if (participantsByContest[key]) return

      setLoadingParticipants(prev => ({ ...prev, [key]: true }))
      try {
        const response = await apiClient.getContestParticipants(contest.platform || 'CODEFORCES', contest.id)
        if (response.success) {
          setParticipantsByContest(prev => ({ ...prev, [key]: response.data || [] }))
        }
      } catch (err) {
        console.error('Error cargando participantes:', err)
        setParticipantsByContest(prev => ({ ...prev, [key]: [] }))
      } finally {
        setLoadingParticipants(prev => ({ ...prev, [key]: false }))
      }
    }

  const renderContestCard = (contest, isPast = false) => {
      const key = getContestKey(contest)
      const participants = participantsByContest[key] || []
      const startDate = DateTime.fromSeconds(contest.startTimeSeconds).setZone('America/Lima');
      const nowMillis = now.toMillis();
      const startMillis = contest.startTimeSeconds * 1000;
      // Safety clamp for display calculation
      const duration = contest.durationSeconds > 3e9 ? 1 : contest.durationSeconds; 
      const endMillis = startMillis + (duration * 1000);
      
      const isLive = nowMillis >= startMillis && nowMillis < endMillis;
      const isFinished = nowMillis >= endMillis;
      const isBefore24h = !isFinished && !isLive && (startMillis - nowMillis) < 24 * 60 * 60 * 1000;

      const cardOpacity = isPast ? 'opacity-80 grayscale hover:grayscale-0 hover:opacity-100' : 'opacity-100';
      const borderClass = isLive ? 'border-green-500' : (isBefore24h ? 'border-primary' : 'border-border');
      const statusLabel = isLive ? 'En curso' : (isBefore24h ? 'Próximo' : (isPast ? 'Finalizado' : 'Programado'))
      const statusTone = isLive
        ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30'
        : (isBefore24h
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-muted/50 text-muted-foreground border-border')

      return (
        <Card key={contest.id} className={`group relative overflow-hidden rounded-2xl border bg-card/90 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(2,51,82,0.55)] ${cardOpacity} ${borderClass}`}>
          <div className={`absolute top-0 left-0 right-0 h-1 ${isLive ? 'bg-green-500' : (isBefore24h ? 'bg-primary' : 'bg-border')}`} />
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <img
                    src={getPlatformIcon(contest.platform)}
                    alt={contest.platform}
                    className="h-5 w-5 flex-shrink-0 object-contain"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <CardTitle className="truncate text-base font-semibold leading-tight" title={contest.name}>
                    {contest.name}
                  </CardTitle>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{contest.id}</span>
                  <span>•</span>
                  <span className="capitalize">{startDate.setLocale('es').toFormat('cccc dd LLL yyyy, HH:mm')}</span>
                </div>
              </div>

              <a
                href={getContestLink(contest)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-full border border-border bg-background/70 p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-medium">
                  {contest.platform}
                </Badge>
                <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-medium ${statusTone}`}>
                  {statusLabel}
                </Badge>
                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium">
                  {formatDuration(contest.durationSeconds)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                <span>{getTimeRemaining(contest.startTimeSeconds, contest.durationSeconds)}</span>
              </div>

              <div className="rounded-2xl border bg-background/60 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    Participantes
                  </div>
                  <button
                    onClick={() => toggleParticipants(contest)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {expandedContest === key ? 'Ocultar' : 'Ver lista'}
                  </button>
                </div>

                {expandedContest === key ? (
                  loadingParticipants[key] ? (
                    <div className="text-sm text-muted-foreground">Cargando participantes...</div>
                  ) : participants.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {participants.map((participant) => (
                        <Link
                          key={participant.id}
                          href={`/user/${participant.handle}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-muted/50"
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
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Aún no hay participantes rastreados para este contest.
                    </div>
                  )
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {participants.slice(0, 3).map((participant) => (
                      <span
                        key={participant.id}
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
                    {participants.length > 3 && (
                      <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
                        +{participants.length - 3}
                      </span>
                    )}
                    {participants.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Sin participantes cargados aún.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
            <p className="text-muted-foreground">
              Calendario de competencias en vivo y por venir.
            </p>
            {lastUpdated && DateTime.fromISO(lastUpdated).isValid && (
                <p className="text-xs text-muted-foreground mt-1">
                    Actualizado: {DateTime.fromISO(lastUpdated).setZone('America/Lima').setLocale('es').toFormat('dd LLL HH:mm')}
                </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
              {['ALL', 'CODEFORCES', 'LEETCODE', 'ATCODER', 'CODECHEF'].map(f => (
                  <Button 
                    key={f} 
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="capitalize"
                  >
                      {f === 'ALL' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
                  </Button>
              ))}
          </div>
      </div>

      {allContests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No hay contests registrados. Intenta recargar.
          </CardContent>
        </Card>
      ) : (
          <>
            {/* Upcoming Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Próximos</h2>

                {upcoming.length === 0 && (
                     <div className="text-muted-foreground italic">No hay contests próximos con este filtro.</div>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {upcoming.map(c => renderContestCard(c, false))}
                </div>
            </section>

            {/* Separator */}
            <div className="border-t border-border/50"></div>

            {/* Past Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-muted-foreground/80">Recientes</h2>
                
                {past.length === 0 && (
                    <div className="text-muted-foreground italic">No hay contests recientes con este filtro (o están fuera del límite).</div>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 opacity-80">
                    {past.map(c => renderContestCard(c, true))}
                </div>
            </section>
          </>
      )}
    </div>
  )
}
