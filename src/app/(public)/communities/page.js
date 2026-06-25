'use client'
import { ResourceGrid } from "@/components/ResourceGrid"

const communities = [
  { title: "CPC UNJFSC", description: "Club de Programación Competitiva de la UNJFSC (Huacho).", url: "https://www.facebook.com/cpcunjfsc", image: "/cpcunjfsc.jpg", tags: ["Perú","Universidad","Huacho"] },
  { title: "GPC UPC", description: "Grupo de Programación Competitiva de la UPC (Lima).", url: "https://www.facebook.com/gpcupc", image: "/gpcupc.jpg", tags: ["Perú","Universidad","Lima"] },
  { title: "CPC UTEC", description: "Club de Programación Competitiva de la UTEC (Lima).", url: "https://www.facebook.com/CPC.UTEC", image: "/cpcutec.jpg", tags: ["Perú","Universidad","Lima"] },
  { title: "Coder Bloom", description: "Comunidad peruana de programación con entrenamiento y eventos.", url: "https://www.facebook.com/coderbloom", image: "/coderbloom.jpg", tags: ["Perú","Comunidad","Training"] },
]

export default function CommunitiesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-10 animate-fade-in">
      <div className="space-y-1.5"><h1 className="text-2xl font-black tracking-tight">Comunidades</h1><p className="text-sm text-muted-foreground">Grupos y clubes para aprender y entrenar con otros.</p></div>
      <ResourceGrid items={communities} />
    </div>
  )
}
