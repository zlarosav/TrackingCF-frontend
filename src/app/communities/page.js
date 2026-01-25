'use client'

import { ResourceGrid } from "@/components/ResourceGrid"

const communities = [
  {
    title: "CPC UNJFSC",
    description: "Club de Programación Competitiva de la Universidad Nacional José Faustino Sánchez Carrión.",
    url: "https://www.facebook.com/cpcunjfsc",
    image: "/cpcunjfsc.jpg",
    tags: ["Perú", "Universidad", "Huacho"]
  },
  {
    title: "GPC UPC",
    description: "Grupo de Programación Competitiva de la Universidad Peruana de Ciencias Aplicadas. Entrenan para ICPC y más.",
    url: "https://www.facebook.com/gpcupc",
    image: "/gpcupc.jpg",
    tags: ["Perú", "Universidad", "Lima"]
  },
  {
    title: "CPC UTEC",
    description: "Club de Programación Competitiva de la Universidad de Ingeniería y Tecnología.",
    url: "https://www.facebook.com/CPC.UTEC",
    image: "/cpcutec.jpg",
    tags: ["Perú", "Universidad", "Lima"]
  },
  {
    title: "Coder Bloom",
    description: "Comunidad peruana de programación que ofrece entrenamiento, eventos y networking para programadores competitivos.",
    url: "https://www.facebook.com/coderbloom",
    image: "/coderbloom.jpg",
    tags: ["Perú", "Comunidad", "Training"]
  }
]

export default function CommunitiesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 mb-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Comunidades</h1>
        <p className="text-xl text-muted-foreground">
          Grupos y clubes de estudio donde puedes aprender, compartir y entrenar con otros programadores.
        </p>
      </div>

      <ResourceGrid items={communities} />
    </div>
  )
}
