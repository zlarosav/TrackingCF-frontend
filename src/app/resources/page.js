import { ResourceGrid } from "@/components/ResourceGrid"
import { BookOpen, FileText, Trophy, Calendar, Code, Globe } from 'lucide-react'

const guidesAndTools = [
  {
    title: "Competitive Programmer's Handbook (ES)",
    description: "Traducción completa al español del libro de Antti Laaksonen. La mejor introducción al CP, ahora en tu idioma.",
    pdfUrl: "https://github.com/zlarosav/cphb-es/blob/main/book.pdf",
    repoUrl: "https://github.com/zlarosav/cphb-es",
    extraLink: {
      url: "https://cses.fi/book/book.pdf",
      label: "Leer en Inglés (Original)"
    },
    icon: <BookOpen className="h-6 w-6 text-red-500" />,
    tags: ["Libro", "PDF", "Español", "Introducción"]
  },
  {
    title: "Striver's A2Z DSA Sheet",
    description: "Una hoja de ruta completa para aprender estructuras de datos y algoritmos desde cero hasta nivel avanzado.",
    url: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z",
    icon: <BookOpen className="h-6 w-6 text-orange-500" />,
    tags: ["Roadmap", "DSA", "Curso Completo"]
  },
  {
    title: "CSES Problem Set",
    description: "Colección clásica de problemas que cubre todas las técnicas importantes de CP.",
    url: "https://cses.fi/problemset",
    icon: <Code className="h-6 w-6 text-yellow-500" />,
    tags: ["Problemas", "Entrenamiento", "Estándar"]
  },
  {
    title: "CP-Algorithms",
    description: "La biblia de algoritmos y estructuras de datos. Explicaciones detalladas con implementaciones en C++.",
    url: "https://cp-algorithms.com",
    icon: <Code className="h-6 w-6 text-green-500" />,
    tags: ["Teoría", "Algoritmos", "C++"]
  },
  {
    title: "USACO Guide",
    description: "Guía completa y estructurada para aprender programación competitiva desde cero hasta nivel avanzado.",
    url: "https://usaco.guide",
    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
    tags: ["Guía", "Curriculum", "USACO"]
  },
  {
    title: "VJudge",
    description: "Plataforma virtual que agrega problemas de múltiples jueces online para crear y hospedar concursos personalizados.",
    url: "https://vjudge.net/",
    icon: <Trophy className="h-6 w-6 text-indigo-500" />,
    tags: ["Virtual Judge", "Contests", "Práctica"]
  },
  {
    title: "CLIST",
    description: "La mejor plataforma para ver el calendario de todos los contests de programación (CF, AtCoder, CodeChef, etc).",
    url: "https://clist.by/",
    icon: <Calendar className="h-6 w-6 text-blue-400" />,
    tags: ["Calendario", "Stats", "Herramienta"]
  },
  {
    title: "AtCoder Problems (Kenkoooo)",
    description: "Herramienta indispensable para AtCoder. Visualiza tu progreso, dificultad de problemas y recomendaciones.",
    url: "https://kenkoooo.com/atcoder/",
    icon: <Globe className="h-6 w-6 text-yellow-600" />,
    tags: ["AtCoder", "Tracking", "Herramienta"]
  }
]

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 mb-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Recursos Prácticos</h1>
        <p className="text-xl text-muted-foreground">
          Una colección curada de las mejores herramientas y materiales para mejorar en programación competitiva.
        </p>
      </div>

      <ResourceGrid items={guidesAndTools} />
    </div>
  )
}
