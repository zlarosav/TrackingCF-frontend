'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, SortAsc, SortDesc, User, Layers } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image'
import Link from 'next/link'

export default function LatestSubmissions({
  submissions,
  loading,
  sortBy,
  sortOrder,
  platformFilter,
  atcoderEnabled,
  onPlatformChange,
  onSortChange
}) {
  const getAtcoderTaskCode = (problemIndex) => {
    if (!problemIndex) return ''
    const last = String(problemIndex).split('_').pop() || ''
    return last.toUpperCase()
  }

  const getCfEquivalentLabel = (sub) => {
    const platform = String(sub.platform || '').toUpperCase()
    if (platform !== 'ATCODER') return null

    const tag = (sub.tags || []).find((t) => String(t).startsWith('CF_EQ_'))
    if (!tag) return null

    return String(tag).replace('CF_EQ_', 'CF~')
  }

  const getProblemUrl = (sub) => {
    const platform = String(sub.platform || 'CODEFORCES').toUpperCase()

    if (platform === 'ATCODER') {
      return `https://atcoder.jp/contests/${sub.contest_id}/tasks/${sub.problem_index}`
    }

    return `https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`
  }

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
      <div className="flex flex-col gap-4 rounded-xl border bg-gradient-to-r from-background via-background to-muted/40 p-4 md:p-5">
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Plataforma
          </div>
          <div className="inline-flex rounded-lg border p-1 bg-muted/40">
            <button
              type="button"
              onClick={() => onPlatformChange('all')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${platformFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => onPlatformChange('codeforces')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${platformFilter === 'codeforces' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Codeforces
            </button>
            <button
              type="button"
              onClick={() => atcoderEnabled && onPlatformChange('atcoder')}
              disabled={!atcoderEnabled}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${platformFilter === 'atcoder' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} ${!atcoderEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={!atcoderEnabled ? 'AtCoder submissions está desactivado en backend' : 'Filtrar por AtCoder'}
            >
              AtCoder
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {submissions.map((sub, i) => {
          const problemUrl = getProblemUrl(sub)
          const date = new Date(sub.submission_time)
          const platform = String(sub.platform || 'CODEFORCES').toUpperCase()
          const problemCode = platform === 'ATCODER'
            ? `${sub.contest_id} ${getAtcoderTaskCode(sub.problem_index)}`
            : `${sub.contest_id}${sub.problem_index}`
          const cfEquivalent = getCfEquivalentLabel(sub)
          
          return (
             <div 
                key={sub.id || i} 
                className={`
                  flex flex-col p-4 rounded-lg border bg-card/90 backdrop-blur-sm
                   hover:shadow-lg transition-all group
                   relative overflow-hidden
                `}
              >
                {/* Colored accent bar on top */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${getRatingColor(sub.rating)}`} />

                {/* Problem Section */}
                <div className="pt-1 flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <a 
                      href={problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold leading-tight truncate hover:text-primary transition-colors flex-1"
                      title={sub.problem_name}
                    >
                      {sub.problem_name}
                    </a>
                    <a 
                      href={problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary flex-shrink-0 mt-0.5"
                      title="Ver problema"
                    >
                       <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Contest and Platform Info */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="text-[11px] px-2 py-0.5 font-mono font-medium">
                      {problemCode}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-[11px] px-2 py-0.5 font-medium ${
                        platform === 'ATCODER' 
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' 
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {platform}
                    </Badge>
                    {cfEquivalent && (
                      <Badge 
                        variant="outline" 
                        className="text-[11px] px-2 py-0.5 font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                      >
                        {cfEquivalent}
                      </Badge>
                    )}
                  </div>

                  {/* Tags Section */}
                  {sub.tags && sub.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {sub.tags.slice(0, 2).map((tag, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0.5 font-normal text-muted-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {sub.tags.length > 2 && (
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0.5 font-normal text-muted-foreground cursor-help" 
                          title={sub.tags.slice(2).join(', ')}
                        >
                          +{sub.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t my-3 -mx-4" />

                {/* User and Rating Section */}
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/user/${sub.handle}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-w-0">
                    {sub.avatar_url ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                         <Image src={sub.avatar_url} alt={sub.handle} width={24} height={24} className="w-full h-full object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-foreground/80 truncate">{sub.handle}</span>
                  </Link>

                  {sub.rating !== null && sub.rating !== undefined && (
                    <Badge 
                      className={`text-sm font-mono font-bold shrink-0 px-2.5 py-1 ${getRatingColor(sub.rating)} text-white`}
                    >
                      {sub.rating}
                    </Badge>
                  )}
                </div>

                {/* Time Info */}
                <div className="text-[10px] text-muted-foreground mt-2 pt-2 border-t">
                  {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                  {' '} 
                  {date.toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                </div>
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
