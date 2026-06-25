'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function GlobalBanner() {
  const [banner, setBanner] = useState(null); const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { (async () => { try { const a = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; const r = await axios.get(`${a()}/notifications`); const b = r.data.data.banner; if (b) { const c = JSON.parse(localStorage.getItem('closed_global_banner') || '{}'); if (c.expiresAt === b.expiresAt) return; setBanner(b); setIsVisible(true) } } catch (_) {} })() }, []);
  const close = () => { setIsVisible(false); if (banner) localStorage.setItem('closed_global_banner', JSON.stringify({ expiresAt: banner.expiresAt })) };
  if (!isVisible || !banner) return null;
  const s = { info: 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-900 dark:text-indigo-300', warning: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-300', error: 'bg-red-50 border-red-100 text-red-700 dark:bg-red-950/60 dark:border-red-900 dark:text-red-300' }
  const i = { info: <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />, warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />, error: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" /> }
  return (
    <div className={`w-full border-b ${s[banner.type] || s.info}`}>
      <div className="container flex items-center justify-between gap-3 px-4 py-2"><div className="flex items-center gap-2">{i[banner.type] || i.info}<span className="text-sm font-medium">{banner.message}</span></div><button onClick={close} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors shrink-0"><X className="w-3.5 h-3.5 opacity-70 hover:opacity-100" /></button></div>
    </div>
  )
}
