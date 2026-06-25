'use client'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, MapPin, GraduationCap } from 'lucide-react'

const communities = [
  { title: "CPC UNJFSC", description: "Club de Programación Competitiva de la UNJFSC (Huacho).", url: "https://www.facebook.com/cpcunjfsc", image: "/cpcunjfsc.jpg", location: "Huacho", type: "Universidad", tags: ["Perú","UNJFSC"] },
  { title: "GPC UPC", description: "Grupo de Programación Competitiva de la UPC (Lima).", url: "https://www.facebook.com/gpcupc", image: "/gpcupc.jpg", location: "Lima", type: "Universidad", tags: ["Perú","UPC"] },
  { title: "CPC UTEC", description: "Club de Programación Competitiva de la UTEC (Lima).", url: "https://www.facebook.com/CPC.UTEC", image: "/cpcutec.jpg", location: "Lima", type: "Universidad", tags: ["Perú","UTEC"] },
  { title: "Coder Bloom", description: "Comunidad peruana de programación con entrenamiento y eventos.", url: "https://www.facebook.com/coderbloom", image: "/coderbloom.jpg", location: "Perú", type: "Comunidad", tags: ["Entrenamiento","Eventos"] },
]

export default function CommunitiesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 mb-10 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-caption text-primary font-medium uppercase tracking-wider">
          <Users className="h-4 w-4" />
          Comunidades
        </div>
        <h1 className="text-display-sm text-on-dark">Comunidades</h1>
        <p className="text-body-md text-muted max-w-2xl">Grupos y clubes para aprender y entrenar con otros.</p>
      </div>

      {/* Stats bar — trust-badge style */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Clubes', value: communities.length, icon: Users },
          { label: 'Miembros activos', value: '100+', icon: GraduationCap },
          { label: 'Ciudades', value: '3', icon: MapPin },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-3 p-4 rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
            <div>
              <span className="text-number-display text-primary">{value}</span>
              <span className="text-caption text-muted block">{label}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Community cards — trust-badge style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {communities.map((c, i) => (
          <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
            className="rounded-xl bg-surface-card-dark overflow-hidden transition-all hover:bg-surface-elevated-dark group border border-hairline-on-dark/60 hover:border-primary/30">
            <div className="aspect-[16/9] bg-surface-elevated-dark flex items-center justify-center p-6">
              <img src={c.image} alt={c.title} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-title-sm text-on-dark">{c.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-caption text-muted">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.type}</span>
              </div>
              <p className="text-body-sm text-muted">{c.description}</p>
              <div className="flex flex-wrap gap-1 pt-1">{c.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-caption text-primary group-hover:underline">
                  Visitar <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
