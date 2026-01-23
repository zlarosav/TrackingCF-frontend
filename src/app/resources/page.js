import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Code, Trophy, Video, FileText, Globe } from 'lucide-react'

const resources = [
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
    icon: <FileText className="h-6 w-6 text-orange-500" />,
    tags: ["Roadmap", "DSA", "Curso Completo"]
  },
  {
    title: "Codeforces",
    description: "La plataforma principal para concursos y problemas de programación competitiva.",
    url: "https://codeforces.com",
    icon: <Code className="h-6 w-6 text-blue-500" />,
    tags: ["Juez Online", "Concursos", "Comunidad"]
  },
  {
    title: "CP-Algorithms",
    description: "La biblia de algoritmos y estructuras de datos. Explicaciones detalladas con implementaciones en C++.",
    url: "https://cp-algorithms.com",
    icon: <BookOpen className="h-6 w-6 text-green-500" />,
    tags: ["Teoría", "Algoritmos", "C++"]
  },
  {
    title: "CSES Problem Set",
    description: "Colección clásica de problemas que cubre todas las técnicas importantes de CP.",
    url: "https://cses.fi/problemset",
    icon: <Trophy className="h-6 w-6 text-yellow-500" />,
    tags: ["Problemas", "Entrenamiento", "Estándar"]
  },
  {
    title: "USACO Guide",
    description: "Guía completa y estructurada para aprender programación competitiva desde cero hasta nivel avanzado.",
    url: "https://usaco.guide",
    icon: <BookOpen className="h-6 w-6 text-purple-500" />,
    tags: ["Guía", "Curriculum", "USACO"]
  }
]

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Recursos Prácticos</h1>
        <p className="text-xl text-muted-foreground">
          Una colección curada de las mejores herramientas y materiales para mejorar en programación competitiva.
        </p>
      </div>

      <div className="block md:columns-2 gap-6">
        {resources.map((resource, index) => (
          <div key={index} className="break-inside-avoid mb-6">
            <Card className="flex flex-col transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {resource.icon}
                    </div>
                    <CardTitle className="text-xl leading-tight">{resource.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  {resource.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-0 pb-6 items-start">
                {/* Primary Actions */}
                <div className="flex gap-2 w-full">
                  {resource.url && (
                      <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                      >
                      <Button variant="default" className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Visitar
                      </Button>
                      </a>
                  )}
                  {resource.pdfUrl && (
                      <a
                      href={resource.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                      >
                      <Button variant="default" className="w-full gap-2">
                          <FileText className="h-4 w-4" />
                          Ver PDF
                      </Button>
                      </a>
                  )}
                  {resource.repoUrl && (
                      <a
                      href={resource.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      >
                      <Button variant="outline" size="icon" title="Ver Repositorio">
                          <Code className="h-4 w-4" />
                      </Button>
                      </a>
                  )}
                </div>
                
                {/* Extra Links (secondary) */}
                {resource.extraLink && (
                   <a
                   href={resource.extraLink.url}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 mt-1 transition-colors"
                   >
                   <Globe className="h-3 w-3" />
                   {resource.extraLink.label}
                   </a>
                )}
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
