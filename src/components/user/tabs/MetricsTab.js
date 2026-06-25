'use client'

import { useState, useEffect } from 'react'
import ChartView from '@/components/ChartView'
import RatingChart from '@/components/RatingChart'
import { apiClient } from '@/lib/api'

export default function MetricsTab({ stats, handle }) {
  const [ratingHistory, setRatingHistory] = useState(null)
  const [loadingRating, setLoadingRating] = useState(true)

  useEffect(() => {
    if (!handle) return
    setLoadingRating(true)
    apiClient.getRatingHistory(handle).then(r => {
      if (r.success) setRatingHistory(r.data)
    }).catch(() => {}).finally(() => setLoadingRating(false))
  }, [handle])

  if (!stats && loadingRating) return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-xs">Cargando métricas...</p>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in space-y-4">
      {ratingHistory && ratingHistory.length >= 2 && <RatingChart ratingHistory={ratingHistory} />}
      <ChartView stats={stats} />
    </div>
  )
}
