'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, Calendar, Clock } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export default function SubmissionsTable({ submissions }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  // Filter submissions by date
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const date = new Date(sub.submission_time)
      return date.getFullYear() === parseInt(selectedYear) && date.getMonth() === parseInt(selectedMonth)
    })
  }, [submissions, selectedYear, selectedMonth])

  // Group by Rating Category - Explicit Order
  const columns = {
    'No rating': [],
    '800 - 900': [],
    '1000': [],
    '1100': [],
    '1200+': [] 
  }

  const getRatingColor = (rating) => {
    if (!rating) return 'bg-gray-500' // No rating
    if (rating < 1200) return 'bg-gray-400' // Newbie
    if (rating < 1400) return 'bg-green-500' // Pupil
    if (rating < 1600) return 'bg-cyan-500' // Specialist
    if (rating < 1900) return 'bg-blue-600' // Expert
    if (rating < 2100) return 'bg-purple-600' // cm
    if (rating < 2300) return 'bg-orange-500' // master
    if (rating < 2400) return 'bg-orange-400' // im
    return 'bg-red-600' // gm+
  }

  filteredSubmissions.forEach(sub => {
    const rating = sub.rating;
    let key = 'No rating';
    
    // Exact logic requested: 800-900, 1000, 1100, 1200+
    if (rating >= 800 && rating <= 900) key = '800 - 900';
    else if (rating === 1000) key = '1000';
    else if (rating === 1100) key = '1100';
    else if (rating >= 1200) key = '1200+';
    else if (rating < 800 && rating > 0) key = 'No rating';
    
    // Push to column
    if (columns[key]) {
        columns[key].push(sub);
    } else {
        columns['No rating'].push(sub);
    }
  })

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Custom Filter Bar to match site aesthetics */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm flex-wrap">
        <label className="text-sm font-medium text-muted-foreground">Filtrar por fecha:</label>
        
        <div className="relative">
            <select 
            className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            >
            {months.map((m, i) => <option key={i} value={i} className="bg-background text-foreground">{m}</option>)}
            </select>
        </div>
        
        <div className="relative">
            <select 
            className="h-9 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            >
            {years.map(y => <option key={y} value={y} className="bg-background text-foreground">{y}</option>)}
            </select>
        </div>
        
        <div className="ml-auto text-sm text-muted-foreground hidden md:block">
            {filteredSubmissions.length} problemas encontrados
        </div>
      </div>

      {/* Kanban Board - Unlimited Height */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border rounded-lg overflow-hidden bg-muted/20">
        {['No rating', '800 - 900', '1000', '1100', '1200+'].map((title) => {
          const items = columns[title] || [];
          
          // Dynamic Header Colors
          let headerClass = 'bg-muted/50 text-muted-foreground';
          if (title === 'No rating') headerClass = 'bg-slate-800 text-slate-100 dark:bg-slate-900';
          if (title === '800 - 900') headerClass = 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200';
          if (title === '1000') headerClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
          if (title === '1100') headerClass = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200';
          if (title === '1200+') headerClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';

          return (
             <div key={title} className="flex flex-col border-r last:border-r-0 h-full min-h-[500px]">
                <div className={`p-3 text-center font-bold text-base border-b uppercase tracking-wide sticky top-0 z-10 ${headerClass}`}>
                  {title} <span className="text-xs opacity-70 ml-1 font-normal">({items.length})</span>
                </div>
                
                <div className="p-2 space-y-2 flex-1">
                  {items.map((sub, i) => (
                    <div 
                        key={i} 
                        className="group relative p-3 rounded-md bg-card border shadow-sm hover:shadow-md transition-all hover:border-primary/50 flex flex-col gap-1"
                    >
                      {/* Left color bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${getRatingColor(sub.rating)}`} />
                      
                      <div className="pl-2">
                          <div className="font-semibold text-sm leading-snug flex justify-between items-start gap-2">
                             <a 
                                href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate hover:underline hover:text-primary transition-colors"
                                title={sub.problem_name}
                             >
                                {sub.problem_name}
                             </a>
                             <a 
                                href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                             >
                                <ExternalLink className="w-4 h-4" />
                             </a>
                          </div>
                          
                          <div className="text-xs font-mono text-muted-foreground mt-1">
                             {sub.contest_id}{sub.problem_index}
                          </div>

                          {/* Tags */}
                          {sub.tags && sub.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {sub.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground">
                                  {tag}
                                </Badge>
                              ))}
                              {sub.tags.length > 2 && (
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground cursor-help" 
                                  title={sub.tags.slice(2).join(', ')}
                                >
                                  +{sub.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed">
                             <div className="flex items-center gap-1 text-xs text-muted-foreground" title={new Date(sub.submission_time).toLocaleString()}>
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(sub.submission_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                                  {' '} 
                                  {new Date(sub.submission_time).toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', year: '2-digit' })}
                                </span>
                             </div>
                             {sub.rating && (
                                <Badge variant="outline" className="text-xs h-5 px-1.5 py-0">
                                    {sub.rating}
                                </Badge>
                             )}
                          </div>

                          
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground/30 text-sm italic p-4">
                        Sin envíos
                    </div>
                  )}
                </div>
             </div>
          )
        })}
      </div>
    </div>
  )
}
