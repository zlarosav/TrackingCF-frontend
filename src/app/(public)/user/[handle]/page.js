'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiClient } from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User } from 'lucide-react'
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
      setLoading(true)
      setError(null)

      // Fetch all necessary data upfront
      const [userRes, submissionsRes, statsRes] = await Promise.all([
        apiClient.getUser(handle),
        apiClient.getSubmissions(handle, { limit: 1000 }), // Get last 1000 for stats/tables
        apiClient.getStats(handle)
      ])

      if (userRes.success) setUser(userRes.data)
      else throw new Error('User not found')

      if (submissionsRes.success) setSubmissions(submissionsRes.data.submissions)
      if (statsRes.success) setStats(statsRes.data)

    } catch (err) {
      setError('Error al cargar los datos del usuario')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [handle])

  if (loading && !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || 'Usuario no encontrado'}</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          
          <div className="relative">
            {user?.avatar_url ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                <Image
                  src={user.avatar_url}
                  alt={handle}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-muted-foreground/10">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
                 <StreakBadge streak={user?.current_streak} isActive={user?.streak_active} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-4xl font-bold tracking-tight ${getRatingColorClass(user?.rating)}`}>
                {handle}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-sm">
              {user?.rating && (
                <>
                  <Badge variant="secondary" className="font-semibold">
                    {user.rank}
                  </Badge>
                  <span className="font-mono font-bold text-foreground/80">
                    Rating: {user.rating}
                  </span>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              <span className="text-muted-foreground">
                Última vez: {user?.last_submission_time ? new Date(user.last_submission_time).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <a
          href={`https://codeforces.com/profile/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="gap-2">
            Ver en Codeforces
          </Button>
        </a>
      </div>

      {/* Tabs Interface */}
      <UserTabs 
        user={user} 
        submissions={submissions} 
        stats={stats} 
        handle={handle}
      />
    </div>
  )
}
