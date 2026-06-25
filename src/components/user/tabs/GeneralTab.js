import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Trophy, Flame, Target, Hash, ExternalLink, Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Pagination from "@/components/Pagination"
import ActivityHeatmap from "@/components/ActivityHeatmap"
import { apiClient } from '@/lib/api'
import { cn } from "@/lib/utils"

const getColor = (r) => { if (!r) return 'bg-muted-foreground/30'; if (r < 1200) return 'bg-muted-foreground/40'; if (r < 1400) return 'bg-green-500'; if (r < 1600) return 'bg-cyan-500'; if (r < 1900) return 'bg-blue-600'; if (r < 2100) return 'bg-purple-600'; if (r < 2300) return 'bg-orange-500'; return 'bg-red-600' }

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Score', value: gs.total_score || 0, icon: Trophy },
          { label: 'Racha', value: `${user?.current_streak || 0}d`, icon: Flame, active: user?.streak_active },
          { label: 'Resueltos', value: submissions.length, icon: Target },
          { label: 'Top Tags', value: topTags.slice(0,3).map(t => t.tag).join(', ') || '—', icon: Hash, small: true },
        ].map(({ label, value, icon: Icon, active, small }) => (
          <Card key={label} className="border-border/30">
            <CardHeader className="p-3 pb-1"><div className="flex items-center justify-between"><CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle><Icon className={`h-4 w-4 ${active ? 'text-amber-500' : 'text-muted-foreground'}`} /></div></CardHeader>
            <CardContent className="p-3 pt-0"><div className={`font-bold ${small ? 'text-xs text-muted-foreground leading-tight line-clamp-1' : 'text-lg'}`}>{value}</div></CardContent>
          </Card>
        ))}
      </div>

      {!loadingHeatmap && heatmapData && <ActivityHeatmap data={heatmapData} />}

      <Card className="border-border/30">
        <CardHeader className="flex flex-row items-center justify-between gap-2 p-3 border-b border-border/20 bg-muted/10">
          <div><CardTitle className="text-sm">Actividad</CardTitle><p className="text-xs text-muted-foreground">{allFiltered.length} problemas</p></div>
          <div className="flex items-center gap-1.5">
            <Button variant={showFilters ? "secondary" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 text-xs gap-1"><Filter className={`h-3.5 w-3.5 ${hasFilters ? 'text-indigo-600' : ''}`} />Filtros</Button>
            {hasFilters && <Button variant="ghost" size="sm" onClick={clear} className="h-8 text-xs text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></Button>}
            {['rating', 'submission_time'].map(f => (
              <button key={f} onClick={() => { if (sortBy === f) setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); else { setSortBy(f); setSortOrder('desc') } }}
                className={`px-2 py-1 text-xs font-medium rounded-sm transition-all ${sortBy === f ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>{f === 'rating' ? 'Rating' : 'Fecha'}</button>
            ))}
          </div>
        </CardHeader>
        {showFilters && (
          <div className="border-b border-border/20 bg-muted/10 px-4 py-3 animate-fade-in">
            <div className="flex flex-wrap items-start gap-4 rounded-md border border-dashed border-border/40 bg-background/50 p-3">
              <div className="flex-1 min-w-[220px] space-y-2">
                <div className="flex items-center justify-between"><span className="text-xs uppercase font-semibold text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1.5"><input type="number" min={800} max={ratingMax} value={ratingMin} onChange={e => { setRatingMin(Math.min(Math.max(800, Number(e.target.value)), ratingMax)); setCurrentPage(1) }} className="w-14 h-7 text-xs font-mono bg-background text-center rounded border" />
                    <span className="text-muted-foreground text-xs">—</span>
                    <input type="number" min={ratingMin} max={4000} value={ratingMax} onChange={e => { setRatingMax(Math.min(Math.max(ratingMin, Number(e.target.value)), 4000)); setCurrentPage(1) }} className="w-14 h-7 text-xs font-mono bg-background text-center rounded border" /></div>
                </div>
                <Slider min={800} max={4000} step={100} value={[ratingMin, ratingMax]} onValueChange={v => { setRatingMin(v[0]); setRatingMax(v[1]); setCurrentPage(1) }} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground"><span>800</span><span>4000</span></div>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer mt-1"><input type="checkbox" checked={hideNoRating} onChange={e => { setHideNoRating(e.target.checked); setCurrentPage(1) }} className="h-4 w-4 rounded border-muted-foreground/30 text-indigo-600" /><span className="text-sm text-muted-foreground">Ocultar sin rating</span></label>
              <div className="h-8 w-px bg-border/40 hidden lg:block self-center" />
              <div className="flex items-start gap-3">
                {['Desde', 'Hasta'].map(dir => (
                  <div key={dir} className="space-y-1 flex flex-col">
                    <span className="text-xs uppercase font-semibold text-muted-foreground">{dir}</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-[150px] h-8 justify-start text-left font-normal text-xs border rounded-md px-2.5", !(dir === 'Desde' ? dateFrom : dateTo) && "text-muted-foreground")}>
                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                          {(dir === 'Desde' ? dateFrom : dateTo) ? format(new Date((dir === 'Desde' ? dateFrom : dateTo) + 'T00:00:00'), "dd/MM/yyyy") : <span>Seleccionar</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={(dir === 'Desde' ? dateFrom : dateTo) ? new Date((dir === 'Desde' ? dateFrom : dateTo) + 'T00:00:00') : undefined}
                          onSelect={date => { if (date) { const y = date.getFullYear(); const m = String(date.getMonth()+1).padStart(2,'0'); const d = String(date.getDate()).padStart(2,'0'); dir === 'Desde' ? setDateFrom(`${y}-${m}-${d}`) : setDateTo(`${y}-${m}-${d}`); setCurrentPage(1) } }}
                          initialFocus locale={es} disabled={dir === 'Hasta' && dateFrom ? date => date < new Date(dateFrom + 'T00:00:00') : undefined} />
                        <div className="p-2 border-t bg-muted/20"><Button variant="ghost" size="sm" className="w-full h-7 text-xs hover:text-destructive" onClick={() => { dir === 'Desde' ? setDateFrom('') : setDateTo(''); setCurrentPage(1) }}>Limpiar</Button></div>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {displayed.map((sub, i) => (
              <div key={i} className="group relative flex items-start gap-3 rounded-lg border border-border/30 bg-card/80 p-3 transition-colors hover:bg-muted/20">
                <div className={`mt-0.5 h-full min-h-[2.5rem] w-1 shrink-0 rounded-full ${getColor(sub.rating)}`} />
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="flex items-start justify-between gap-1">
                    <a href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold line-clamp-1 hover:text-primary transition-colors">{sub.problem_name}</a>
                    <a href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink className="h-3.5 w-3.5" /></a>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sub.contest_id}{sub.problem_index} &middot; {new Date(sub.submission_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} {new Date(sub.submission_time).toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}</div>
                  {sub.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sub.tags.slice(0,3).map((tag, idx) => <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 border-border/40">{tag}</Badge>)}
                      {sub.tags.length > 3 && <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 h-5 border-border/40 cursor-help" title={sub.tags.slice(3).join(', ')}>+{sub.tags.length - 3}</Badge>}
                    </div>
                  )}
                  {sub.rating && <span className="text-xs font-mono font-semibold text-muted-foreground mt-0.5 inline-block">{sub.rating}</span>}
                </div>
              </div>
            ))}
            {!displayed.length && <div className="col-span-full text-center text-muted-foreground py-10 text-sm">Sin actividad</div>}
          </div>
          {totalPages > 1 && <div className="mt-4 border-t border-border/20 pt-3"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
        </CardContent>
      </Card>
    </div>
  )
}
