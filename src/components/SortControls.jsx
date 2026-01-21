import { Button } from './ui/button';

export default function SortControls({ sortBy, sortOrder, onSortChange }) {
  const handleSort = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Ordenar por:</span>
      <Button
        variant={sortBy === 'rating' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSort('rating')}
      >
        Rating {getSortIcon('rating')}
      </Button>
      <Button
        variant={sortBy === 'date' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleSort('date')}
      >
        Fecha {getSortIcon('date')}
      </Button>
    </div>
  );
}
