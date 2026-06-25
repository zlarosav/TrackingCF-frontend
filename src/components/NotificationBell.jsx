'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]); const [unreadCount, setUnreadCount] = useState(0); const [isOpen, setIsOpen] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const a = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; const r = await axios.get(`${a()}/notifications`); const n = r.data.data.notifications || []; const read = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('read_notifications') || '[]') : []; const p = n.map(x => ({ ...x, isRead: read.includes(x.id) })); setNotifications(p); setUnreadCount(p.filter(x => !x.isRead).length) } catch (_) {} finally { setLoading(false) } })() }, []);
  const markAll = () => { const ids = notifications.map(n => n.id); localStorage.setItem('read_notifications', JSON.stringify(ids)); setNotifications(p => p.map(n => ({ ...n, isRead: true }))); setUnreadCount(0) };
  if (loading && !notifications.length) return null;
  return (
    <div className="relative">
      <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative border-border/30 h-8 w-8"><Bell className="h-[1.1rem] w-[1.1rem]" />{unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full z-10">{unreadCount > 9 ? '9+' : unreadCount}</span>}</Button>
      {isOpen && <><div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} /><div className="absolute right-0 mt-2 w-80 rounded-lg border border-border/30 bg-card shadow-lg z-50 overflow-hidden">
        <div className="border-b border-border/20 bg-muted/10 p-3 flex justify-between items-center"><span className="font-semibold text-sm">Notificaciones</span>{unreadCount > 0 && <button onClick={markAll} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Marcar leídas</button>}</div>
        <div className="max-h-80 overflow-y-auto">{!notifications.length ? <div className="p-5 text-center text-muted-foreground text-sm">No hay notificaciones</div>
          : notifications.map(notif => (<div key={notif.id} onClick={() => { if (notif.link) window.location.href = notif.link }} className={`p-3 border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors ${!notif.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''} ${notif.link ? 'cursor-pointer' : ''}`}>
            <div className="flex gap-2.5"><span className="mt-0.5 text-base shrink-0">{notif.type === 'CONTEST' ? '🏆' : notif.type === 'RANK_UP' ? '🚀' : notif.type === 'SYSTEM' ? '📢' : '⚠️'}</span>
            <div><p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'text-muted-foreground'}`}>{notif.message}</p><span className="text-xs text-muted-foreground">{new Date(notif.created_at).toLocaleDateString()}</span></div></div></div>))}</div>
      </div></>}
    </div>
  )
}
