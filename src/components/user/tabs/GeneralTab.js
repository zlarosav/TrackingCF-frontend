import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Hash, Flame, ExternalLink } from 'lucide-react'
import StreakBadge from "@/components/StreakBadge"

export default function GeneralTab({ user, stats, submissions }) {
  const generalStats = stats?.generalStats || {}
  const recentSubmissions = submissions.slice(0, 15)
  const topTags = stats?.topTags || []
  const favoriteTag = topTags.length > 0 ? topTags[0] : null
  const otherTags = topTags.slice(1, 5)

  const getRatingColor = (rating) => {
    if (!rating) return 'bg-gray-500'
    if (rating < 1200) return 'bg-gray-400'
    if (rating < 1400) return 'bg-green-500'
    if (rating < 1600) return 'bg-cyan-500'
    if (rating < 1900) return 'bg-blue-600'
    if (rating < 2100) return 'bg-purple-600'
    if (rating < 2300) return 'bg-orange-500'
    if (rating < 2400) return 'bg-orange-400'
    return 'bg-red-600' // GM+ styling roughly
  }

  // Helper for text color based on rating for badges
  const getRatingBadgeVariant = (rating) => {
      // Just use default variant but maybe add custom class for color if needed
      // scalable approach: stick to badge variants or custom
      return "secondary" 
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
      {/* Resumen Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Total</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{generalStats.total_score || 0}</div>
          <p className="text-xs text-muted-foreground">Puntos acumulados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Racha Actual</CardTitle>
          <Flame className={`h-4 w-4 ${user?.streak_active ? 'text-orange-500' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{user?.current_streak || 0} dias</div>
          <p className="text-xs text-muted-foreground">
            {user?.streak_active ? '¡Racha activa!' : 'Racha inactiva'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Problemas Resueltos</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{submissions.length}</div>
          <p className="text-xs text-muted-foreground">Total envíos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tags Recurrentes</CardTitle>
          <Hash className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                 {topTags.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-sm flex-1 text-center truncate" title={t.tag}>
                       {t.tag}
                    </span>
                 ))}
                 {topTags.length === 0 && <span className="text-xs text-muted-foreground">Sin datos</span>}
              </div>
              <div className="flex gap-1 justify-center">
                 {topTags.slice(3, 5).map((t, i) => (
                    <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-sm px-4 truncate" title={t.tag}>
                       {t.tag}
                    </span>
                 ))}
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSubmissions.map((sub, i) => (
              <div 
                key={i} 
                className={`
                    flex items-center justify-between p-3 rounded-lg border bg-card 
                    hover:shadow-md transition-all group
                    relative overflow-hidden
                `}
              >
                {/* Colored accent bar on left */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getRatingColor(sub.rating)}`} />

                <div className="flex-1 ml-3 min-w-0 mr-2">
                  <div className="font-semibold truncate flex items-center gap-2">
                      <a 
                        href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base hover:underline hover:text-primary transition-colors"
                      >
                        {sub.problem_name}
                      </a>
                      <a 
                        href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        title="Ver problema"
                      >
                         <ExternalLink className="w-4 h-4" />
                      </a>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="font-mono">{sub.contest_id}{sub.problem_index}</span>
                    <span>•</span>
                    <span>
                      {new Date(sub.submission_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                      {' '} 
                      {new Date(sub.submission_time).toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                    </span>
                  </div>

                  {/* Tags */}
                  {sub.tags && sub.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sub.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                      {sub.tags.length > 3 && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground cursor-help" 
                          title={sub.tags.slice(3).join(', ')}
                        >
                          +{sub.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                {sub.rating && (
                  <Badge variant={getRatingBadgeVariant(sub.rating)} className="text-sm font-mono shrink-0 px-2">
                    {sub.rating}
                  </Badge>
                )}
              </div>
            ))}
            {recentSubmissions.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No hay actividad reciente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
