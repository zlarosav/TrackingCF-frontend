'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink, SortAsc, SortDesc, User } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image'
import Link from 'next/link'
import { getProblemRatingColor } from '@/lib/utils'

function getRatingBadgeVariant(rating) {
  if (!rating) return 'secondary'
  if (rating >= 1200) return 'default'
  return 'secondary'
}

export default function LatestSubmissions({ submissions, loading, sortBy, sortOrder, onSortChange }) {
  const handleSort = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay submissions en el periodo seleccionado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles de ordenamiento */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('rating')}
          >
            Rating
            {sortBy === 'rating' && (
              sortOrder === 'asc' ? 
                <SortAsc className="ml-2 h-4 w-4" /> : 
                <SortDesc className="ml-2 h-4 w-4" />
            )}
          </Button>
          <Button
            variant={sortBy === 'submission_time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('submission_time')}
          >
            Fecha
            {sortBy === 'submission_time' && (
              sortOrder === 'asc' ? 
                <SortAsc className="ml-2 h-4 w-4" /> : 
                <SortDesc className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Mostrando {submissions.length} submissions
        </div>
      </div>

      {/* Grid de submissions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {submissions.map((sub) => {
          const problemUrl = `https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`
          const date = new Date(sub.submission_time)
          
          return (
            <Card 
              key={sub.id} 
              className={`border-2 transition-all hover:shadow-lg ${getProblemRatingColor(sub.rating)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2 flex-1">
                    {sub.problem_name}
                  </CardTitle>
                  <a
                    href={problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{sub.contest_id}{sub.problem_index}</span>
                  <Badge variant={getRatingBadgeVariant(sub.rating)}>
                    {sub.rating || 'N/A'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{date.toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                  <span className="text-xs">
                    {date.toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {/* Usuario que resolvió */}
                <Link 
                  href={`/user/${sub.handle}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  {sub.avatar_url ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={sub.avatar_url}
                        alt={sub.handle}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{sub.handle}</span>
                </Link>

                {sub.tags && sub.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sub.tags.slice(0, 3).map((tag, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs px-1.5 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {sub.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        +{sub.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
