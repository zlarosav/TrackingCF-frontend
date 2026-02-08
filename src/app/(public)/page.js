'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiClient } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, User, Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import LatestSubmissions from '@/components/LatestSubmissions'
import PeriodFilter from '@/components/PeriodFilter'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'

export default function HomePage() {
  const [users, setUsers] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [error, setError] = useState(null)
  const [lastTrackerRun, setLastTrackerRun] = useState(null)
  const [period, setPeriod] = useState('month')
  const [sortBy, setSortBy] = useState('submission_time')
  const [sortOrder, setSortOrder] = useState('desc')
  const [userSortBy, setUserSortBy] = useState('total_score')
  const [userSortOrder, setUserSortOrder] = useState('desc')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getUsers(period)
      if (response.success) {
        setUsers(response.data)
        // Update tracker timestamp with fallback (already formatted by backend)
        const trackerTime = response.lastTrackerRun || 
                           (response.data.length > 0 ? response.data[0].last_updated : null)
        if (trackerTime) {
          setLastTrackerRun(trackerTime) // Already a formatted string from backend
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
      const response = await apiClient.getAllLatestSubmissions(period, sortBy, sortOrder, 18)
      if (response.success) {
        setSubmissions(response.data.submissions)
      }
    } catch (err) {
      console.error('Error al cargar submissions:', err)
    } finally {
      setLoadingSubmissions(false)
    }
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

  useEffect(() => {
    fetchUsers()
    fetchSubmissions()
  }, [period, sortBy, sortOrder])

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
        className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => handleUserSort(column)}
      >
        <div className="flex items-center justify-center gap-1">
          {children}
          {isActive ? (
            userSortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-50" />
          )}
        </div>
      </TableHead>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Periodo */}
      <PeriodFilter period={period} onPeriodChange={setPeriod} />



      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🏆 Tabla de Clasificación</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Usuario</TableHead>
                  <SortableHeader column="count_no_rating">
                    Sin rating
                  </SortableHeader>
                  <SortableHeader column="count_800_900">
                    800-900
                  </SortableHeader>
                  <SortableHeader column="count_1000">
                    1000
                  </SortableHeader>
                  <SortableHeader column="count_1100">
                    1100
                  </SortableHeader>
                  <SortableHeader column="count_1200_plus">
                    1200+
                  </SortableHeader>
                  <SortableHeader column="total_submissions">
                    Total
                  </SortableHeader>
                  <SortableHeader column="total_score">
                    Score
                  </SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Avatar Clickable */}
                        <Link href={`/user/${user.handle}`}>
                            {user.avatar_url ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary/20 transition-all">
                                <Image
                                  src={user.avatar_url}
                                  alt={user.handle}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                        </Link>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            {/* Username Clickable */}
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
                      <Badge className="font-bold text-base">
                        {user.total_score || 0}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Submissions */}
      <Card>
        <CardContent className="pt-6">
           <LatestSubmissions
            submissions={submissions}
            loading={loadingSubmissions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(field, order) => {
              setSortBy(field);
              setSortOrder(order);
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
