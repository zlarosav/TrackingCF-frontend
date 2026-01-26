'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DateTime } from 'luxon'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Clock } from 'lucide-react'

export default function ContestsPage() {
  const [allContests, setAllContests] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [lastUpdated, setLastUpdated] = useState(null)
  const [filter, setFilter] = useState('ALL') // ALL, CODEFORCES, LEETCODE, ATCODER, CODECHEF
  
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

  const renderContestCard = (contest, isPast = false) => {
      const startDate = DateTime.fromSeconds(contest.startTimeSeconds).setZone('America/Lima');
      const nowMillis = now.toMillis();
      const startMillis = contest.startTimeSeconds * 1000;
      // Safety clamp for display calculation
      const duration = contest.durationSeconds > 3e9 ? 1 : contest.durationSeconds; 
      const endMillis = startMillis + (duration * 1000);
      
      const isLive = nowMillis >= startMillis && nowMillis < endMillis;
      const isFinished = nowMillis >= endMillis;
      const isBefore24h = !isFinished && !isLive && (startMillis - nowMillis) < 24 * 60 * 60 * 1000;

      const cardOpacity = isPast ? 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100' : 'opacity-100';
      const borderClass = isLive ? 'border-green-500 border-2' : (isBefore24h ? 'border-primary border-l-4' : '');

      return (
        <Card key={contest.id} className={`transition-all ${cardOpacity} ${borderClass} h-full`}>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div className="flex items-center gap-2 overflow-hidden max-w-full">
                   <img 
                      src={getPlatformIcon(contest.platform)} 
                      alt={contest.platform} 
                      className="w-6 h-6 object-contain flex-shrink-0" 
                      onError={(e) => e.target.style.display = 'none'} 
                   />
                  <CardTitle className="text-lg leading-tight truncate" title={contest.name}>
                    {contest.name}
                  </CardTitle>
              </div>
              <a 
                href={getContestLink(contest)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary flex-shrink-0"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span className="capitalize">{startDate.setLocale('es').toFormat('cccc dd LLL yyyy, HH:mm')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Duración: {formatDuration(contest.durationSeconds)}</span>
              </div>

                  <div className="mt-2 text-right">
                     <div className={`font-mono text-lg font-bold ${isLive ? 'text-green-600' : (isPast ? 'text-muted-foreground' : 'text-primary')}`}>
                        {getTimeRemaining(contest.startTimeSeconds, contest.durationSeconds)}
                     </div>
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
    <div className="space-y-8 max-w-5xl mx-auto">
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
