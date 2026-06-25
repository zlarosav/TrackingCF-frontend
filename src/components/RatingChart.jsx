'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, ComposedChart } from 'recharts'
import { predictRating } from '@/lib/prediction'

const RATING_TIERS = [
  { max: 1200, color: '#9CA3AF', label: 'Newbie' },
  { max: 1400, color: '#22C55E', label: 'Pupil' },
  { max: 1600, color: '#06B6D4', label: 'Specialist' },
  { max: 1900, color: '#3B82F6', label: 'Expert' },
  { max: 2100, color: '#8B5CF6', label: 'Candidate Master' },
  { max: 2400, color: '#F97316', label: 'Master' },
  { max: Infinity, color: '#EF4444', label: 'Grandmaster' },
]

function getTierColor(rating) {
  for (const tier of RATING_TIERS) {
    if (rating < tier.max) return tier.color
  }
  return '#EF4444'
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const item = payload[0]?.payload
    if (!item) return null
    return (
      <div className="rounded-lg border border-border/40 bg-card px-3 py-2 shadow-md text-xs max-w-[200px]">
        <p className="font-semibold text-xs mb-1">{item.contestName || 'Proyección'}</p>
        <p className="text-muted-foreground">{formatDate(item.date)}</p>
        {item.actualRating != null && (
          <p className="font-mono font-bold" style={{ color: getTierColor(item.actualRating) }}>
            Rating: {item.actualRating}
          </p>
        )}
        {item.actualRating != null && item.fittedRating != null && (
          <p className="text-muted-foreground">Trend: {item.fittedRating}</p>
        )}
        {item.isProjection && (
          <p className="font-mono font-bold text-indigo-500">Proyección: {item.rating}</p>
        )}
      </div>
    )
  }
  return null
}

export default function RatingChart({ ratingHistory }) {
  const chartData = useMemo(() => {
    if (!ratingHistory || ratingHistory.length < 2) return null
    const prediction = predictRating(ratingHistory, 5)
    if (!prediction) return null

    // Merge trendline + projections into chart series
    const data = prediction.trendline.map(t => ({
      date: t.date,
      contestIndex: t.contestIndex,
      actualRating: t.actualRating,
      fittedRating: t.fittedRating,
      contestName: t.contestName,
    }))

    // Add projection points (only every other to keep chart clean)
    prediction.projections.forEach((p, i) => {
      if (i % 2 === 0 || i === prediction.projections.length - 1) {
        data.push({
          date: p.date,
          contestIndex: p.contestIndex,
          actualRating: null,
          fittedRating: p.rating,
          isProjection: true,
          rating: p.rating,
          contestName: `Contest #${p.contestIndex + 1}`,
        })
      }
    })

    return { data, rSquared: prediction.rSquared, stdError: prediction.stdError }
  }, [ratingHistory])

  if (!chartData) return null

  const { data, rSquared, stdError } = chartData

  return (
    <Card className="border-border/30">
      <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-xs">Evolución de Rating</CardTitle>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>R²: {rSquared.toFixed(2)}</span>
          {stdError > 0 && <span>±{Math.round(stdError)}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
              <XAxis
                dataKey="contestIndex"
                tickFormatter={(v) => `#${v + 1}`}
                fontSize={10}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Contest', position: 'insideBottom', offset: -5, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                fontSize={10}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Rating', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference lines for each tier boundary */}
              {RATING_TIERS.map((tier) => (
                tier.max < 4000 && (
                  <ReferenceLine key={tier.max} y={tier.max} stroke={tier.color} strokeOpacity={0.15} strokeDasharray="4 4" />
                )
              ))}

              {/* Area for confidence band */}
              <Area
                type="monotone"
                dataKey="fittedRating"
                stroke="none"
                fill="#6366F1"
                fillOpacity={0.08}
              />

              {/* Trend line (dashed) */}
              <Line
                type="monotone"
                dataKey="fittedRating"
                stroke="#6366F1"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                activeDot={false}
              />

              {/* Projection dots */}
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#818CF8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#818CF8', strokeWidth: 1, stroke: '#fff' }}
                connectNulls={false}
                activeDot={{ r: 5 }}
              />

              {/* Actual rating dots and line */}
              <Line
                type="monotone"
                dataKey="actualRating"
                stroke="#4F46E5"
                strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (!payload.actualRating) return null
                  return (
                    <circle
                      key={`dot-${payload.contestIndex}`}
                      cx={cx} cy={cy} r={4}
                      fill={getTierColor(payload.actualRating)}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                  )
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
