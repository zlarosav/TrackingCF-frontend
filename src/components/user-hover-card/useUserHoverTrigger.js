'use client'

import { useCallback, useRef } from 'react'
import { useUserHoverCard } from './UserHoverCardProvider'

// Devuelve handlers de puntero para spreadear sobre el elemento que ya existe
// (Link, span, div...) — no envuelve nada, así que no altera el layout.
// Solo reacciona a mouse real (pointerType === 'mouse'); en touch no hace nada,
// dejando el comportamiento de tap/navegación exactamente como está hoy.
export function useUserHoverTrigger(handle, user) {
  const { open, move, scheduleClose, cancelClose, isVisible, OPEN_DELAY, REOPEN_DELAY } = useUserHoverCard()
  const openTimer = useRef(null)

  const clearOpenTimer = useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null }
  }, [])

  const onPointerEnter = useCallback((e) => {
    if (e.pointerType !== 'mouse' || !handle) return
    cancelClose()
    const { clientX, clientY } = e
    const delay = isVisible() ? REOPEN_DELAY : OPEN_DELAY
    clearOpenTimer()
    openTimer.current = setTimeout(() => open(handle, user || null, clientX, clientY), delay)
  }, [handle, user, open, cancelClose, isVisible, OPEN_DELAY, REOPEN_DELAY, clearOpenTimer])

  const onPointerMove = useCallback((e) => {
    if (e.pointerType !== 'mouse') return
    move(e.clientX, e.clientY)
  }, [move])

  const onPointerLeave = useCallback((e) => {
    if (e.pointerType !== 'mouse') return
    clearOpenTimer()
    scheduleClose()
  }, [scheduleClose, clearOpenTimer])

  const onClick = useCallback(() => {
    clearOpenTimer()
    scheduleClose()
  }, [scheduleClose, clearOpenTimer])

  return { onPointerEnter, onPointerMove, onPointerLeave, onClick }
}
