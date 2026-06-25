'use client'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingUp, Award } from 'lucide-react'

const judges = [
  { title: "Codeforces", description: "La plataforma principal para concursos y problemas de CP.", url: "https://codeforces.com", icon: "/codeforces.svg", stat: "19,000+ users", tags: ["Juez Online","Concursos","Comunidad"] },
  { title: "LeetCode", description: "Plataforma líder para entrevistas técnicas con enorme colección de algoritmos.", url: "https://leetcode.com", icon: "/leetcode.svg", stat: "5,000+ problems", tags: ["Entrevistas","Algoritmos"] },
  { title: "AtCoder", description: "Juez japonés con problemas de alta calidad y concursos regulares (ABC, ARC, AGC).", url: "https://atcoder.jp", icon: "/atcoder.svg", stat: "10,000+ problems", tags: ["Japón","Math","Calidad"] },
  { title: "CodeChef", description: "Plataforma india con concursos mensuales y gran comunidad educativa.", url: "https://www.codechef.com", icon: "/codechef.svg", stat: "15,000+ problems", tags: ["India","Educación"] },
  { title: "USACO", description: "USA Computing Olympiad. Camino a la IOI para estudiantes.", url: "https://usaco.org/", icon: "/usaco.png", stat: "5+ divisions", tags: ["USA","Olimpiada"] },
  { title: "Blitzcoding", description: "Plataforma emergente para práctica rápida en español.", url: "https://blitzcoding.com", icon: "/blitzcoding.svg", stat: "En crecimiento", tags: ["Práctica","Speed","Español"] },
]

export default function JudgesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 mb-10 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-caption text-primary font-medium uppercase tracking-wider">
          <Award className="h-4 w-4" />
          Plataformas
        </div>
        <h1 className="text-display-sm text-on-dark">Jueces Virtuales</h1>
        <p className="text-body-md text-muted max-w-2xl">Plataformas líderes para practicar CP y participar en concursos.</p>
      </div>

      {/* Horizontal platform cards — Binance trader-row style */}
      <div className="space-y-3">
        {judges.map((j, i) => (
          <a key={i} href={j.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-5 rounded-xl bg-surface-card-dark p-4 transition-all hover:bg-surface-elevated-dark group border border-hairline-on-dark/60 hover:border-primary/30">
            {/* Icon */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-elevated-dark p-3">
              <img src={j.icon} alt={j.title} className="h-full w-full object-contain" onError={e => e.target.style.display = 'none'} />
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-title-sm text-on-dark">{j.title}</h3>
                <div className="flex items-center gap-1 text-caption text-trading-up">
                  <TrendingUp className="h-3 w-3" />
                  <span>{j.stat}</span>
                </div>
              </div>
              <p className="text-body-sm text-muted mt-0.5 line-clamp-1">{j.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {j.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
              </div>
            </div>
            {/* Action */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-body-sm text-muted group-hover:text-primary transition-colors hidden sm:inline">Visitar</span>
              <ExternalLink className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
