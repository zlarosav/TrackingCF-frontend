import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Trophy, Flame, Target, Hash, Filter, X, TrendingUp } from 'lucide-react'
import Pagination from "@/components/Pagination"
import ActivityHeatmap from "@/components/ActivityHeatmap"
import { apiClient } from '@/lib/api'

const getColor = (r) => { if (!r) return 'bg-muted/30'; if (r < 1200) return 'bg-muted/40'; if (r < 1400) return 'bg-trading-up'; if (r < 1600) return 'bg-cyan-500'; if (r < 1900) return 'bg-blue-600'; if (r < 2100) return 'bg-purple-600'; if (r < 2300) return 'bg-orange-500'; return 'bg-trading-down' }

export default function GeneralTab({ user, stats, submissions, handle }) {
  const [sortBy, setSortBy] = useState('submission_time'); const [sortOrder, setSortOrder] = useState('desc')
  const [showFilters, setShowFilters] = useState(false); const [ratingMin, setRatingMin] = useState(800); const [ratingMax, setRatingMax] = useState(4000)
  const [hideNoRating, setHideNoRating] = useState(false); const [dateFrom, setDateFrom] = useState(''); const [dateTo, setDateTo] = useState(''); const [currentPage, setCurrentPage] = useState(1); const PAGE_SIZE = 15
  const [heatmapData, setHeatmapData] = useState(null); const [loadingHeatmap, setLoadingHeatmap] = useState(true)
  const gs = stats?.generalStats || {}; const topTags = stats?.topTags || []

  useEffect(() => {
    if (!handle) return
    setLoadingHeatmap(true)
    apiClient.getActivityHeatmap(handle).then(r => { if (r.success) setHeatmapData(r.data) }).catch(() => {}).finally(() => setLoadingHeatmap(false))
  }, [handle])

  const allFiltered = useMemo(() => {
    let f = submissions.filter(sub => { const r = sub.rating; if (hideNoRating && !r) return false; if (r && (r < ratingMin || r > ratingMax)) return false; if (dateFrom || dateTo) { const d = new Date(sub.submission_time); if (!isNaN(d.getTime())) { const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; if (dateFrom && s < dateFrom) return false; if (dateTo && s > dateTo) return false } } return true })
    f.sort((a, b) => { const va = sortBy === 'submission_time' ? new Date(a[sortBy]).getTime() : (a[sortBy] || 0); const vb = sortBy === 'submission_time' ? new Date(b[sortBy]).getTime() : (b[sortBy] || 0); return sortOrder === 'asc' ? va - vb : vb - va })
    return f
  }, [submissions, sortBy, sortOrder, ratingMin, ratingMax, hideNoRating, dateFrom, dateTo])
  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE); const displayed = allFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const hasFilters = ratingMin !== 800 || ratingMax !== 4000 || hideNoRating || dateFrom || dateTo
  const clear = () => { setRatingMin(800); setRatingMax(4000); setHideNoRating(false); setDateFrom(''); setDateTo(''); setCurrentPage(1) }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats — Binance stat-callout-card style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Score', value: gs.total_score || 0, icon: Trophy, isYellow: true },
          { label: 'Racha', value: `${user?.current_streak || 0}d`, icon: Flame, active: user?.streak_active },
          { label: 'Resueltos', value: submissions.length, icon: Target },
          { label: 'Top Tags', value: topTags.slice(0,3).map(t => t.tag).join(', ') || '—', icon: Hash, small: true },
        ].map(({ label, value, icon: Icon, active, small, isYellow }) => (
          <Card key={label} className="rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-caption text-muted font-medium">{label}</span>
              <Icon className={`h-4 w-4 ${active ? 'text-trading-up' : isYellow ? 'text-primary' : 'text-muted'}`} />
            </div>
            <span className={`${small ? 'text-body-sm text-muted leading-tight line-clamp-1' : 'text-title-lg'} ${isYellow ? 'text-primary' : 'text-on-surface'}`}>
              {value}
            </span>
          </Card>
        ))}
      </div>

      {!loadingHeatmap && heatmapData && <ActivityHeatmap data={heatmapData} />}

      <Card className="rounded-xl overflow-hidden">
        <div className="flex flex-row items-center justify-between gap-2 p-4 border-b border-hairline/60 bg-surface-elevated">
          <div><CardTitle className="text-body-md text-on-surface font-semibold">Actividad</CardTitle><p className="text-caption text-muted">{allFiltered.length} problemas</p></div>
          <div className="flex items-center gap-1.5">
            <Button variant={showFilters ? "secondary" : "ghost"} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 text-caption gap-1">
              <Filter className={`h-3.5 w-3.5 ${hasFilters ? 'text-primary' : ''}`} />Filtros
            </Button>
            {hasFilters && <Button variant="ghost" size="sm" onClick={clear} className="h-8 text-caption text-muted"><X className="h-3.5 w-3.5" /></Button>}
            {['rating', 'submission_time'].map(f => (
              <button key={f} onClick={() => { if (sortBy === f) setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); else { setSortBy(f); setSortOrder('desc') } }}
                className={`px-2 py-1 text-caption font-medium rounded-sm transition-all ${sortBy === f ? 'bg-primary text-on-primary' : 'text-muted hover:text-on-surface'}`}>{f === 'rating' ? 'Rating' : 'Fecha'}</button>
            ))}
          </div>
        </div>
        {showFilters && (
          <div className="border-b border-hairline/60 bg-surface-elevated/50 px-4 py-3 animate-fade-in">
            <div className="flex flex-wrap items-start gap-4 rounded-lg border border-dashed border-hairline/60 bg-canvas/50 p-3">
              <div className="flex-1 min-w-[220px] space-y-2">
                <div className="flex items-center justify-between"><span className="text-caption uppercase font-semibold text-muted">Rating</span>
                  <div className="flex items-center gap-1.5">
                    <input type="number" min={800} max={ratingMax} value={ratingMin} onChange={e => { setRatingMin(Math.min(Math.max(800, Number(e.target.value)), ratingMax)); setCurrentPage(1) }} className="w-14 h-7 text-caption font-mono bg-canvas text-center rounded-sm border border-hairline/60" />
                    <span className="text-muted text-xs">—</span>
                    <input type="number" min={ratingMin} max={4000} value={ratingMax} onChange={e => { setRatingMax(Math.min(Math.max(ratingMin, Number(e.target.value)), 4000)); setCurrentPage(1) }} className="w-14 h-7 text-caption font-mono bg-canvas text-center rounded-sm border border-hairline/60" />
                  </div>
                </div>
                <Slider min={800} max={4000} step={100} value={[ratingMin, ratingMax]} onValueChange={v => { setRatingMin(v[0]); setRatingMax(v[1]); setCurrentPage(1) }} className="w-full" />
                <div className="flex justify-between text-caption text-muted"><span>800</span><span>4000</span></div>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer mt-1"><input type="checkbox" checked={hideNoRating} onChange={e => { setHideNoRating(e.target.checked); setCurrentPage(1) }} className="h-4 w-4 rounded border-hairline/60 text-primary" /><span className="text-body-md text-muted">Ocultar sin rating</span></label>
              <div className="h-8 w-px bg-hairline/60 hidden lg:block self-center" />
            </div>
          </div>
        )}
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayed.map((sub, i) => (
              <div key={i} className="group relative flex items-start gap-3 rounded-lg bg-surface-elevated/50 p-3 transition-colors hover:bg-surface-elevated">
                <div className={`mt-0.5 h-full min-h-[2.5rem] w-1 shrink-0 rounded-full ${getColor(sub.rating)}`} />
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="flex items-start justify-between gap-1">
                    <a href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`} target="_blank" rel="noopener noreferrer" className="text-body-md font-semibold line-clamp-1 hover:text-primary transition-colors">{sub.problem_name}</a>
                    <a href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity"><TrendingUp className="h-3.5 w-3.5" /></a>
                  </div>
                  <div className="text-caption text-muted mt-0.5">{sub.contest_id}{sub.problem_index} · {new Date(sub.submission_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} {new Date(sub.submission_time).toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}</div>
                  {sub.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sub.tags.slice(0,3).map((tag, idx) => <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0.5 h-5">{tag}</Badge>)}
                      {sub.tags.length > 3 && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5" title={sub.tags.slice(3).join(', ')}>+{sub.tags.length - 3}</Badge>}
                    </div>
                  )}
                  {sub.rating && <span className="text-caption font-mono font-semibold text-muted mt-0.5 inline-block">{sub.rating}</span>}
                </div>
              </div>
            ))}
            {!displayed.length && <div className="col-span-full text-center text-muted py-10 text-body-md">Sin actividad</div>}
          </div>
          {totalPages > 1 && <div className="mt-4 border-t border-hairline/60 pt-3"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
        </CardContent>
      </Card>
    </div>
  )
}
