'use client'

import { ResourceGrid } from "@/components/ResourceGrid"
import { Trophy } from 'lucide-react'

const virtualJudges = [
  {
    title: "Codeforces",
    description: "La plataforma principal para concursos y problemas de programación competitiva.",
    url: "https://codeforces.com",
    icon: <img src="/codeforces.svg" alt="Codeforces" className="h-full w-full object-contain" />,
    tags: ["Juez Online", "Concursos", "Comunidad"]
  },
  {
    title: "LeetCode",
    description: "Plataforma líder para entrevistas técnicas. Enorme colección de problemas de algoritmos y estructuras.",
    url: "https://leetcode.com",
    icon: <img src="/leetcode.svg" alt="LeetCode" className="h-full w-full object-contain" />,
    tags: ["Entrevistas", "Algoritmos", "Juez Online"]
  },
  {
    title: "AtCoder",
    description: "Juez japonés conocido por sus problemas de alta calidad y concursos regulares (ABC, ARC, AGC).",
    url: "https://atcoder.jp",
    icon: <img src="/atcoder.svg" alt="AtCoder" className="h-full w-full object-contain" />, 
    tags: ["Japón", "Math", "Calidad"]
  },
  {
    title: "CodeChef",
    description: "Plataforma india con concursos mensuales y una gran comunidad educativa.",
    url: "https://www.codechef.com",
    icon: <img src="/codechef.svg" alt="CodeChef" className="h-full w-full object-contain" />,
    tags: ["India", "Educación", "Concursos"]
  },
  {
    title: "USACO",
    description: "USA Computing Olympiad. Competencia prestigiosa para estudiantes de secundaria, camino a la IOI.",
    url: "https://usaco.org/",
    icon: <img src="/usaco.png" alt="USACO" className="h-full w-full object-contain" />,
    tags: ["USA", "Secundaria", "Olimpiada"]
  },
  {
    title: "Blitzcoding",
    description: "Plataforma emergente para práctica de coding y concursos rápidos especializada en español.",
    url: "https://blitzcoding.com",
    icon: <img src="/blitzcoding.svg" alt="Blitzcoding" className="h-full w-full object-contain" />,
    tags: ["Práctica", "Speed", "Español"]
  }
]

export default function JudgesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 mb-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Jueces Virtuales</h1>
        <p className="text-xl text-muted-foreground">
          Plataformas líderes para practicar programación competitiva y participar en concursos online.
        </p>
      </div>

      <ResourceGrid items={virtualJudges} />
    </div>
  )
}
