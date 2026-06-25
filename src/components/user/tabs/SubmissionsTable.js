'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, Calendar } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

const getColor = (r) => { if (!r) return 'bg-muted-foreground/30'; if (r < 1200) return 'bg-muted-foreground/40'; if (r < 1400) return 'bg-green-500'; if (r < 1600) return 'bg-cyan-500'; if (r < 1900) return 'bg-blue-600'; if (r < 2100) return 'bg-purple-600'; if (r < 2300) return 'bg-orange-500'; return 'bg-red-600' }
const COLS = ['No rating', '800 - 900', '1000', '1100', '1200+']
const HC = { 'No rating': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', '800 - 900': 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300', '1000': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', '1100': 'bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary', '1200+': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }

export default function SubmissionsTable({ submissions }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const filtered = useMemo(() => submissions.filter(sub => { const d = new Date(sub.submission_time); return d.getFullYear() === parseInt(selectedYear) && d.getMonth() === parseInt(selectedMonth) }), [submissions, selectedYear, selectedMonth])
  const columns = {}; COLS.forEach(k => columns[k] = [])
  filtered.forEach(sub => { const r = sub.rating; let k = 'No rating'; if (r >= 800 && r <= 900) k = '800 - 900'; else if (r === 1000) k = '1000'; else if (r === 1100) k = '1100'; else if (r >= 1200) k = '1200+'; (columns[k] || columns['No rating']).push(sub) })

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 rounded-lg border border-hairline bg-canvas p-3">
        <span className="text-sm font-medium text-muted">Filtrar:</span>
        <select className="h-8 rounded-sm border border-hairline bg-canvas px-2.5 text-sm focus:outline-none focus:border-primary/50" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="h-8 rounded-sm border border-hairline bg-canvas px-2.5 text-sm focus:outline-none focus:border-primary/50" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="ml-auto text-sm text-muted">{filtered.length} problemas</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 rounded-lg border border-hairline overflow-hidden bg-surface-card-dark">
        {COLS.map(title => {
          const items = columns[title] || []
          return (
            <div key={title} className="flex flex-col border-r last:border-r-0 border-hairline-on-dark/60 min-h-[350px]">
              <div className={`sticky top-0 z-10 p-2.5 text-center text-sm font-bold uppercase tracking-wide border-b border-hairline-on-dark/60 ${HC[title] || 'bg-surface-elevated-dark text-muted'}`}>
                {title} <span className="text-xs opacity-70 font-normal">({items.length})</span>
              </div>
              <div className="p-1.5 space-y-1.5 flex-1">
                {items.map((sub, i) => (
                  <div key={i} className="group relative rounded-md border border-hairline-on-dark/60 bg-canvas p-2.5 hover:border-primary/30 dark:hover:border-primary/50 transition-colors">
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-sm ${getColor(sub.rating)}`} />
                    <div className="pl-2.5 leading-tight">
                      <div className="flex justify-between items-start gap-1">
                        <a href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold line-clamp-1 hover:text-primary" title={sub.problem_name}>{sub.problem_name}</a>
                        <a href={`https://codeforces.com/contest/${sub.contest_id}/problem/${sub.problem_index}`} target="_blank" rel="noopener noreferrer" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink className="h-3 w-3 text-muted-foreground" /></a>
                      </div>
                      <div className="text-xs font-mono text-muted">{sub.contest_id}{sub.problem_index}</div>
                      {sub.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {sub.tags.slice(0,2).map((tag, idx) => <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0 h-4.5">{tag}</Badge>)}
                          {sub.tags.length > 2 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4.5">+{sub.tags.length - 2}</Badge>}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-dashed border-border/30">
                        <span className="text-xs text-muted flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(sub.submission_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} {new Date(sub.submission_time).toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric' })}</span>
                        {sub.rating && <Badge variant="secondary" className="text-xs h-5 px-1.5 font-mono">{sub.rating}</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
                {!items.length && <div className="flex h-full items-center justify-center text-muted/30 text-sm italic p-4">Sin envíos</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
