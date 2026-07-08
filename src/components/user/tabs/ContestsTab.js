'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function ContestsTab({ handle }) {
  const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true); const [currentPage, setCurrentPage] = useState(1); const PER_PAGE = 15
  useEffect(() => { (async () => { try { const r = await apiClient.getRatingHistory(handle); if (r.success && r.data) setHistory([...r.data].reverse()) } catch (_) {} finally { setLoading(false) } })() }, [handle])
  const totalPages = Math.ceil(history.length / PER_PAGE); const start = (currentPage - 1) * PER_PAGE; const current = history.slice(start, start + PER_PAGE)
  const getRC = (r) => { if (!r) return 'text-muted-foreground'; if (r < 1200) return 'text-gray-500 dark:text-gray-400'; if (r < 1400) return 'text-green-600 dark:text-green-400'; if (r < 1600) return 'text-cyan-600 dark:text-cyan-400'; if (r < 1900) return 'text-blue-600 dark:text-blue-400'; if (r < 2100) return 'text-violet-600 dark:text-violet-400'; if (r < 2400) return 'text-orange-600 dark:text-orange-400'; return 'text-red-600 dark:text-red-400' }
  const getVC = (v) => { if (v === 'OK') return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'; if (v === 'WRONG_ANSWER') return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'; if (v) return 'bg-muted/30 border-border/30'; return '' }
  const clean = (n) => n.replace(/^Codeforces\s*/i, 'CF ')

  if (loading) return <div className="flex items-center justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  if (!history.length) return <Card className="border-hairline"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><Trophy className="h-8 w-8 text-muted/20" /><p className="text-sm text-muted">Sin historial de contests.</p></CardContent></Card>

  const baseIndices = Array.from(new Set(history.flatMap(c => c.problems?.map(p => p.index.replace(/^([A-Z]+).*/, '$1')) || []))).sort((a, b) => a.length !== b.length ? a.length - b.length : a.localeCompare(b))

  return (
    <div className="animate-fade-in">
      <Card className="border-hairline overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <colgroup><col className="w-[200px] min-w-[180px]" />{baseIndices.map(i => <col key={i} className="w-[140px] min-w-[120px]" />)}</colgroup>
              <thead>
                <tr className="bg-surface-card text-muted border-b border-hairline/60">
                  <th className="p-3 font-semibold sticky left-0 bg-canvas z-10">Contest</th>
                  {baseIndices.map(i => <th key={i} className="p-2.5 font-semibold text-center border-l border-hairline/60">{i}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline/20">
                {current.map(contest => (
                  <tr key={contest.contestId} className="hover:bg-surface-card transition-colors">
                    <td className="p-3 sticky left-0 bg-canvas z-10 border-r border-hairline/60">
                      <a href={`https://codeforces.com/contest/${contest.contestId}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground line-clamp-1 block hover:text-primary transition-colors text-sm" title={contest.contestName}>{clean(contest.contestName)}</a>
                      <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                        <span>{new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}</span>
                        <span className={`inline-flex items-center gap-0.5 font-mono font-semibold rounded px-1.5 py-0.5 ${
                          contest.newRating > contest.oldRating ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20' :
                          contest.newRating < contest.oldRating ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20' : 'text-muted bg-surface-elevated'
                        }`}>
                          {contest.newRating > contest.oldRating ? <TrendingUp className="h-3 w-3" /> : contest.newRating < contest.oldRating ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                          {contest.newRating}
                        </span>
                      </div>
                    </td>
                    {baseIndices.map(baseIdx => {
                      const problems = contest.problems?.filter(p => p.index.replace(/^([A-Z]+).*/, '$1') === baseIdx).sort((a, b) => a.index.localeCompare(b.index, undefined, { numeric: true }))
                      if (!problems?.length) return <td key={baseIdx} className="p-0 border-l border-hairline/60 bg-surface-card/10"></td>
                      return (
                        <td key={baseIdx} className="p-0 align-top border-l border-hairline/60">
                          <div className="flex h-full min-h-[60px] divide-x divide-hairline/30">
                            {problems.map(p => (
                              <div key={p.index} className={`flex-1 p-2 flex flex-col justify-between relative overflow-hidden text-clip border-b-2 ${getVC(p.verdict)}`}>
                                <div className={`font-bold text-xs leading-tight line-clamp-2 mb-0.5 ${getRC(p.rating)}`} title={p.name}>
                                  <span className="opacity-50 mr-0.5 text-foreground/40">{p.index}.</span>{p.name}
                                </div>
                                {p.rating && <div className={`text-[10px] font-semibold ${getRC(p.rating)}`}>{p.rating}</div>}
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-3 border-t border-hairline/60 bg-surface-card">
              <span className="text-sm text-muted">{start + 1}-{Math.min(start + PER_PAGE, history.length)} de {history.length}</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm font-medium px-1">{currentPage}/{totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
