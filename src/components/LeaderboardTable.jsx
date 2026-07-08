'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { User, ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'
import { useUserHoverTrigger } from '@/components/user-hover-card/useUserHoverTrigger'

function SortableHeader({ column, sortBy, sortOrder, onSort, children }) {
  const active = sortBy === column
  return (
    <TableHead
      className="cursor-pointer text-center text-caption uppercase tracking-wider text-muted hover:text-primary transition-colors p-2 sm:p-3 h-9 font-medium"
      onClick={() => onSort(column)}
    >
      <div className="inline-flex items-center gap-0.5">
        {children}
        {active
          ? (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
          : <ArrowUpDown className="h-3 w-3 opacity-30" />}
      </div>
    </TableHead>
  )
}

function LeaderboardRow({ user, index }) {
  const handles = [user.leetcode_handle && `LC:${user.leetcode_handle}`, user.atcoder_handle && `AC:${user.atcoder_handle}`, user.codechef_handle && `CC:${user.codechef_handle}`].filter(Boolean)
  const rankColor = index === 0 ? 'text-primary' : index === 1 ? 'text-muted-strong' : index === 2 ? 'text-amber-600' : ''
  const hoverProps = useUserHoverTrigger(user.handle, user)
  return (
    <TableRow className="transition-colors hover:bg-primary/5 border-t border-hairline/60">
      <TableCell className="text-center p-2 sm:p-3">
        <span className={`text-body-sm sm:text-body-md font-bold ${rankColor || 'text-muted'}`}>{index + 1}</span>
      </TableCell>
      <TableCell className="p-2 sm:p-3">
        <div className="flex items-center gap-2 sm:gap-3" {...hoverProps}>
          <Link href={`/user/${user.handle}`}>
            {user.avatar_url ? <div className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-surface-elevated"><Image src={user.avatar_url} alt={user.handle} width={36} height={36} className="h-full w-full object-cover" unoptimized /></div>
              : <div className="flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated"><User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted" /></div>}
          </Link>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Link href={`/user/${user.handle}`} className="hover:underline leading-none">
                <span className={`text-body-sm sm:text-body-md font-semibold ${getRatingColorClass(user.rating)}`}>{user.handle}</span>
              </Link>
              <StreakBadge streak={user.current_streak} isActive={user.streak_active} />
            </div>
            {handles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {handles.map(h => <span key={h} className="rounded-sm bg-surface-elevated px-1 py-0.5 text-[9px] sm:text-[10px] text-muted">{h}</span>)}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-surface">{user.count_no_rating || 0}</span></TableCell>
      <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-surface">{user.count_800_900 || 0}</span></TableCell>
      <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-surface">{user.count_1000 || 0}</span></TableCell>
      <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-surface">{user.count_1100 || 0}</span></TableCell>
      <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-surface">{user.count_1200_plus || 0}</span></TableCell>
      <TableCell className="text-center p-2 sm:p-3"><span className="font-mono text-body-sm sm:text-body-md tabular-nums text-on-surface">{user.total_submissions || 0}</span></TableCell>
      <TableCell className="text-center p-2 sm:p-3">
        <Badge className="bg-primary text-on-primary font-bold font-mono text-body-sm sm:text-body-md px-1.5 sm:px-2.5 py-0.5 rounded-sm">{user.total_score || 0}</Badge>
      </TableCell>
    </TableRow>
  )
}

function LeaderboardTable({ users, sortBy, sortOrder, onSort }) {
  return (
    <div className="rounded-xl border border-hairline/60 overflow-hidden">
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-elevated flex items-center justify-between border-b border-hairline/60">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          <span className="text-body-sm sm:text-body-md font-semibold text-on-surface">Clasificación</span>
        </div>
        <span className="text-caption sm:text-body-sm text-muted whitespace-nowrap">{users.length} participantes</span>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[600px] sm:min-w-0">
          <TableHeader>
            <TableRow className="bg-surface-elevated">
              <TableHead className="w-8 text-center text-caption uppercase text-muted p-2 sm:p-3 font-medium">#</TableHead>
              <TableHead className="text-caption uppercase text-muted p-2 sm:p-3 font-medium">Usuario</TableHead>
              <SortableHeader column="count_no_rating" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>Sin rtg</SortableHeader>
              <SortableHeader column="count_800_900" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>800</SortableHeader>
              <SortableHeader column="count_1000" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>1000</SortableHeader>
              <SortableHeader column="count_1100" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>1100</SortableHeader>
              <SortableHeader column="count_1200_plus" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>1200+</SortableHeader>
              <SortableHeader column="total_submissions" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>Envíos</SortableHeader>
              <SortableHeader column="total_score" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>Score</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <LeaderboardRow key={user.id} user={user} index={index} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default memo(LeaderboardTable)
