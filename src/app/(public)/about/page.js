'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Github, Trophy, Calendar, Code, Heart } from 'lucide-react'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'

export default function AboutPage() {
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await apiClient.getUser('zlarosav')
        if (response.success) {
          setCreator(response.data)
        }
      } catch (error) {
        console.error('Error fetching creator:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCreator()
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Introduction Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Acerca de TrackingCF</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Una plataforma diseñada para potenciar tu entrenamiento en Codeforces mediante el seguimiento de rachas, 
          análisis de progreso y visualización de estadísticas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Creator & Open Source */}
        <div className="space-y-6">
          {/* Creator Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Sobre el Creador</CardTitle>
              <CardDescription>Desarrollado por zlarosav</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ) : creator ? (
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-muted">
                      {creator.avatar_url ? (
                        <Image
                          src={creator.avatar_url}
                          alt="zlarosav"
                          width={80}
                          height={80}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-2xl">Z</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link href="/user/zlarosav" className={`text-xl font-bold hover:underline ${getRatingColorClass(creator.rating)}`}>
                          {creator.handle}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{creator.rank || 'Unrated'}</Badge>
                          {creator.rating && <span className="font-mono text-sm">{creator.rating}</span>}
                        </div>
                      </div>
                      <StreakBadge streak={creator.current_streak} isActive={creator.streak_active} />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <a 
                        href="https://github.com/zlarosav" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Github className="mr-1 h-4 w-4" />
                        Github
                      </a>
                      <a 
                        href="https://codeforces.com/profile/zlarosav" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Codeforces
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No se pudo cargar la información del perfil.</p>
                  <a 
                    href="https://codeforces.com/profile/zlarosav" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ver en Codeforces
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Open Source Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Open Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Este proyecto es de código abierto. Puedes hacer contribuciones y hacer fork para desplegarlo con tus propios usuarios.
              </p>
              <div className="space-y-3">
                <a 
                  href="https://github.com/zlarosav/TrackingCF-frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5" />
                    <span className="font-medium">Frontend Repository</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a 
                  href="https://github.com/zlarosav/TrackingCF-backend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5" />
                    <span className="font-medium">Backend Repository</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: About Info & Tech */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>¿Qué es TrackingCF?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                TrackingCF nace de la necesidad de mantener la constancia en el Competitive Programming. 
                La plataforma gamifica tu entrenamiento diario ayudándote a mantener rachas de problemas resueltos.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seguimiento automático de rachas diarias</li>
                <li>Visualización de tu progreso en los últimos 7 días</li>
                <li>Historial de problemas resueltos con filtros avanzados</li>
                <li>Tabla de clasificación en tiempo real</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tecnologías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Next.js 14', 'React', 'Tailwind CSS', 'shadcn/ui', 'Node.js', 'Express', 'MySQL', 'Puppeteer', 'Recharts'].map((tech) => (
                  <Badge key={tech} variant="outline" className="text-sm py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
