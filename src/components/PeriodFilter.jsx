'use client'

import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Calendar } from 'lucide-react'

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Mes actual' },
  { value: 'year', label: 'Año actual' },
  { value: 'all', label: 'Toda la vida' },
];

export default function PeriodFilter({ period, onPeriodChange }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-semibold text-lg">
           <Calendar className="h-5 w-5" />
           Periodo de Tiempo
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
