'use client'
import { ResourceGrid } from "@/components/ResourceGrid"

const competitions = [
  { title: "ICPC", description: "International Collegiate Programming Contest. La más prestigiosa del mundo.", url: "https://icpc.global/", image: "/icpc.png", tags: ["Universitario","Mundial","Equipos"] },
  { title: "IOI", description: "International Olympiad in Informatics para estudiantes de secundaria.", url: "https://ioinformatics.org/", image: "/ioi.png", tags: ["Olimpiada","Secundaria","Mundial"] },
  { title: "CodeVita", description: "Competencia global de TCS con premios y oportunidades laborales.", url: "https://codevita.tcsapps.com/", image: "/codevita.jpg", tags: ["Mundial","TCS","Empleo"] },
  { title: "Codificadas", description: "Competencia de TCS exclusiva para mujeres en Latinoamérica.", url: "https://tcscodificadas.com/", image: "/codificadas.jpg", tags: ["Latinoamérica","Mujeres","TCS"] },
  { title: "IEEEXtreme", description: "Competencia global de 24 horas organizada por IEEE.", url: "https://ieeextreme.org/", image: "/ieeextreme.jpg", tags: ["IEEE","24h","Universitario"] },
  { title: "TPP", description: "Torneo Peruano de Programación. Competencia nacional estilo ICPC.", url: "https://www.facebook.com/TorneoPeruanoDeProgramacion", image: "/tpp.jpg", tags: ["Perú","Nacional","ICPC"] },
  { title: "TPPFem", description: "Torneo Peruano de Programación Femenino.", url: "https://www.facebook.com/TPPFem", image: "/tppfem.jpg", tags: ["Perú","Mujeres","Nacional"] },
]

export default function CompetitionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-10 animate-fade-in">
      <div className="space-y-1.5"><h1 className="text-2xl font-black tracking-tight">Competencias</h1><p className="text-sm text-muted-foreground">Las competencias más importantes a nivel nacional e internacional.</p></div>
      <ResourceGrid items={competitions} />
    </div>
  )
}
