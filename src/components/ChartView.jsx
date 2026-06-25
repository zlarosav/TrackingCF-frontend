'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#0066cc', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return <div className="rounded-lg border border-hairline-on-dark/60 bg-canvas px-2.5 py-1.5 text-xs"><p className="font-medium text-[10px]">{label}</p>{payload.map((e, i) => <p key={i} style={{ color: e.color }} className="text-[10px] font-mono">{e.name}: {e.value}</p>)}</div>
  return null
}

export default function ChartView({ stats }) {
  if (!stats) return null
  const { ratingDistribution, temporalProgress, topTags } = stats
  const ratingData = ratingDistribution || []

  const getLast7 = (tp) => {
    if (!tp?.length) return []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const target = new Date(today); target.setDate(target.getDate() - (6 - i))
      const existing = tp.find(item => {
        if (typeof item.month === 'string' && item.month.includes('-')) {
          const [y, m, d] = item.month.split('-').map(Number)
          const itemDate = new Date(y, m - 1, d)
          return itemDate.getFullYear() === target.getFullYear() && itemDate.getMonth() === target.getMonth() && itemDate.getDate() === target.getDate()
        }
        const id = new Date(item.month); id.setHours(0, 0, 0, 0)
        return id.getTime() === target.getTime()
      })
      return { month: target.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }), count: existing ? Number(existing.count) : 0 }
    })
  }

  const progressData = getLast7(temporalProgress)
  const tagsData = (topTags || []).slice(0, 6)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-hairline">
        <CardHeader className="p-3 pb-1"><CardTitle className="text-xs">Distribución por Rating</CardTitle></CardHeader>
        <CardContent className="p-3"><div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={ratingData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.3} />
          <XAxis dataKey="category" angle={-30} textAnchor="end" height={55} fontSize={10} tick={{ fill: '#7a7a7a' }} />
          <YAxis allowDecimals={false} fontSize={10} tick={{ fill: '#7a7a7a' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#0066cc" radius={[3, 3, 0, 0]} />
        </BarChart></ResponsiveContainer></div></CardContent>
      </Card>

      <Card className="border-hairline">
        <CardHeader className="p-3 pb-1"><CardTitle className="text-xs">Últimos 7 Días</CardTitle></CardHeader>
        <CardContent className="p-3"><div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.3} />
          <XAxis dataKey="month" angle={-30} textAnchor="end" height={55} fontSize={10} tick={{ fill: '#7a7a7a' }} />
          <YAxis allowDecimals={false} fontSize={10} tick={{ fill: '#7a7a7a' }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="count" stroke="#0066cc" strokeWidth={2} dot={{ fill: '#0066cc', strokeWidth: 1.5, r: 3 }} activeDot={{ r: 4 }} />
        </LineChart></ResponsiveContainer></div></CardContent>
      </Card>

      {tagsData.length > 0 && (
        <Card className="md:col-span-2 border-hairline">
          <CardHeader className="p-3 pb-1"><CardTitle className="text-xs">Tags Más Frecuentes</CardTitle></CardHeader>
          <CardContent className="p-3"><div className="h-[240px]"><ResponsiveContainer width="100%" height="100%"><PieChart>
            <Pie data={tagsData} dataKey="count" nameKey="tag" cx="50%" cy="50%" outerRadius={80} innerRadius={35}
              label={({ tag, percent }) => `${tag} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {tagsData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart></ResponsiveContainer></div></CardContent>
        </Card>
      )}
    </div>
  )
}
