'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Github, Code, Star } from 'lucide-react'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'

export default function AboutPage() {
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiClient.getUser('zlarosav').then(r => { if (r.success) setCreator(r.data) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in mb-10">
      <div className="space-y-1.5"><h1 className="text-2xl font-black tracking-tight">Acerca de TrackingCF</h1><p className="text-sm text-muted-foreground max-w-2xl">Seguimiento de rachas, análisis de progreso y estadísticas para Codeforces.</p></div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-sm">Creador</CardTitle></CardHeader>
            <CardContent className="p-3">
              {loading ? <div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-lg" /><div className="space-y-1.5"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /></div></div>
              : creator ? <div className="flex items-start gap-3">
                  <div className="relative shrink-0"><div className="h-12 w-12 overflow-hidden rounded-lg border-2 border-border"><Image src={creator.avatar_url} alt="zlarosav" width={48} height={48} className="h-full w-full object-cover" unoptimized /></div><div className="absolute -bottom-1.5 -right-1.5"><StreakBadge streak={creator.current_streak} isActive={creator.streak_active} /></div></div>
                  <div><Link href="/user/zlarosav" className={`text-sm font-bold hover:underline ${getRatingColorClass(creator.rating)}`}>{creator.handle}</Link>
                    <div className="flex items-center gap-1.5 mt-0.5"><Badge variant="secondary" className="text-[9px]">{creator.rank || 'Unrated'}</Badge>{creator.rating && <span className="font-mono text-[10px]">{creator.rating}</span>}</div>
                    <div className="flex gap-2 mt-1"><a href="https://github.com/zlarosav" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5"><Github className="h-3 w-3" />GitHub</a><a href="https://codeforces.com/profile/zlarosav" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5"><ExternalLink className="h-3 w-3" />CF</a></div></div>
                </div>
              : <div className="text-center py-3 text-[10px] text-muted-foreground"><p>No se pudo cargar.</p><a href="https://codeforces.com/profile/zlarosav" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Ver en CF</a></div>}
            </CardContent>
          </Card>

          <Card className="border-border/30">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-sm flex items-center gap-1.5"><Code className="h-4 w-4 text-indigo-500" />Open Source</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2">
              <p className="text-[10px] text-muted-foreground">Código abierto. Contribuciones y forks bienvenidos.</p>
              {[{ label: "Frontend", url: "https://github.com/zlarosav/TrackingCF-frontend" }, { label: "Backend", url: "https://github.com/zlarosav/TrackingCF-backend" }].map(r => (
                <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md border border-border/30 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2"><Github className="h-4 w-4" /><span className="text-[11px] font-medium">{r.label}</span></div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-sm">¿Qué es?</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2 text-[11px] text-muted-foreground leading-relaxed">
              <p>TrackingCF gamifica tu entrenamiento diario ayudándote a mantener rachas de problemas resueltos.</p>
              <ul className="space-y-1">{['Seguimiento automático de rachas', 'Progreso en últimos 7 días', 'Filtros avanzados de historial', 'Tabla de clasificación en tiempo real'].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5"><Star className="h-3 w-3 text-indigo-500 mt-0.5 shrink-0" /><span>{item}</span></li>
              ))}</ul>
            </CardContent>
          </Card>

          <Card className="border-border/30">
            <CardHeader className="p-3 pb-1"><CardTitle className="text-sm">Tecnologías</CardTitle></CardHeader>
            <CardContent className="p-3"><div className="flex flex-wrap gap-1.5">{['Next.js 14','React','Tailwind CSS','shadcn/ui','Node.js','Express','MySQL','Puppeteer','Recharts'].map(t => <Badge key={t} variant="outline" className="text-[9px] py-0.5 border-border/30">{t}</Badge>)}</div></CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
