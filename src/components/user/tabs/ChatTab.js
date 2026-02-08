'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, RefreshCcw, Bot, ChevronUp, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

// Base URL handling for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function ChatTab({ handle }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)

  // Initialize Session
  useEffect(() => {
    let storedSession = localStorage.getItem(`chat_session_${handle}`)
    if (!storedSession) {
      storedSession = Math.random().toString(36).substring(7)
      localStorage.setItem(`chat_session_${handle}`, storedSession)
    }
    setSessionId(storedSession)
    fetchHistory(storedSession)
  }, [handle])

  // Auto-scroll removed as per user request

  const fetchHistory = async (sid) => {
    if (!sid) return
    try {
      const res = await fetch(`${API_URL}/chat/history/${sid}`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.history.map(msg => ({
          role: msg.role,
          content: msg.message,
          timestamp: msg.timestamp
        })))
        // If history is empty, add welcome message locally
        if (data.history.length === 0) {
            setMessages([{ role: 'model', content: `¡Hola! Soy tu asistente de programación competitiva. Puedo analizar el perfil de **${handle}** y darte consejos o responder preguntas sobre sus estadísticas. ¿En qué te ayudo hoy?` }])
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return

    const userMsg = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          handle,
          message: userMsg
        })
      })
      const data = await res.json()
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'model', content: data.response }])
      } else {
        setMessages(prev => [...prev, { role: 'model', content: '❌ Error: ' + (data.error || 'Algo salió mal') }])
      }
    } catch (err) {
       setMessages(prev => [...prev, { role: 'model', content: '❌ Error de conexión' }])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('¿Seguro que quieres borrar la conversación?')) return
    
    try {
      setLoading(true)
      const res = await fetch(`${API_URL}/chat/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      const data = await res.json()
      if (data.success) {
        const newSessionId = data.newSessionId || Math.random().toString(36).substring(7)
        setSessionId(newSessionId)
        localStorage.setItem(`chat_session_${handle}`, newSessionId)
        
        // Reset to initial gretting
        setMessages([{ role: 'model', content: `¡Hola! Soy tu asistente de programación competitiva. Puedo analizar el perfil de **${handle}**, darte consejos o responder preguntas sobre sus estadísticas. ¿En qué te ayudo hoy?` }])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[800px] flex flex-col border rounded-lg bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">TrackingCF AI</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} title="Reiniciar Chat">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Reiniciar
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted/50 border rounded-tl-sm'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              )}
            </div>

            {/* Removed User Avatar as requested */}
          </div>
        ))}
        {loading && (
           <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0" />
              <div className="h-10 w-24 bg-muted/50 rounded-lg" />
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-4 pt-2 pb-0 bg-background border-t">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              "Analiza su perfil 📊", 
              "¿Cómo puede mejorar su rating? 🚀", 
              "Compáralo con el Top 1 🏆",
              "Dame un resumen de todos los perfiles de TrackingCF 📊"
            ].map((text, i) => (
              <button
                key={i}
                onClick={() => setInput(text)}
                className="whitespace-nowrap px-3 py-1 text-xs border rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`p-4 ${showSuggestions ? 'pt-0 border-t-0' : 'border-t'} bg-background`}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSuggestions(!showSuggestions)} 
            title={showSuggestions ? "Ocultar sugerencias" : "Mostrar sugerencias"}
            className="text-muted-foreground"
          >
            {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Pregunta sobre ${handle}...`}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
