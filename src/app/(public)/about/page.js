'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Code, ExternalLink, Github, Star, User } from 'lucide-react'
import StreakBadge from '@/components/StreakBadge'
import { getRatingColorClass } from '@/lib/utils'

const people = {
  creator: {
    title: 'Creador',
    handle: 'zlarosav',
    github: 'https://github.com/zlarosav',
  },
  contributor: {
    title: 'Colaboradores',
    handle: 'zxpty',
  },
}

function CodeforcesButton({ handle }) {
  return (
    <a
      href={`https://codeforces.com/profile/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-surface-elevated px-3 text-body-sm font-semibold text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
    >
      <Image src="/codeforces.svg" alt="" width={14} height={14} className="h-3.5 w-3.5" />
      Codeforces
    </a>
  )
}

function PersonCard({ person, user, loading }) {
  const handle = person.handle

  return (
    <Card className="rounded-xl p-5 sm:p-6">
      <CardTitle className="text-title-sm text-on-surface mb-4">{person.title}</CardTitle>
      {loading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      ) : user ? (
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {user.avatar_url ? (
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-surface-elevated">
                <Image src={user.avatar_url} alt={handle} width={64} height={64} className="h-full w-full object-cover" unoptimized />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated">
                <User className="h-7 w-7 text-muted" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <StreakBadge streak={user.current_streak} isActive={user.streak_active} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Link href={`/user/${handle}`} className={`text-title-sm hover:underline ${getRatingColorClass(user.rating)}`}>
              {user.handle}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="text-caption">{user.rank || 'Unrated'}</Badge>
              {user.rating && <span className="font-mono text-body-sm text-primary">{user.rating}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.github && (
                <a
                  href={person.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-surface-elevated px-3 text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-elevated/80 hover:text-primary"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              <CodeforcesButton handle={handle} />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-4 text-body-sm text-muted">
          <p>No se pudo cargar.</p>
          <div className="mt-3">
            <CodeforcesButton handle={handle} />
          </div>
        </div>
      )}
    </Card>
  )
}

export default function AboutPage() {
  const [creator, setCreator] = useState(null)
  const [contributor, setContributor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      apiClient.getUser(people.creator.handle),
      apiClient.getUser(people.contributor.handle),
    ])
      .then(([creatorRes, contributorRes]) => {
        if (creatorRes.status === 'fulfilled' && creatorRes.value.success) setCreator(creatorRes.value.data)
        if (contributorRes.status === 'fulfilled' && contributorRes.value.success) setContributor(contributorRes.value.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in mb-12">
      <div className="space-y-2">
        <h1 className="text-display-md text-on-surface">Acerca de TrackingCF</h1>
        <p className="text-title-sm font-normal text-muted max-w-3xl">Seguimiento de rachas, análisis de progreso y estadísticas para Codeforces.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-5">
          <PersonCard person={people.creator} user={creator} loading={loading} />
          <PersonCard person={people.contributor} user={contributor} loading={loading} />

          <Card className="rounded-xl p-5 sm:p-6">
            <CardTitle className="text-title-sm text-on-surface flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-primary" />
              Open Source
            </CardTitle>
            <div className="space-y-3">
              <p className="text-body-md text-muted">Código abierto. Contribuciones y forks bienvenidos.</p>
              {[{ label: "Frontend", url: "https://github.com/zlarosav/TrackingCF-frontend" }, { label: "Backend", url: "https://github.com/zlarosav/TrackingCF-backend" }].map(r => (
                <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-md bg-surface-elevated p-3 transition-colors hover:bg-surface-elevated/80">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted" />
                    <span className="text-body-md font-medium">{r.label}</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted" />
                </a>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-xl p-5 sm:p-6">
            <CardTitle className="text-title-sm text-on-surface mb-4">¿Qué es?</CardTitle>
            <div className="space-y-3 text-body-md text-muted leading-relaxed">
              <p>TrackingCF gamifica tu entrenamiento diario ayudándote a mantener rachas de problemas resueltos.</p>
              <ul className="space-y-2">{['Seguimiento automático de rachas', 'Progreso en últimos 7 días', 'Filtros avanzados de historial', 'Tabla de clasificación en tiempo real'].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}</ul>
            </div>
          </Card>

          <Card className="rounded-xl p-5 sm:p-6">
            <CardTitle className="text-title-sm text-on-surface mb-4">Tecnologías</CardTitle>
            <div className="flex flex-wrap gap-2">
              {['Next.js 14','React','Tailwind CSS','Node.js','Express','MySQL','Puppeteer','Recharts'].map(t => (
                <Badge key={t} variant="secondary" className="text-caption px-2 py-1">{t}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
