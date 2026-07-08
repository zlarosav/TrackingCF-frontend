'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DateTime } from 'luxon'
import Link from 'next/link'
import Image from 'next/image'
import { User as UserIcon, ArrowRight } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { getRatingColorClass } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import StreakBadge from '@/components/StreakBadge'

const OPEN_DELAY = 300
const REOPEN_DELAY = 60 // casi instantáneo al pasar de un trigger a otro con la card ya visible
const CLOSE_DELAY = 150
const CARD_WIDTH = 320 // w-80
const CARD_HEIGHT_ESTIMATE = 240
const CURSOR_OFFSET = 16
const VIEWPORT_MARGIN = 12
const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'] // getDay(): 0=domingo

const UserHoverCardContext = createContext(null)

export function useUserHoverCard() {
  const ctx = useContext(UserHoverCardContext)
  if (!ctx) throw new Error('useUserHoverCard debe usarse dentro de UserHoverCardProvider')
  return ctx
}

function clampPosition(x, y) {
  if (typeof window === 'undefined') return { left: x, top: y }
  let left = x + CURSOR_OFFSET
  let top = y + CURSOR_OFFSET
  if (left + CARD_WIDTH + VIEWPORT_MARGIN > window.innerWidth) left = x - CARD_WIDTH - CURSOR_OFFSET
  if (top + CARD_HEIGHT_ESTIMATE + VIEWPORT_MARGIN > window.innerHeight) top = y - CARD_HEIGHT_ESTIMATE - CURSOR_OFFSET
  left = Math.min(Math.max(left, VIEWPORT_MARGIN), window.innerWidth - CARD_WIDTH - VIEWPORT_MARGIN)
  top = Math.min(Math.max(top, VIEWPORT_MARGIN), window.innerHeight - CARD_HEIGHT_ESTIMATE - VIEWPORT_MARGIN)
  return { left, top }
}

export function UserHoverCardProvider({ children }) {
  const [state, setState] = useState({ visible: false, handle: null, prefetched: null })
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const visibleRef = useRef(false)
  const closeTimer = useRef(null)
  const rafId = useRef(null)
  const pendingPos = useRef(null)

  const cancelClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }, [])

  const doClose = useCallback(() => {
    visibleRef.current = false
    setState(s => (s.visible ? { ...s, visible: false } : s))
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimer.current = setTimeout(doClose, CLOSE_DELAY)
  }, [cancelClose, doClose])

  const open = useCallback((handle, prefetched, x, y) => {
    cancelClose()
    visibleRef.current = true
    setState({ visible: true, handle, prefetched: prefetched || null })
    setPos(clampPosition(x, y))
  }, [cancelClose])

  const move = useCallback((x, y) => {
    pendingPos.current = { x, y }
    if (rafId.current) return
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null
      if (pendingPos.current) setPos(clampPosition(pendingPos.current.x, pendingPos.current.y))
    })
  }, [])

  const isVisible = useCallback(() => visibleRef.current, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') doClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [doClose])

  useEffect(() => () => {
    if (rafId.current) cancelAnimationFrame(rafId.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const ctxValue = useMemo(
    () => ({ open, move, scheduleClose, cancelClose, isVisible, OPEN_DELAY, REOPEN_DELAY }),
    [open, move, scheduleClose, cancelClose, isVisible]
  )

  return (
    <UserHoverCardContext.Provider value={ctxValue}>
      {children}
      {state.visible && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          className="fixed z-50 w-80 rounded-xl border border-hairline/60 bg-surface-card shadow-lg overflow-hidden"
          style={{ left: pos.left, top: pos.top }}
        >
          <UserCardBody handle={state.handle} prefetched={state.prefetched} />
        </div>,
        document.body
      )}
    </UserHoverCardContext.Provider>
  )
}

function UserCardBody({ handle, prefetched }) {
  const [data, setData] = useState(prefetched)
  const [notFound, setNotFound] = useState(false)
  // Se marca true cuando el fetch de /card se resuelve (éxito o falla), sin importar
  // si trajo last7Days — así el gráfico nunca se queda esperando para siempre.
  const [cardLoaded, setCardLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setData(prefetched)
    setNotFound(false)
    setCardLoaded(false)
    apiClient.getUserCard(handle).then(r => {
      if (cancelled) return
      if (r.success) setData(prev => ({ ...prev, ...r.data }))
      else setNotFound(true)
    }).catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setCardLoaded(true) })
    return () => { cancelled = true }
  }, [handle, prefetched])

  if (!data) {
    if (notFound) return <div className="p-4 text-body-sm text-muted">Usuario no encontrado.</div>
    return (
      <div className="p-4 space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-surface-elevated" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/3 rounded bg-surface-elevated" />
            <div className="h-3 w-1/3 rounded bg-surface-elevated" />
          </div>
        </div>
        <div className="h-16 w-full rounded bg-surface-elevated" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        {data.avatar_url
          ? <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-surface-elevated"><Image src={data.avatar_url} alt={data.handle} width={48} height={48} className="h-full w-full object-cover" unoptimized /></div>
          : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-elevated"><UserIcon className="h-5 w-5 text-muted" /></div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-body-md truncate ${getRatingColorClass(data.rating)}`}>{data.handle}</span>
            <StreakBadge streak={data.current_streak} isActive={data.streak_active} />
          </div>
          <p className="text-caption text-muted truncate">
            {data.rating ? `Rating ${data.rating}` : 'Sin rating'}{data.rank ? ` · ${data.rank}` : ''}
          </p>
        </div>
      </div>

      <div>
        <p className="text-caption text-muted mb-1">Últimos 7 días</p>
        {Array.isArray(data.last7Days) ? (
          <WeekActivityChart days={data.last7Days} />
        ) : cardLoaded ? (
          <div className="flex h-14 items-center justify-center text-caption text-muted">Sin datos de actividad</div>
        ) : (
          <div className="h-14 w-full rounded bg-surface-elevated animate-pulse" />
        )}
      </div>

      <Button asChild variant="default" size="sm" className="w-full">
        <Link href={`/user/${data.handle}`}>
          Ver perfil <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

function WeekActivityChart({ days }) {
  const max = Math.max(1, ...days.map(d => d.count))
  const todayStr = DateTime.now().setZone('America/Lima').toFormat('yyyy-MM-dd')
  return (
    <div className="flex items-end justify-between gap-1 h-14">
      {days.map(d => {
        const isToday = d.date === todayStr
        const weekday = WEEKDAY_LABELS[new Date(`${d.date}T00:00:00`).getDay()]
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${d.count} envío${d.count === 1 ? '' : 's'}`}>
            <div className="flex h-9 w-full items-end">
              <div
                className={`w-full rounded-t-sm transition-all ${d.count > 0 ? 'bg-primary' : 'bg-surface-elevated'}`}
                style={{ height: `${Math.max(15, (d.count / max) * 100)}%` }}
              />
            </div>
            <span className={`text-[9px] leading-none ${isToday ? 'text-primary font-semibold' : 'text-muted'}`}>{weekday}</span>
          </div>
        )
      })}
    </div>
  )
}
