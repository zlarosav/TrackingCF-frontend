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
import { Trophy, Users, RefreshCw, User, Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import LatestSubmissions from '@/components/LatestSubmissions'
import PeriodFilter from '@/components/PeriodFilter'

export default function HomePage() {
  const [users, setUsers] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
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
        setLastUpdate(new Date())
      }
    } catch (err) {
      setError('Error al cargar los usuarios. Verifica que el backend esté corriendo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true)
      const response = await apiClient.getAllLatestSubmissions(period, sortBy, sortOrder, 20)
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

    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      fetchUsers()
      fetchSubmissions()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

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

  if (error && users.length === 0) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Error de Conexión</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Asegúrate de que el backend esté corriendo en{' '}
            <code className="bg-muted px-1 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}
            </code>
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalUsers = sortedUsers.length
  const totalScore = sortedUsers.reduce((sum, u) => sum + (parseInt(u.total_score) || 0), 0)
  const topUser = sortedUsers[0]

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
      {/* Filtro de Período */}
      <PeriodFilter period={period} onPeriodChange={setPeriod} />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Trackeando problemas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Total</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScore}</div>
            <p className="text-xs text-muted-foreground">
              Puntos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Líder Actual</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topUser?.handle || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topUser?.total_score || 0} puntos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tabla de Clasificación</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Click en un usuario para ver detalles
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              Actualizado: {lastUpdate.toLocaleTimeString('es-PE')}
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
                  <SortableHeader column="total_submissions">
                    Total
                  </SortableHeader>
                  <SortableHeader column="count_no_rating">
                    <div>Sin rating</div>
                    <div className="text-xs font-normal text-muted-foreground">×1</div>
                  </SortableHeader>
                  <SortableHeader column="count_800_900">
                    <div>800-900</div>
                    <div className="text-xs font-normal text-muted-foreground">×1</div>
                  </SortableHeader>
                  <SortableHeader column="count_1000">
                    <div>1000</div>
                    <div className="text-xs font-normal text-muted-foreground">×2</div>
                  </SortableHeader>
                  <SortableHeader column="count_1100">
                    <div>1100</div>
                    <div className="text-xs font-normal text-muted-foreground">×3</div>
                  </SortableHeader>
                  <SortableHeader column="count_1200_plus">
                    <div>1200+</div>
                    <div className="text-xs font-normal text-muted-foreground">×5</div>
                  </SortableHeader>
                  <SortableHeader column="total_score">
                    <div className="font-bold">Score</div>
                  </SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Link 
                        href={`/user/${user.handle}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.handle}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-primary">{user.handle}</div>
                          {user.rating && (
                            <div className="text-xs text-muted-foreground">
                              {user.rank} • {user.rating}
                            </div>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {user.total_submissions || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {user.count_no_rating || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {user.count_800_900 || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {user.count_1000 || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {user.count_1100 || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {user.count_1200_plus || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="font-bold">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Últimas Submissions
          </CardTitle>
          <CardDescription>
            Problemas resueltos recientemente en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
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
