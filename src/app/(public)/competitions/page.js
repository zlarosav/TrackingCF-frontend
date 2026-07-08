'use client'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Trophy, Medal, Users, Globe } from 'lucide-react'

const competitions = [
  { title: "ICPC", description: "International Collegiate Programming Contest. La más prestigiosa del mundo.", url: "https://icpc.global/", image: "/icpc.png", scope: "Mundial", type: "Universitario", tags: ["ICPC","Equipos"] },
  { title: "IOI", description: "International Olympiad in Informatics para estudiantes de secundaria.", url: "https://ioinformatics.org/", image: "/ioi.png", scope: "Mundial", type: "Olimpiada", tags: ["Secundaria","Algoritmos"] },
  { title: "CodeVita", description: "Competencia global de TCS con premios y oportunidades laborales.", url: "https://codevita.tcsapps.com/", image: "/codevita.jpg", scope: "Global", type: "TCS", tags: ["TCS","Empleo"] },
  { title: "Codificadas", description: "Competencia de TCS exclusiva para mujeres en Latinoamérica.", url: "https://tcscodificadas.com/", image: "/codificadas.jpg", scope: "Latam", type: "TCS", tags: ["Mujeres","Latinoamérica"] },
  { title: "IEEEXtreme", description: "Competencia global de 24 horas organizada por IEEE.", url: "https://ieeextreme.org/", image: "/ieeextreme.jpg", scope: "Global", type: "24h", tags: ["IEEE","24 horas"] },
  { title: "TPP", description: "Torneo Peruano de Programación. Competencia nacional estilo ICPC.", url: "https://www.facebook.com/TorneoPeruanoDeProgramacion", image: "/tpp.jpg", scope: "Perú", type: "ICPC", tags: ["Nacional","Perú"] },
  { title: "TPPFem", description: "Torneo Peruano de Programación Femenino.", url: "https://www.facebook.com/TPPFem", image: "/tppfem.jpg", scope: "Perú", type: "Femenino", tags: ["Mujeres","Nacional"] },
]

const scopeColors = {
  'Mundial': 'bg-primary/10 text-primary border-primary/30',
  'Global': 'bg-trading-up/10 text-trading-up border-trading-up/30',
  'Latam': 'bg-amber-900/30 text-amber-400 border-amber-700/50',
  'Perú': 'bg-blue-900/30 text-blue-400 border-blue-700/50',
}

export default function CompetitionsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 mb-10 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-caption text-primary font-medium uppercase tracking-wider">
          <Trophy className="h-4 w-4" />
          Eventos
        </div>
        <h1 className="text-display-sm text-on-surface">Competencias</h1>
        <p className="text-body-md text-muted max-w-2xl">Las competencias más importantes a nivel nacional e internacional.</p>
      </div>

      {/* Featured competition — largest card */}
      <Card className="overflow-hidden rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto bg-surface-elevated flex items-center justify-center p-8">
            <img src={competitions[0].image} alt={competitions[0].title} className="h-full w-full object-contain" />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm border ${scopeColors[competitions[0].scope]}`}>{competitions[0].scope}</span>
              <Badge variant="secondary" className="text-[10px]">{competitions[0].type}</Badge>
            </div>
            <h2 className="text-title-lg text-on-surface mb-2">{competitions[0].title}</h2>
            <p className="text-body-md text-muted mb-3">{competitions[0].description}</p>
            <div className="flex flex-wrap gap-1 mb-4">{competitions[0].tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
            <a href={competitions[0].url} target="_blank" rel="noopener noreferrer"><Button size="sm" className="gap-1"><ExternalLink className="h-3.5 w-3.5" />Conoce más</Button></a>
          </div>
        </div>
      </Card>

      {/* Rest of competitions in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {competitions.slice(1).map((c, i) => (
          <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
            className="rounded-xl bg-surface-card overflow-hidden transition-all hover:bg-surface-elevated group border border-hairline/60 hover:border-primary/30">
            <div className="aspect-[4/3] bg-surface-elevated flex items-center justify-center p-6">
              <img src={c.image} alt={c.title} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border ${scopeColors[c.scope]}`}>{c.scope}</span>
                <Badge variant="secondary" className="text-[10px]">{c.type}</Badge>
              </div>
              <h3 className="text-body-md font-semibold text-on-surface">{c.title}</h3>
              <p className="text-body-sm text-muted line-clamp-2">{c.description}</p>
              <div className="flex flex-wrap gap-1 pt-1">{c.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
