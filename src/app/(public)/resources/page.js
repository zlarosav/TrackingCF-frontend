import { ResourceGrid } from "@/components/ResourceGrid"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code, Trophy, Calendar, Globe, GraduationCap, Layers, Users } from 'lucide-react'

const guidesAndTools = [
  { title: "CP Handbook (ES)", description: "Traducción del libro de Antti Laaksonen, la mejor introducción al CP en español.", pdfUrl: "https://github.com/zlarosav/cphb-es/blob/main/book.pdf", repoUrl: "https://github.com/zlarosav/cphb-es", extraLink: { url: "https://cses.fi/book/book.pdf", label: "Original EN" }, icon: <BookOpen className="h-5 w-5" />, iconName: "BookOpen", tags: ["Libro","PDF","Español"] },
  { title: "Striver's A2Z DSA Sheet", description: "Hoja de ruta completa para aprender DSA desde cero a avanzado.", url: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z", icon: <Layers className="h-5 w-5" />, tags: ["Roadmap","DSA","Curso"] },
  { title: "CSES Problem Set", description: "Colección clásica de problemas que cubre todas las técnicas de CP.", url: "https://cses.fi/problemset", icon: <Code className="h-5 w-5" />, tags: ["Problemas","Entrenamiento"] },
  { title: "CP-Algorithms", description: "La biblia de algoritmos con explicaciones detalladas e implementaciones.", url: "https://cp-algorithms.com", icon: <GraduationCap className="h-5 w-5" />, tags: ["Teoría","Algoritmos","C++"] },
  { title: "USACO Guide", description: "Guía estructurada para aprender CP desde cero hasta nivel avanzado.", url: "https://usaco.guide", icon: <BookOpen className="h-5 w-5" />, tags: ["Guía","Curriculum","USACO"] },
  { title: "VJudge", description: "Agrega problemas de múltiples jueces para crear concursos personalizados.", url: "https://vjudge.net/", icon: <Globe className="h-5 w-5" />, tags: ["Virtual Judge","Contests"] },
  { title: "CLIST", description: "Calendario de todos los contests de programación (CF, AtCoder, CodeChef, etc).", url: "https://clist.by/", icon: <Calendar className="h-5 w-5" />, tags: ["Calendario","Stats"] },
  { title: "AtCoder Problems", description: "Visualiza tu progreso y dificultad de problemas en AtCoder.", url: "https://kenkoooo.com/atcoder/", icon: <Globe className="h-5 w-5" />, tags: ["AtCoder","Tracking"] },
]

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 mb-10 animate-fade-in">
      {/* Hero band */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-caption text-primary font-medium uppercase tracking-wider">
          <BookOpen className="h-4 w-4" />
          Aprende
        </div>
        <h1 className="text-display-sm text-on-dark">Recursos</h1>
        <p className="text-body-md text-muted max-w-2xl">Herramientas y materiales curados para mejorar en programación competitiva.</p>
      </div>

      {/* Featured + list layout */}
      <ResourceGrid items={guidesAndTools} layout="featured" />
    </div>
  )
}
