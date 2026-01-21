'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, TrendingUp, Award } from 'lucide-react'

export default function StatsCard({ stats }) {
  const items = [
    {
      label: 'Score Total',
      value: stats.total_score || 0,
      icon: Trophy,
      color: 'text-yellow-500'
    },
    {
      label: 'Sin rating',
      value: stats.count_no_rating || 0,
      icon: Star,
      color: 'text-gray-500',
      score: '+1'
    },
    {
      label: '800-900',
      value: stats.count_800_900 || 0,
      icon: Star,
      color: 'text-gray-500',
      score: '+1'
    },
    {
      label: '1000',
      value: stats.count_1000 || 0,
      icon: TrendingUp,
      color: 'text-green-500',
      score: '+2'
    },
    {
      label: '1100',
      value: stats.count_1100 || 0,
      icon: TrendingUp,
      color: 'text-cyan-500',
      score: '+3'
    },
    {
      label: '1200+',
      value: stats.count_1200_plus || 0,
      icon: Award,
      color: 'text-blue-500',
      score: '+5'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium">{item.label}</p>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{item.value}</div>
                {item.score && (
                  <Badge variant="outline" className="text-xs">
                    {item.score}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
