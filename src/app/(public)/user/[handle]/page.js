'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiClient } from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, ExternalLink, Medal, Calendar } from 'lucide-react'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'
import UserTabs from '@/components/user/UserTabs'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
      <div className="flex items-center gap-4"><Skeleton className="h-14 w-14 rounded-xl" /><div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-3 w-28" /></div></div>
      <Skeleton className="h-10 w-full rounded-lg" /><Skeleton className="h-80 w-full rounded-lg" />
    </div>
  )

  if (error || !user) return (
    <Card className="border-destructive/40">
      <CardHeader><CardTitle className="text-destructive text-sm">Error</CardTitle></CardHeader>
      <CardContent><p className="text-xs text-muted-foreground">{error || 'Usuario no encontrado'}</p>
        <Link href="/"><Button variant="outline" size="sm" className="mt-3"><ArrowLeft className="mr-1 h-3 w-3" /> Volver</Button></Link>
      </CardContent>
    </Card>
  )

  const platforms = [
    user.leetcode_handle && { label: 'LeetCode', handle: user.leetcode_handle, icon: '/leetcode.svg' },
    user.atcoder_handle && { label: 'AtCoder', handle: user.atcoder_handle, icon: '/atcoder.svg' },
    user.codechef_handle && { label: 'CodeChef', handle: user.codechef_handle, icon: '/codechef.svg' },
  ].filter(Boolean)

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-start gap-4">
        <Link href="/"><Button variant="outline" size="icon" className="h-8 w-8 rounded-lg shrink-0 mt-1"><ArrowLeft className="h-3.5 w-3.5" /></Button></Link>
        <div className="relative shrink-0">
          {user?.avatar_url ? (
            <div className="h-14 w-14 overflow-hidden rounded-xl border-2 border-border"><Image src={user.avatar_url} alt={handle} width={56} height={56} className="h-full w-full object-cover" unoptimized /></div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted border-2 border-border"><User className="h-7 w-7 text-muted-foreground" /></div>
          )}
          <div className="absolute -bottom-1.5 -right-1.5"><StreakBadge streak={user?.current_streak} isActive={user?.streak_active} /></div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={`text-xl font-black tracking-tight ${getRatingColorClass(user?.rating)}`}>{handle}</h1>
            {user?.rating && <Badge variant="secondary" className="font-medium text-[10px]">{user.rank}</Badge>}
            <a href={`https://codeforces.com/profile/${handle}`} target="_blank" rel="noopener noreferrer" className="shrink-0"><Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]"><ExternalLink className="h-3 w-3" />CF</Button></a>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
            {user?.rating && <><span className="inline-flex items-center gap-1"><Medal className="h-3 w-3" /><span className="font-mono font-semibold">{user.rating}</span></span><span className="text-muted-foreground/30">|</span></>}
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{user?.last_submission_time ? new Date(user.last_submission_time).toLocaleDateString() : 'Sin actividad'}</span>
          </div>
          {platforms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {platforms.map(({ label, handle: h, icon }) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/20 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  <img src={icon} alt={label} className="h-3 w-3 object-contain" />{h}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <UserTabs user={user} submissions={submissions} stats={stats} handle={handle} />
    </div>
  )
}
