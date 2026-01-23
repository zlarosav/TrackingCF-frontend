'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F']

export default function ChartView({ stats }) {
  if (!stats) return null

  const { ratingDistribution, temporalProgress, topTags } = stats

  // Preparar datos para gráficos
  const ratingData = ratingDistribution || []
  
  // Filter temporal progress to show only last 7 days
  const getLast7DaysData = (temporalProgress) => {
    if (!temporalProgress || temporalProgress.length === 0) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const last7Days = []
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() - i)
      targetDate.setHours(0, 0, 0, 0)
      
      // Find matching data for this day
      const existingData = temporalProgress.find(item => {
        // item.month is now a string "YYYY-MM-DD" from backend
        // We must parse it as local time, not UTC (which new Date("YYYY-MM-DD") does)
        if (typeof item.month === 'string' && item.month.includes('-')) {
          const [year, month, day] = item.month.split('-').map(Number)
          const itemDate = new Date(year, month - 1, day)
          return itemDate.getFullYear() === targetDate.getFullYear() &&
                 itemDate.getMonth() === targetDate.getMonth() &&
                 itemDate.getDate() === targetDate.getDate()
        }
        
        // Fallback for Date objects if any
        const itemDate = new Date(item.month)
        itemDate.setHours(0, 0, 0, 0)
        return itemDate.getTime() === targetDate.getTime()
      })
      
      last7Days.push({
        month: targetDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),
        count: existingData ? Number(existingData.count) : 0
      })
    }
    
    return last7Days
  }
  
  const progressData = getLast7DaysData(temporalProgress)
  const tagsData = (topTags || []).slice(0, 6)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribución por Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Temporal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                allowDecimals={false} 
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#82ca9d" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Tags */}
      {tagsData.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Tags Más Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tagsData}
                  dataKey="count"
                  nameKey="tag"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.tag} (${entry.count})`}
                >
                  {tagsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
