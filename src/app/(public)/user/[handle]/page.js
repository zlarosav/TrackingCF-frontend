'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiClient } from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, ExternalLink, Medal, Calendar, TrendingUp, Star, Award, Flame } from 'lucide-react'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'
import UserTabs from '@/components/user/UserTabs'
import { Card } from "@/components/ui/card"

export default function UserPage({ params }) {
  const { handle } = params
  const [user, setUser] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      const [userRes, submissionsRes, statsRes] = await Promise.all([
        apiClient.getUser(handle),
        apiClient.getSubmissions(handle, { limit: 1000 }),
        apiClient.getStats(handle)
      ])
      if (userRes.success) setUser(userRes.data); else throw new Error('User not found')
      if (submissionsRes.success) setSubmissions(submissionsRes.data.submissions)
      if (statsRes.success) setStats(statsRes.data)
    } catch (err) { setError('Error al cargar los datos del usuario'); console.error(err)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [handle])

  if (loading && !user) return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  )

  if (error || !user) return (
    <Card className="rounded-xl p-6 text-center">
      <Award className="h-10 w-10 text-muted mx-auto mb-3" />
      <p className="text-body-md text-muted mb-3">{error || 'Usuario no encontrado'}</p>
      <Link href="/"><Button variant="secondary" size="sm"><ArrowLeft className="mr-1 h-3 w-3" /> Volver</Button></Link>
    </Card>
  )

  const platforms = [
    user.leetcode_handle && { label: 'LeetCode', handle: user.leetcode_handle, icon: '/leetcode.svg' },
    user.atcoder_handle && { label: 'AtCoder', handle: user.atcoder_handle, icon: '/atcoder.svg' },
    user.codechef_handle && { label: 'CodeChef', handle: user.codechef_handle, icon: '/codechef.svg' },
  ].filter(Boolean)

  return (
    <div className="animate-fade-in space-y-5 max-w-5xl mx-auto">
      {/* Profile header — Binance trader profile style */}
      <Card className="rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-transparent h-1" />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <Link href="/"><Button variant="secondary" size="icon" className="h-8 w-8 shrink-0 mt-1"><ArrowLeft className="h-3.5 w-3.5" /></Button></Link>
            <div className="relative shrink-0">
              {user?.avatar_url ? (
                <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-surface-elevated-dark">
                  <Image src={user.avatar_url} alt={handle} width={64} height={64} className="h-full w-full object-cover" unoptimized />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated-dark ring-2 ring-surface-elevated-dark">
                  <User className="h-8 w-8 text-muted" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1"><StreakBadge streak={user?.current_streak} isActive={user?.streak_active} /></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`text-title-lg text-on-dark ${getRatingColorClass(user?.rating)?.replace('font-', '') || ''}`}>{handle}</h1>
                {user?.rating && <Badge variant="secondary" className="font-medium text-caption">{user.rank}</Badge>}
                <a href={`https://codeforces.com/profile/${handle}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="default" size="sm" className="h-7 gap-1.5 text-caption">
                    <ExternalLink className="h-3 w-3" />CF
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-body-sm text-muted mt-1.5">
                {user?.rating && (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <Medal className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-primary">{user.rating}</span>
                    </span>
                    <span className="text-surface-elevated-dark">|</span>
                  </>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {user?.last_submission_time ? new Date(user.last_submission_time).toLocaleDateString() : 'Sin actividad'}
                </span>
                {user?.current_streak > 0 && (
                  <>
                    <span className="text-surface-elevated-dark">|</span>
                    <span className="inline-flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-orange-500">{user.current_streak}d racha</span>
                    </span>
                  </>
                )}
              </div>
              {platforms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {platforms.map(({ label, handle: h, icon }) => (
                    <span key={label} className="inline-flex items-center gap-1 rounded-sm bg-surface-elevated-dark px-1.5 py-0.5 text-[11px] text-muted">
                      <img src={icon} alt={label} className="h-3 w-3 object-contain" />{h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      {stats?.generalStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Score', value: stats.generalStats.total_score || 0, isYellow: true },
            { label: 'Envíos', value: stats.generalStats.total_submissions || 0, isGreen: true },
            { label: 'Rating max', value: user?.rating || '—', isYellow: true },
            { label: '1200+', value: stats.generalStats.count_1200_plus || 0, isGreen: true },
          ].map(({ label, value, isYellow, isGreen }) => (
            <Card key={label} className="flex flex-col p-3 rounded-xl">
              <span className="text-caption text-muted">{label}</span>
              <span className={`text-title-lg mt-0.5 ${isYellow ? 'text-primary' : isGreen ? 'text-trading-up' : 'text-on-dark'}`}>{value}</span>
            </Card>
          ))}
        </div>
      )}

      <UserTabs user={user} submissions={submissions} stats={stats} handle={handle} />
    </div>
  )
}
