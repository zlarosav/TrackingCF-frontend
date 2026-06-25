import { ResourceGrid } from "@/components/ResourceGrid"
import { BookOpen, Code, Trophy, Calendar, Globe } from 'lucide-react'

const guidesAndTools = [
  { title: "CP Handbook (ES)", description: "Traducción del libro de Antti Laaksonen, la mejor introducción al CP en español.", pdfUrl: "https://github.com/zlarosav/cphb-es/blob/main/book.pdf", repoUrl: "https://github.com/zlarosav/cphb-es", extraLink: { url: "https://cses.fi/book/book.pdf", label: "Original EN" }, icon: <BookOpen className="h-5 w-5 text-red-500" />, tags: ["Libro","PDF","Español"] },
  { title: "Striver's A2Z DSA Sheet", description: "Hoja de ruta completa para aprender DSA desde cero a avanzado.", url: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z", icon: <BookOpen className="h-5 w-5 text-orange-500" />, tags: ["Roadmap","DSA","Curso"] },
  { title: "CSES Problem Set", description: "Colección clásica de problemas que cubre todas las técnicas de CP.", url: "https://cses.fi/problemset", icon: <Code className="h-5 w-5 text-yellow-500" />, tags: ["Problemas","Entrenamiento"] },
  { title: "CP-Algorithms", description: "La biblia de algoritmos con explicaciones detalladas e implementaciones.", url: "https://cp-algorithms.com", icon: <Code className="h-5 w-5 text-green-500" />, tags: ["Teoría","Algoritmos","C++"] },
  { title: "USACO Guide", description: "Guía estructurada para aprender CP desde cero hasta nivel avanzado.", url: "https://usaco.guide", icon: <BookOpen className="h-5 w-5 text-purple-500" />, tags: ["Guía","Curriculum","USACO"] },
  { title: "VJudge", description: "Agrega problemas de múltiples jueces para crear concursos personalizados.", url: "https://vjudge.net/", icon: <Trophy className="h-5 w-5 text-indigo-500" />, tags: ["Virtual Judge","Contests"] },
  { title: "CLIST", description: "Calendario de todos los contests de programación (CF, AtCoder, CodeChef, etc).", url: "https://clist.by/", icon: <Calendar className="h-5 w-5 text-blue-400" />, tags: ["Calendario","Stats"] },
  { title: "AtCoder Problems", description: "Visualiza tu progreso y dificultad de problemas en AtCoder.", url: "https://kenkoooo.com/atcoder/", icon: <Globe className="h-5 w-5 text-yellow-600" />, tags: ["AtCoder","Tracking"] },
]

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-10 animate-fade-in">
      <div className="space-y-1.5"><h1 className="text-2xl font-black tracking-tight">Recursos</h1><p className="text-sm text-muted-foreground max-w-2xl">Herramientas y materiales curados para mejorar en programación competitiva.</p></div>
      <ResourceGrid items={guidesAndTools} />
    </div>
  )
}
