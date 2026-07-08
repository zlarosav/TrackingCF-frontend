'use client'

const OPTIONS = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
  { value: 'all', label: 'Todo' },
];

export default function PeriodFilter({ period, onPeriodChange }) {
  return (
    <div className="inline-flex rounded-lg bg-surface-card p-0.5 border border-hairline/60">
      {OPTIONS.map(({ value, label }) => (
        <button key={value} onClick={() => onPeriodChange(value)}
          className={`px-3 py-1.5 text-body-md font-medium rounded-md transition-all ${period === value ? 'bg-primary text-on-primary' : 'text-muted hover:text-on-surface'}`}
        >{label}</button>
      ))}
    </div>
  )
}
