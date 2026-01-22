'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

export default function FilterBar({ filters, setFilters }) {
  const [showFilters, setShowFilters] = useState(false)
  const [ratingRange, setRatingRange] = useState([
    filters.ratingMin || 0,
    filters.ratingMax || 4000
  ])

  const handleRatingChange = (values) => {
    setRatingRange(values)
    setFilters({
      ...filters,
      ratingMin: values[0] > 0 ? values[0] : '',
      ratingMax: values[1] < 4000 ? values[1] : ''
    })
  }

  const handleClearFilters = () => {
    setFilters({
      ratingMin: '',
      ratingMax: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'submission_time',
      order: 'desc'
    })
    setRatingRange([0, 4000])
  }

  const hasActiveFilters = filters.ratingMin || filters.ratingMax || filters.dateFrom || filters.dateTo

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent className="space-y-6">
          {/* Rating Range Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rating</label>
              <div className="text-sm text-muted-foreground">
                {ratingRange[0]} - {ratingRange[1]}
              </div>
            </div>
            <Slider
              min={0}
              max={4000}
              step={100}
              value={ratingRange}
              onValueChange={handleRatingChange}
              className="w-full"
            />
          </div>

          {/* Date Filters */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
