import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = []; const maxVis = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVis / 2));
  let end = Math.min(totalPages, start + maxVis - 1);
  if (end - start < maxVis - 1) start = Math.max(1, end - maxVis + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-0.5">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="inline-flex items-center justify-center h-8 w-8 rounded-sm border border-hairline-on-dark/60 text-muted hover:text-on-dark hover:bg-surface-elevated-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
      {start > 1 && <><button onClick={() => onPageChange(1)} className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-body-sm font-medium text-muted hover:text-on-dark hover:bg-surface-elevated-dark">1</button>{start > 2 && <span className="text-hairline-on-dark/60 text-xs px-0.5">...</span>}</>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`inline-flex items-center justify-center h-8 w-8 rounded-sm text-body-sm font-medium transition-all ${currentPage === p ? 'bg-primary text-on-primary' : 'text-muted hover:text-on-dark hover:bg-surface-elevated-dark'}`}>{p}</button>
      ))}
      {end < totalPages && <>{end < totalPages - 1 && <span className="text-hairline-on-dark/60 text-xs px-0.5">...</span>}<button onClick={() => onPageChange(totalPages)} className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-body-sm font-medium text-muted hover:text-on-dark hover:bg-surface-elevated-dark">{totalPages}</button></>}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center h-8 w-8 rounded-sm border border-hairline-on-dark/60 text-muted hover:text-on-dark hover:bg-surface-elevated-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
    </div>
  );
}
