'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, SortAsc, SortDesc, User } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image'
import Link from 'next/link'

export default function LatestSubmissions({ submissions, loading, sortBy, sortOrder, onSortChange }) {
  const handleSort = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const getRatingColor = (rating) => {
    if (!rating) return 'bg-gray-500'
    if (rating < 1200) return 'bg-gray-400'
    if (rating < 1400) return 'bg-green-500'
    if (rating < 1600) return 'bg-cyan-500'
    if (rating < 1900) return 'bg-blue-600'
    if (rating < 2100) return 'bg-purple-600'
    if (rating < 2300) return 'bg-orange-500'
    if (rating < 2400) return 'bg-orange-400'
    return 'bg-red-600'
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-primary">🕒</span> Últimas Submissions
           </h2>
           <p className="text-muted-foreground text-sm">
              Problemas resueltos recientemente en el periodo seleccionado
           </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Ordenar por:</span>
          <Button
            variant={sortBy === 'rating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('rating')}
            className="h-8"
          >
            Rating
            {sortBy === 'rating' && (
              sortOrder === 'asc' ? 
                <SortAsc className="ml-2 h-3 w-3" /> : 
                <SortDesc className="ml-2 h-3 w-3" />
            )}
          </Button>
          <Button
            variant={sortBy === 'submission_time' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSort('submission_time')}
            className="h-8"
          >
            Fecha
            {sortBy === 'submission_time' && (
              sortOrder === 'asc' ? 
                <SortAsc className="ml-2 h-3 w-3" /> : 
                <SortDesc className="ml-2 h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {submissions.map((sub, i) => {
          const problemUrl = `https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`
          const date = new Date(sub.submission_time)
          
          return (
             <div 
                key={sub.id || i} 
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
                        href={problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base truncate hover:underline hover:text-primary transition-colors"
                        title={sub.problem_name}
                      >
                        {sub.problem_name}
                      </a>
                      <a 
                        href={problemUrl}
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
                      {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                      {' '} 
                      {date.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* User Info */}
                  <div className="mt-2 flex items-center gap-2">
                     <Link href={`/user/${sub.handle}`} className="flex items-center gap-1.5 hover:underline group-user">
                          {sub.avatar_url ? (
                            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                               <Image src={sub.avatar_url} alt={sub.handle} width={20} height={20} className="w-full h-full object-cover" unoptimized />
                            </div>
                          ) : (
                             <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                               <User className="h-3 w-3 text-muted-foreground" />
                             </div>
                          )}
                          <span className="text-xs font-medium text-foreground/80">{sub.handle}</span>
                     </Link>
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
                  <Badge variant="secondary" className="text-sm font-mono shrink-0 px-2 h-fit">
                    {sub.rating}
                  </Badge>
                )}
              </div>
          )
        })}
      </div>
      
      <div className="text-sm text-muted-foreground">
          Mostrando {submissions.length} submissions
      </div>
    </div>
  )
}
