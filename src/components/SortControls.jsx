import { Button } from './ui/button';

export default function SortControls({ sortBy, sortOrder, onSortChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Orden:</span>
      {['rating', 'date'].map(f => (
        <Button key={f} variant={sortBy === f ? 'default' : 'outline'} size="sm" onClick={() => onSortChange(f, sortBy === f ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc')} className="h-7 text-xs px-2">
          {f === 'rating' ? 'Rating' : 'Fecha'} {sortBy === f ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </Button>
      ))}
    </div>
  )
}
