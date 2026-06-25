'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const getIntensity = (count, max) => {
  if (!count || count === 0) return 'bg-muted/20'
  const ratio = count / (max || 1)
  if (ratio < 0.1) return 'bg-emerald-200/40 dark:bg-emerald-900/20'
  if (ratio < 0.25) return 'bg-emerald-300/60 dark:bg-emerald-800/40'
  if (ratio < 0.5) return 'bg-emerald-500/70 dark:bg-emerald-600/60'
  if (ratio < 0.75) return 'bg-emerald-600/85 dark:bg-emerald-500/75'
  return 'bg-emerald-700 dark:bg-emerald-400'
}

export default function ActivityHeatmap({ data }) {
  const grid = useMemo(() => {
    if (!data || !data.length) return null

    // Build date->count map
    const countMap = {}
    for (const d of data) {
      countMap[d.date] = d.count
    }

    // Generate 52 weeks (columns) × 7 days (rows)
    const today = new Date()
    const endOfWeek = new Date(today)
    // Go to end of current week (Sunday)
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()))

    const startDate = new Date(endOfWeek)
    startDate.setDate(endOfWeek.getDate() - 364) // 52 weeks * 7 days = 364

    // Week columns (52-53)
    const weeks = []
    let maxCount = 0
    const cursor = new Date(startDate)

    while (cursor <= endOfWeek) {
      const weekStart = new Date(cursor)
      const days = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + d)
        if (date > endOfWeek) break
        const dateStr = date.toISOString().split('T')[0]
        const count = countMap[dateStr] || 0
        if (count > maxCount) maxCount = count
        days.push({ date: dateStr, count, day: d })
      }
      if (days.length > 0) weeks.push(days)
      cursor.setDate(cursor.getDate() + 7)
    }

    return { weeks, maxCount }
  }, [data])

  if (!grid) return null

  const { weeks, maxCount } = grid

  return (
    <Card className="border-border/30">
      <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-xs">Actividad (365 días)</CardTitle>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted/20" />
            <span>0</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-300/60 dark:bg-emerald-800/40" />
            <span>1-3</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70 dark:bg-emerald-600/60" />
            <span>4-7</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700 dark:bg-emerald-400" />
            <span>8+</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-3 overflow-x-auto">
        <div className="flex gap-0.5" style={{ minWidth: weeks.length * 14 }}>
          {/* Day labels column */}
          <div className="flex flex-col gap-0.5 mr-1 pt-5">
            {[0, 2, 4, 6].map(d => (
              <span key={d} className="text-[8px] text-muted-foreground h-3 leading-3">{DAYS[d]}</span>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`h-3 w-3 rounded-sm ${getIntensity(day.count, maxCount)}`}
                    title={`${day.date}: ${day.count} pts`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Month labels */}
        <div className="flex gap-0.5 mt-1 ml-4" style={{ minWidth: weeks.length * 14 - 4 }}>
          {weeks.map((week, wi) => {
            const firstDay = week[0]
            if (!firstDay) return null
            const month = new Date(firstDay.date).getMonth()
            const prevWeek = wi > 0 ? weeks[wi - 1] : null
            const prevMonth = prevWeek ? new Date(prevWeek[0].date).getMonth() : -1
            if (month !== prevMonth) {
              return (
                <span key={wi} className="text-[8px] text-muted-foreground" style={{ position: 'relative', left: 0 }}>
                  {MONTHS[month]}
                </span>
              )
            }
            return <span key={wi} className="w-3" />
          })}
        </div>
      </CardContent>
    </Card>
  )
}
