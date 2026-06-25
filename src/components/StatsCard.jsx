'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, TrendingUp, Award } from 'lucide-react'

export default function StatsCard({ stats }) {
  const items = [
    { label: 'Score', value: stats.total_score || 0, icon: Trophy, color: 'text-amber-500' },
    { label: 'Sin rtg', value: stats.count_no_rating || 0, icon: Star, color: 'text-muted-foreground', score: '+1' },
    { label: '800-900', value: stats.count_800_900 || 0, icon: Star, color: 'text-muted-foreground', score: '+1' },
    { label: '1000', value: stats.count_1000 || 0, icon: TrendingUp, color: 'text-green-500', score: '+2' },
    { label: '1100', value: stats.count_1100 || 0, icon: TrendingUp, color: 'text-cyan-500', score: '+3' },
    { label: '1200+', value: stats.count_1200_plus || 0, icon: Award, color: 'text-primary', score: '+5' },
  ]
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(({ label, value, icon: Icon, color, score }, i) => (
        <Card key={i} className="border-hairline">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium text-muted">{label}</span><Icon className={`h-4 w-4 ${color}`} /></div>
            <div className="flex items-baseline gap-1"><span className="text-base font-bold">{value}</span>{score && <Badge variant="secondary" className="text-[10px] px-1 py-0 font-mono">{score}</Badge>}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
