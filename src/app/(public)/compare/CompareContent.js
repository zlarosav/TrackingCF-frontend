'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, X, Trophy, BarChart3, Flame, Medal, TrendingUp, Search } from 'lucide-react'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EC4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="rounded-lg border border-border/40 bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-xs mb-1">{label}</p>
      {payload.map((e, i) => <p key={i} style={{ color: e.color }} className="font-mono">{e.name}: {e.value}</p>)}
    </div>
  )
  return null
}

export default function CompareContent() {
  const searchParams = useSearchParams()
  const initialHandles = searchParams.get('handles')
  const initArr = initialHandles ? initialHandles.split(',').slice(0, 4) : ['', '']
  while (initArr.length < 2) initArr.push('')

  const [handles, setHandles] = useState(initArr)
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState({})
  const [error, setError] = useState({})

  const fetchUser = async (i) => {
    const handle = handles[i].trim()
    if (!handle) return
    setLoading(prev => ({ ...prev, [i]: true })); setError(prev => ({ ...prev, [i]: null }))
    try {
      const [userRes, statsRes, ratingRes] = await Promise.all([
        apiClient.getUser(handle),
        apiClient.getStats(handle),
        apiClient.getRatingHistory(handle)
      ])
      if (userRes.success) setUsers(prev => ({ ...prev, [i]: { ...userRes.data, stats: statsRes.success ? statsRes.data : null, ratingHistory: ratingRes.success ? ratingRes.data : null } }))
      else setError(prev => ({ ...prev, [i]: 'Usuario no encontrado' }))
    } catch (_) { setError(prev => ({ ...prev, [i]: 'Error al cargar' })) }
    finally { setLoading(prev => ({ ...prev, [i]: false })) }
  }

  useEffect(() => { handles.forEach((h, i) => { if (h.trim()) fetchUser(i) }) }, [])

  const addHandle = () => { if (handles.length < 4) setHandles([...handles, '']) }
  const removeHandle = (i) => { setHandles(handles.filter((_, idx) => idx !== i)); setUsers(prev => { const n = { ...prev }; delete n[i]; return n }) }
  const updateHandle = (i, val) => { const h = [...handles]; h[i] = val; setHandles(h) }

  const compareData = useMemo(() => {
    const entries = Object.entries(users).filter(([_, u]) => u)
    if (entries.length < 2) return null
    const fields = [
      { key: 'current_streak', label: 'Racha' }, { key: 'total_submissions', label: 'Envíos' },
      { key: 'total_score', label: 'Score' }, { key: 'rating', label: 'Rating' },
      { key: 'count_1200_plus', label: '1200+' },
    ]
    return {
      entries,
      chartData: fields.map(f => { const row = { name: f.label }; entries.forEach(([i, u]) => { row[u.handle] = u[f.key] || (u.stats?.generalStats?.[f.key]) || 0 }); return row }),
      distData: ['count_no_rating', 'count_800_900', 'count_1000', 'count_1100', 'count_1200_plus'].map(key => {
        const labels = { count_no_rating: 'Sin rtg', count_800_900: '800-900', count_1000: '1000', count_1100: '1100', count_1200_plus: '1200+' }
        const row = { name: labels[key] || key }; entries.forEach(([i, u]) => { row[u.handle] = u[key] || 0 }); return row
      })
    }
  }, [users])

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      <div className="space-y-1.5"><h1 className="text-2xl font-black tracking-tight">Comparar Usuarios</h1><p className="text-sm text-muted-foreground">Selecciona 2-4 usuarios para comparar estadísticas lado a lado.</p></div>

      <div className="space-y-2">
        {handles.map((handle, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={handle} onChange={e => updateHandle(i, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') fetchUser(i) }}
                placeholder={`Handle #${i + 1}`} className="pl-9 h-9 text-sm" />
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchUser(i)} disabled={loading[i]} className="h-9 text-xs px-3 shrink-0">{loading[i] ? '...' : 'Cargar'}</Button>
            {handles.length > 2 && <button onClick={() => removeHandle(i)} className="p-1.5 text-muted-foreground hover:text-destructive shrink-0"><X className="h-4 w-4" /></button>}
          </div>
        ))}
        {handles.length < 4 && <Button variant="ghost" size="sm" onClick={addHandle} className="text-xs text-muted-foreground">+ Agregar otro</Button>}
      </div>

      {compareData ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {compareData.entries.map(([i, user]) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border/30 bg-card px-3 py-2 shadow-sm">
                {user.avatar_url ? <img src={user.avatar_url} alt={user.handle} className="h-7 w-7 rounded-full object-cover" /> : <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted"><User className="h-3.5 w-3.5" /></div>}
                <span className={`text-sm font-bold ${getRatingColorClass(user.rating)}`}>{user.handle}</span>
                <StreakBadge streak={user.current_streak} isActive={user.streak_active} />
              </div>
            ))}
          </div>

          <Card className="border-border/30">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-xs">Comparación de Estadísticas</CardTitle></CardHeader>
            <CardContent className="p-3"><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={compareData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="name" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} /><Legend wrapperStyle={{ fontSize: '11px' }} />
              {compareData.entries.map(([i, user], idx) => <Bar key={i} dataKey={user.handle} fill={COLORS[idx % COLORS.length]} radius={[3, 3, 0, 0]} />)}
            </BarChart></ResponsiveContainer></div></CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['current_streak', 'total_submissions', 'total_score', 'rating'].map(field => (
              <div key={field} className="rounded-lg border border-border/30 bg-card p-3">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">{field === 'current_streak' ? 'Racha' : field === 'total_submissions' ? 'Envíos' : field === 'total_score' ? 'Score' : 'Rating'}</p>
                {compareData.entries.map(([i, user]) => {
                  const val = field === 'current_streak' ? (user.current_streak || 0) : field === 'total_submissions' ? (user.total_submissions || 0) : field === 'total_score' ? (user.total_score || 0) : (user.rating || 0)
                  return (<div key={i} className="flex items-center justify-between py-1 text-sm border-b border-border/10 last:border-0"><span className="text-muted-foreground text-xs truncate max-w-[80px]">{user.handle}</span><span className="font-mono font-bold" style={{ color: COLORS[parseInt(i) % 4] }}>{val}</span></div>)
                })}
              </div>
            ))}
          </div>

          <Card className="border-border/30">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-xs">Distribución por Dificultad</CardTitle></CardHeader>
            <CardContent className="p-3"><div className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={compareData.distData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis dataKey="name" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} /><YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} /><Legend wrapperStyle={{ fontSize: '11px' }} />
              {compareData.entries.map(([i, user], idx) => <Bar key={i} dataKey={user.handle} fill={COLORS[idx % COLORS.length]} radius={[3, 3, 0, 0]} />)}
            </BarChart></ResponsiveContainer></div></CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <User className="h-10 w-10 opacity-20" /><p className="text-sm">Ingresa al menos 2 handles para comparar</p>
        </div>
      )}
    </div>
  )
}
