'use client';
import { useState } from 'react';
import axios from 'axios';
import { Send, Bell, Link as LinkIcon } from 'lucide-react';

export function CreateNotification({ token, onSuccess }) {
  const [message, setMessage] = useState(''); const [type, setType] = useState('SYSTEM'); const [link, setLink] = useState(''); const [expireHours, setExpireHours] = useState(24); const [loading, setLoading] = useState(false);
  const API = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const submit = async (e) => { e.preventDefault(); if (!message) return; setLoading(true); try { await axios.post(`${API()}/notifications`, { message, type, link, expireHours }, { headers: { Authorization: `Bearer ${token}` } }); setMessage(''); setLink(''); if (onSuccess) onSuccess() } catch (e) { alert(e.response?.data?.error || 'Error') } finally { setLoading(false) } };
  return (
    <div className="rounded-lg border border-border/30 bg-card p-4"><h3 className="text-sm font-bold mb-3 flex items-center gap-1.5"><Bell className="w-5 h-5 text-purple-500" />Crear Notificación</h3>
      <form onSubmit={submit} className="space-y-3"><textarea placeholder="Mensaje..." className="w-full border border-border/40 bg-background px-3 py-2.5 rounded-md text-sm focus:outline-none focus:border-indigo-500/50 min-h-[70px]" value={message} onChange={e => setMessage(e.target.value)} required />
        <div className="grid grid-cols-3 gap-2"><select value={type} onChange={e => setType(e.target.value)} className="border border-border/40 bg-background px-3 py-2 rounded-md text-sm"><option value="SYSTEM">📢 Sistema</option><option value="CONTEST">🏆 Contest</option><option value="RANK_UP">🚀 Rank Up</option><option value="WARNING">⚠️ Warning</option></select>
        <input type="text" placeholder="Link (opcional)" className="border border-border/40 bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:border-indigo-500/50" value={link} onChange={e => setLink(e.target.value)} />
        <input type="number" min="1" value={expireHours} onChange={e => setExpireHours(Number(e.target.value))} className="border border-border/40 bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:border-indigo-500/50" /></div>
        <div className="flex justify-end"><button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5">{loading ? '...' : <><Send className="w-4 h-4" />Enviar</>}</button></div>
      </form>
    </div>
  )
}
