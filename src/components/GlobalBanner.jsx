'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function GlobalBanner() {
  const [banner, setBanner] = useState(null); const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { (async () => { try { const a = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; const r = await axios.get(`${a()}/notifications`); const b = r.data.data.banner; if (b) { const c = JSON.parse(localStorage.getItem('closed_global_banner') || '{}'); if (c.expiresAt === b.expiresAt) return; setBanner(b); setIsVisible(true) } } catch (_) {} })() }, []);
  const close = () => { setIsVisible(false); if (banner) localStorage.setItem('closed_global_banner', JSON.stringify({ expiresAt: banner.expiresAt })) };
  if (!isVisible || !banner) return null;
  const s = { info: 'bg-primary/10 border-primary/30 text-primary', warning: 'bg-amber-900/30 border-amber-700/50 text-amber-400', error: 'bg-trading-down/10 border-trading-down/30 text-trading-down' }
  const i = { info: <Info className="w-4 h-4 text-primary" />, warning: <AlertTriangle className="w-4 h-4 text-amber-400" />, error: <AlertCircle className="w-4 h-4 text-trading-down" /> }
  return (
    <div className={`w-full border-b ${s[banner.type] || s.info}`}>
      <div className="mx-auto max-w-[1440px] flex items-center justify-between gap-3 px-5 sm:px-8 py-2"><div className="flex items-center gap-2">{i[banner.type] || i.info}<span className="text-sm font-medium">{banner.message}</span></div><button onClick={close} className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"><X className="w-3.5 h-3.5 opacity-70 hover:opacity-100" /></button></div>
    </div>
  )
}
