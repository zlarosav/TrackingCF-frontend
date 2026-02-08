'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ContestsTab({ handle }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.getRatingHistory(handle)
        if (response.success && response.data) {
           setHistory([...response.data].reverse()) 
        }
      } catch (err) {
        console.error('Error fetching rating history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [handle])

  // Pagination Logic
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentContests = history.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
    }
  }

  // Helper for Rating Colors (Codeforces standard)
  const getRatingColor = (rating) => {
    if (!rating) return 'text-muted-foreground'
    if (rating < 1200) return 'text-gray-500 dark:text-gray-400'
    if (rating < 1400) return 'text-green-600 dark:text-green-400'
    if (rating < 1600) return 'text-cyan-600 dark:text-cyan-400'
    if (rating < 1900) return 'text-blue-600 dark:text-blue-400'
    if (rating < 2100) return 'text-violet-600 dark:text-violet-400'
    if (rating < 2400) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getVerdictStyles = (verdict) => {
      // Flat styles, filling the cell
      if (verdict === 'OK') return 'bg-green-100 dark:bg-green-900/30' 
      if (verdict === 'WRONG_ANSWER') return 'bg-red-100 dark:bg-red-900/30'
      if (verdict === 'TIME_LIMIT_EXCEEDED') return 'bg-yellow-100 dark:bg-yellow-900/30'
      if (verdict) return 'bg-neutral-100 dark:bg-neutral-800' // Generic attempt
      return '' // Empty
  }

  const getRatingChangeColor = (oldR, newR) => {
      if (newR > oldR) return 'text-green-600 dark:text-green-400' 
      if (newR < oldR) return 'text-red-600 dark:text-red-400'
      return 'text-muted-foreground'
  }

  // Extract unique "Base Indices" (A, B, C...) for columns
  // Note: We should probably compute this based on ALL history to keep columns consistent across pages?
  // OR just current page? Usually consistent is better, but fetching keys from 15 items might miss 'H' or 'I'.
  // However, variable columns per page can be annoying.
  // Let's use `history` (all items) for columns to be stable.
  const baseIndices = Array.from(new Set(history.flatMap(c => 
      c.problems?.map(p => p.index.replace(/^([A-Z]+).*/, '$1')) || [] // Extract letters
  ))).sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length;
      return a.localeCompare(b);
  });

  const cleanContestName = (name) => {
      return name.replace(/^Codeforces\s*/i, 'CF ');
  }

  if (loading) return <div className="text-center p-8 text-muted-foreground animate-pulse">Cargando historial...</div>
  
  if (!history.length) return (
        <Card className="bg-background border-border">
            <CardContent className="p-8 text-center text-muted-foreground">
                <Trophy className="w-12 h-12 opacity-20 mx-auto mb-4" />
                No hay historial disponible.
            </CardContent>
        </Card>
  )

  return (
    <div className="space-y-6">
      <Card className="bg-background border-border w-full overflow-hidden">

        <CardContent className="p-0">
             {/* Scrollable Container */}
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse text-sm table-fixed">
                    <colgroup>
                        <col className="w-[200px]" /> {/* Contest Name Fixed */}
                        {baseIndices.map(idx => (
                            <col key={idx} className="w-[160px]" /> 
                        ))}
                    </colgroup>
                    <thead>
                        <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                            <th className="p-4 font-medium sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Contest</th>
                            {baseIndices.map(idx => (
                                <th key={idx} className="p-3 font-medium text-center border-l border-border">{idx}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {currentContests.map((contest) => (
                            <tr key={contest.contestId} className="hover:bg-muted/30 transition-colors group">
                                <td className="p-4 sticky left-0 bg-background z-10 border-r border-border shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                    <a 
                                        href={`https://codeforces.com/contest/${contest.contestId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-foreground mb-1 truncate block hover:underline"
                                        title={contest.contestName}
                                    >
                                        {cleanContestName(contest.contestName)}
                                    </a>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}</span>
                                        <span className={`px-1 rounded bg-muted ${getRatingChangeColor(contest.oldRating, contest.newRating)}`}>
                                            {contest.newRating} 
                                        </span>
                                    </div>
                                </td>
                                {baseIndices.map(baseIdx => {
                                    const groupProblems = contest.problems?.filter(p => {
                                        const pBase = p.index.replace(/^([A-Z]+).*/, '$1');
                                        return pBase === baseIdx;
                                    }).sort((a, b) => a.index.localeCompare(b.index, undefined, { numeric: true }));
                                    
                                    if (!groupProblems?.length) {
                                        return <td key={baseIdx} className="p-0 border-l border-border bg-muted/5"></td>;
                                    }

                                    return (
                                        <td key={baseIdx} className="p-0 align-top border-l border-border">
                                            <div className="flex h-full min-h-[70px] divide-x divide-border">
                                                {groupProblems.map(problem => (
                                                    <div key={problem.index} className={`
                                                        flex-1 p-2 transition-all
                                                        flex flex-col justify-between relative overflow-hidden text-clip
                                                        ${getVerdictStyles(problem.verdict)}
                                                    `}>
                                                        <div className={`font-bold text-[11px] leading-tight line-clamp-2 mb-1 ${getRatingColor(problem.rating)}`} title={problem.name}>
                                                            <span className="opacity-70 mr-1 text-foreground/70">{problem.index}.</span>
                                                            {problem.name}
                                                        </div>
                                                        {problem.rating && (
                                                            <div className={`text-[10px] font-medium opacity-80 ${getRatingColor(problem.rating)}`}>
                                                                {problem.rating}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, history.length)} de {history.length} contests
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium">
                            Página {currentPage} de {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
