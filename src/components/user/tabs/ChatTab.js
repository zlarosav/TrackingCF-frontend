'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, RefreshCcw, Bot, ChevronUp, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function ChatTab({ handle }) {
  const [messages, setMessages] = useState([]); const [input, setInput] = useState(''); const [loading, setLoading] = useState(false); const [sessionId, setSessionId] = useState(null); const [showSuggestions, setShowSuggestions] = useState(true)
  useEffect(() => {
    let sid = localStorage.getItem(`chat_session_${handle}`)
    if (!sid) { sid = Math.random().toString(36).substring(7); localStorage.setItem(`chat_session_${handle}`, sid) }
    setSessionId(sid); fetchHistory(sid)
  }, [handle])

  const fetchHistory = async (sid) => {
    if (!sid) return; try { const r = await fetch(`${API_URL}/chat/history/${sid}`); const d = await r.json(); if (d.success) { setMessages(d.history.map(m => ({ role: m.role, content: m.message }))); if (!d.history.length) setMessages([{ role: 'model', content: `¡Hola! Puedo analizar el perfil de **${handle}**. ¿En qué te ayudo?` }]) } } catch (_) {}
  }
  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return; const msg = input; setInput(''); setMessages(p => [...p, { role: 'user', content: msg }]); setLoading(true)
    try { const r = await fetch(`${API_URL}/chat/message`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, handle, message: msg }) }); const d = await r.json(); setMessages(p => [...p, { role: 'model', content: d.success ? d.response : '❌ ' + (d.error || 'Error') }]) } catch (_) { setMessages(p => [...p, { role: 'model', content: '❌ Error de conexión' }]) } finally { setLoading(false) }
  }
  const handleReset = async () => {
    if (!confirm('¿Borrar conversación?')) return; try { setLoading(true); const r = await fetch(`${API_URL}/chat/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) }); const d = await r.json(); if (d.success) { const ns = d.newSessionId || Math.random().toString(36).substring(7); setSessionId(ns); localStorage.setItem(`chat_session_${handle}`, ns); setMessages([{ role: 'model', content: `¡Hola! Puedo analizar el perfil de **${handle}**. ¿En qué te ayudo?` }]) } } catch (_) {} finally { setLoading(false) }
  }

  return (
    <div className="flex h-[550px] flex-col overflow-hidden rounded-lg border border-border/30 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/20 bg-muted/10 px-4 py-2.5">
        <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/40"><Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div><span className="text-sm font-semibold">TrackingCF AI</span></div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs gap-1.5 text-muted-foreground"><RefreshCcw className="h-3.5 w-3.5" />Reiniciar</Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/40"><Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /></div>}
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-muted/30 border border-border/20 rounded-tl-sm'}`}>
              {msg.role === 'model' ? <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-code:before:content-none prose-code:after:content-none"><ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{msg.content}</ReactMarkdown></div>
                : <div className="whitespace-pre-wrap break-words">{msg.content}</div>}
            </div>
          </div>
        ))}
        {loading && <div className="flex gap-2 items-center"><div className="h-7 w-7 rounded-md bg-indigo-100 dark:bg-indigo-900/40 animate-pulse" /><div className="flex items-center gap-1 rounded-xl rounded-tl-sm bg-muted/30 px-3.5 py-2.5 border border-border/20"><span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:0ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:150ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:300ms]" /></div></div>}
      </div>
      {showSuggestions && messages.length <= 2 && (
        <div className="border-t border-border/20 bg-muted/5 px-4 pt-3 pb-1.5">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {["Analiza su perfil 📊", "¿Cómo mejorar su rating? 🚀", "Compáralo con Top 1 🏆"].map((text, i) => (
              <button key={i} onClick={() => setInput(text)} className="whitespace-nowrap rounded-full border border-border/30 bg-background px-3 py-1 text-xs text-muted-foreground hover:border-indigo-200 hover:text-foreground">{text}</button>
            ))}
          </div>
        </div>
      )}
      <div className="border-t border-border/20 bg-background px-4 py-3">
        <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => setShowSuggestions(!showSuggestions)} className="h-8 w-8 text-muted-foreground shrink-0">{showSuggestions ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}</Button>
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder={`Pregunta sobre ${handle}...`} disabled={loading} className="flex-1 h-8 text-sm border-border/30 focus-visible:ring-indigo-500/30" />
          <Button type="submit" disabled={loading || !input.trim()} size="icon" className="h-8 w-8 shrink-0"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  )
}
