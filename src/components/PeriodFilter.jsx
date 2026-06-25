'use client'

const OPTIONS = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
  { value: 'all', label: 'Todo' },
];

export default function PeriodFilter({ period, onPeriodChange }) {
  return (
    <div className="inline-flex rounded-lg border border-border/30 bg-card p-0.5 shadow-sm">
      {OPTIONS.map(({ value, label }) => (
        <button key={value} onClick={() => onPeriodChange(value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === value ? 'bg-indigo-600 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >{label}</button>
      ))}
    </div>
  )
}
