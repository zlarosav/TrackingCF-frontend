'use client'
import { ResourceGrid } from "@/components/ResourceGrid"

const judges = [
  { title: "Codeforces", description: "La plataforma principal para concursos y problemas de CP.", url: "https://codeforces.com", icon: <img src="/codeforces.svg" alt="CF" className="h-full w-full object-contain" />, tags: ["Juez Online","Concursos","Comunidad"] },
  { title: "LeetCode", description: "Plataforma líder para entrevistas técnicas con enorme colección de algoritmos.", url: "https://leetcode.com", icon: <img src="/leetcode.svg" alt="LC" className="h-full w-full object-contain" />, tags: ["Entrevistas","Algoritmos"] },
  { title: "AtCoder", description: "Juez japonés con problemas de alta calidad y concursos regulares (ABC, ARC, AGC).", url: "https://atcoder.jp", icon: <img src="/atcoder.svg" alt="AC" className="h-full w-full object-contain" />, tags: ["Japón","Math","Calidad"] },
  { title: "CodeChef", description: "Plataforma india con concursos mensuales y gran comunidad educativa.", url: "https://www.codechef.com", icon: <img src="/codechef.svg" alt="CC" className="h-full w-full object-contain" />, tags: ["India","Educación"] },
  { title: "USACO", description: "USA Computing Olympiad. Camino a la IOI para estudiantes.", url: "https://usaco.org/", icon: <img src="/usaco.png" alt="USACO" className="h-full w-full object-contain" />, tags: ["USA","Olimpiada"] },
  { title: "Blitzcoding", description: "Plataforma emergente para práctica rápida en español.", url: "https://blitzcoding.com", icon: <img src="/blitzcoding.svg" alt="Blitz" className="h-full w-full object-contain" />, tags: ["Práctica","Speed","Español"] },
]

export default function JudgesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-10 animate-fade-in">
      <div className="space-y-1.5"><h1 className="text-2xl font-black tracking-tight">Jueces Virtuales</h1><p className="text-sm text-muted-foreground">Plataformas líderes para practicar CP y participar en concursos.</p></div>
      <ResourceGrid items={judges} />
    </div>
  )
}
