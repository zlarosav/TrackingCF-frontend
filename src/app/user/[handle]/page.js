'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, User } from 'lucide-react'
import FilterBar from '@/components/FilterBar'
import UserGrid from '@/components/UserGrid'
import StatsCard from '@/components/StatsCard'
import ChartView from '@/components/ChartView'

export default function UserPage({ params }) {
  const { handle } = params
  const [user, setUser] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    ratingMin: '',
    ratingMax: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'submission_time',
    order: 'desc',
    noRating: false
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [userRes, submissionsRes, statsRes] = await Promise.all([
        apiClient.getUser(handle),
        apiClient.getSubmissions(handle, {
          ...filters,
          noRating: filters.noRating ? 'true' : undefined,
          limit: 1000
        }),
        apiClient.getStats(handle)
      ])

      if (userRes.success) setUser(userRes.data)
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
  }, [handle, filters])

  if (loading && !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error && !user) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={handle}
              width={64}
              height={64}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{handle}</h1>
            {user?.rating && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{user.rank}</Badge>
                <span className="text-muted-foreground">•</span>
                <span className="font-semibold">{user.rating}</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Última actualización: {new Date(user?.last_updated).toLocaleString('es-PE')}
            </p>
          </div>
        </div>
        <a
          href={`https://codeforces.com/profile/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">
            Ver en Codeforces
          </Button>
        </a>
      </div>

      {/* Stats Cards */}
      {stats?.generalStats && (
        <StatsCard stats={stats.generalStats} />
      )}

      {/* Charts */}
      {stats && (
        <ChartView stats={stats} />
      )}

      {/* Filters */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Submissions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            Problemas Resueltos
            <Badge variant="secondary" className="ml-2">
              {submissions.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            {filters.ratingMin || filters.ratingMax || filters.dateFrom || filters.dateTo || filters.noRating
              ? 'Resultados filtrados'
              : 'Mostrando todos los problemas resueltos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserGrid submissions={submissions} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}
