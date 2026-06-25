'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

export default function FilterBar({ filters, setFilters }) {
  const [show, setShow] = useState(false); const [range, setRange] = useState([filters.ratingMin || 0, filters.ratingMax || 4000])
  const hasActive = filters.ratingMin || filters.ratingMax || filters.dateFrom || filters.dateTo

  return (
    <div className="rounded-lg border border-border/30 bg-card p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5"><Filter className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Filtros</span></div>
        <div className="flex gap-1.5">
          {hasActive && <Button variant="outline" size="sm" onClick={() => { setFilters({ ratingMin: '', ratingMax: '', dateFrom: '', dateTo: '', sortBy: 'submission_time', order: 'desc' }); setRange([0, 4000]) }} className="h-8 text-xs px-2"><X className="h-3.5 w-3.5 mr-0.5" />Limpiar</Button>}
          <Button variant="outline" size="sm" onClick={() => setShow(!show)} className="h-8 text-xs px-2">{show ? 'Ocultar' : 'Mostrar'}</Button>
        </div>
      </div>
      {show && <div className="mt-3 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between"><span className="text-sm font-medium">Rating</span><span className="text-sm text-muted-foreground font-mono">{range[0]} — {range[1]}</span></div>
          <Slider min={0} max={4000} step={100} value={range} onValueChange={v => { setRange(v); setFilters({ ...filters, ratingMin: v[0] > 0 ? v[0] : '', ratingMax: v[1] < 4000 ? v[1] : '' }) }} className="w-full" />
        </div>
        <div className="grid gap-3 grid-cols-2"><div className="space-y-1"><span className="text-xs font-medium text-muted-foreground">Desde</span><Input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className="h-8 text-sm" /></div><div className="space-y-1"><span className="text-xs font-medium text-muted-foreground">Hasta</span><Input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className="h-8 text-sm" /></div></div>
      </div>}
    </div>
  )
}
