import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Trophy, Target, Hash, Flame, ExternalLink, SortAsc, SortDesc, Filter, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import StreakBadge from "@/components/StreakBadge"
import Pagination from "@/components/Pagination"
import { cn } from "@/lib/utils"

export default function GeneralTab({ user, stats, submissions }) {
  const [sortBy, setSortBy] = useState('submission_time')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [ratingMin, setRatingMin] = useState(800)
  const [ratingMax, setRatingMax] = useState(4000)
  const [hideNoRating, setHideNoRating] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const generalStats = stats?.generalStats || {}
  const topTags = stats?.topTags || []

  // Logic for sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc') // Default to desc for new field
    }
  }

  const allFilteredSubmissions = useMemo(() => {
    // 1. Filter
    let filtered = submissions.filter(sub => {
      // 1. Rating Filter
      const itemRating = sub.rating;
      if (hideNoRating && !itemRating) return false;
      if (itemRating) {
        if (itemRating < ratingMin || itemRating > ratingMax) return false;
      }
      
      // 2. Date Filter
      if (dateFrom || dateTo) {
        // Parse the sub.submission_time. 
        const sDate = new Date(sub.submission_time);
        
        if (!isNaN(sDate.getTime())) {
          // Normalize submission date to YYYY-MM-DD based on LOCAL time for comparison
          // This ensures it matches the date as displayed in the UI
          const y = sDate.getFullYear();
          const m = String(sDate.getMonth() + 1).padStart(2, '0');
          const d = String(sDate.getDate()).padStart(2, '0');
          const subDateStr = `${y}-${m}-${d}`;

          if (dateFrom && subDateStr < dateFrom) return false;
          if (dateTo && subDateStr > dateTo) return false;
        }
      }
      
      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'submission_time') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
  }, [submissions, sortBy, sortOrder, ratingMin, ratingMax, hideNoRating, dateFrom, dateTo]);

  const totalPages = Math.ceil(allFilteredSubmissions.length / pageSize);
  const displayedSubmissions = allFilteredSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  }

  const handleClearFilters = () => {
    setRatingMin(800);
    setRatingMax(4000);
    setHideNoRating(false);
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  }

  const hasActiveFilters = ratingMin !== 800 || ratingMax !== 4000 || hideNoRating || dateFrom || dateTo;

  const ratingOptions = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 4000];

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

  const getRatingBadgeVariant = (rating) => {
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
      <Card className="col-span-1 md:col-span-2 lg:col-span-4 transition-all overflow-visible">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Registro de Actividad</CardTitle>
            <div className="text-xs text-muted-foreground mt-1">
              {allFilteredSubmissions.length} problemas encontrados
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Filter Button */}
            <Button
              variant={showFilters ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 gap-2"
            >
              <Filter className={`h-3.5 w-3.5 ${hasActiveFilters ? "text-primary fill-primary/20" : ""}`} />
              Filtros
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs text-muted-foreground hover:text-destructive"
              >
                <X className="mr-1 h-3 w-3" />
                Limpiar
              </Button>
            )}

            <div className="h-6 w-[1px] bg-border hidden sm:block mx-1"></div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden lg:inline">Ordenar por:</span>
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
        </CardHeader>

      {showFilters && (
        <div className="px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap items-start gap-x-10 gap-y-6 p-4 rounded-lg bg-muted/20 border border-dashed">
            {/* Rating Filter Group with Slider and Manual Inputs */}
            <div className="flex-1 min-w-[320px] space-y-4">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Rango de Rating</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min={800} 
                      max={ratingMax}
                      value={ratingMin}
                      onChange={(e) => {
                        const val = Math.min(Math.max(800, Number(e.target.value)), ratingMax);
                        setRatingMin(val);
                        setCurrentPage(1);
                      }}
                      className="w-16 h-7 text-xs font-mono font-bold bg-background text-center rounded border shadow-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                    <span className="text-muted-foreground text-xs">—</span>
                    <input 
                      type="number" 
                      min={ratingMin} 
                      max={4000}
                      value={ratingMax}
                      onChange={(e) => {
                        const val = Math.min(Math.max(ratingMin, Number(e.target.value)), 4000);
                        setRatingMax(val);
                        setCurrentPage(1);
                      }}
                      className="w-16 h-7 text-xs font-mono font-bold bg-background text-center rounded border shadow-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
               </div>
               <div className="px-2">
                 <Slider
                   min={800}
                   max={4000}
                   step={100}
                   minStepsBetweenThumbs={0}
                   value={[ratingMin, ratingMax]}
                   onValueChange={(values) => {
                     const newMin = values[0];
                     const newMax = values[1];
                     setRatingMin(newMin);
                     setRatingMax(newMax);
                     setCurrentPage(1);
                   }}
                   className="w-full"
                 />
               </div>
               <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                 <span>800</span>
                 <span>4000</span>
               </div>
            </div>

            {/* Checkbox Hide No Rating */}
            <div className="space-y-1.5 h-full">
               <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Opciones</label>
               <div className="flex items-center h-9">
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center select-none">
                      <input 
                        type="checkbox" 
                        className="peer h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors cursor-pointer"
                        id="hide-no-rating"
                        checked={hideNoRating}
                        onChange={(e) => { setHideNoRating(e.target.checked); setCurrentPage(1); }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      Ocultar sin rating
                    </span>
                 </label>
               </div>
            </div>

            <div className="h-12 w-[1px] bg-border/50 hidden lg:block self-center"></div>

            {/* Date Filters */}
            <div className="flex items-start gap-4 h-full">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Desde</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[160px] h-9 justify-start text-left font-normal text-xs border rounded-md px-3",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {dateFrom ? format(new Date(dateFrom + 'T00:00:00'), "dd/MM/yyyy") : <span>Seleccionar</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 flex flex-col" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom ? new Date(dateFrom + 'T00:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, '0');
                          const d = String(date.getDate()).padStart(2, '0');
                          setDateFrom(`${y}-${m}-${d}`);
                        } else {
                          setDateFrom('');
                        }
                        setCurrentPage(1);
                      }}
                      initialFocus
                      locale={es}
                    />
                    <div className="p-3 border-t bg-muted/20">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 text-xs font-medium hover:text-destructive"
                        onClick={() => {
                          setDateFrom('');
                          setCurrentPage(1);
                        }}
                      >
                        Limpiar fecha
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Hasta</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[160px] h-9 justify-start text-left font-normal text-xs border rounded-md px-3",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {dateTo ? format(new Date(dateTo + 'T00:00:00'), "dd/MM/yyyy") : <span>Seleccionar</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 flex flex-col" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo ? new Date(dateTo + 'T00:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const y = date.getFullYear();
                          const m = String(date.getMonth() + 1).padStart(2, '0');
                          const d = String(date.getDate()).padStart(2, '0');
                          setDateTo(`${y}-${m}-${d}`);
                        } else {
                          setDateTo('');
                        }
                        setCurrentPage(1);
                      }}
                      disabled={(date) => dateFrom ? date < new Date(dateFrom + 'T00:00:00') : false}
                      initialFocus
                      locale={es}
                    />
                    <div className="p-3 border-t bg-muted/20">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 text-xs font-medium hover:text-destructive"
                        onClick={() => {
                          setDateTo('');
                          setCurrentPage(1);
                        }}
                      >
                        Limpiar fecha
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      )}

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedSubmissions.map((sub, i) => (
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
            {displayedSubmissions.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No hay actividad reciente
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center border-t pt-4">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
