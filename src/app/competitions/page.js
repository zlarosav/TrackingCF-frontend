'use client'

import { ResourceGrid } from "@/components/ResourceGrid"

const prestigiousCompetitions = [
  {
    title: "ICPC",
    description: "International Collegiate Programming Contest. La competencia universitaria de programación más prestigiosa del mundo.",
    url: "https://icpc.global/",
    image: "/icpc.png",
    tags: ["Universitario", "Mundial", "Equipos"]
  },
  {
    title: "IOI",
    description: "International Olympiad in Informatics. Olimpiada mundial de informática para estudiantes de secundaria.",
    url: "https://ioinformatics.org/",
    image: "/ioi.png",
    tags: ["Olimpiada", "Secundaria", "Mundial"]
  },
  {
    title: "CodeVita",
    description: "Competencia global de programación de TCS. Una de las más grandes del mundo con premios y oportunidades laborales.",
    url: "https://codevita.tcsapps.com/",
    image: "/codevita.jpg",
    tags: ["Mundial", "TCS", "Empleo"]
  },
  {
    title: "Codificadas",
    description: "Competencia de TCS exclusiva para mujeres en Latinoamérica. Impulsa la inclusión femenina en IT y STEM.",
    url: "https://tcscodificadas.com/",
    image: "/codificadas.jpg",
    tags: ["Latinoamérica", "Mujeres", "TCS"]
  },
  {
    title: "IEEEXtreme",
    description: "Competencia global de 24 horas organizada por IEEE para estudiantes universitarios.",
    url: "https://ieeextreme.org/",
    image: "/ieeextreme.jpg",
    tags: ["IEEE", "24 horas", "Universitario"]
  },
  {
    title: "TPP",
    description: "Torneo Peruano de Programación. Competencia nacional estilo ICPC que reúne a los mejores equipos del país.",
    url: "https://www.facebook.com/TorneoPeruanoDeProgramacion",
    image: "/tpp.jpg",
    tags: ["Perú", "Nacional", "ICPC-style"]
  },
  {
    title: "TPPFem",
    description: "Torneo Peruano de Programación Femenino. Impulsa la participación de mujeres en programación competitiva.",
    url: "https://www.facebook.com/TPPFem",
    image: "/tppfem.jpg",
    tags: ["Perú", "Mujeres", "Nacional"]
  }
]

export default function CompetitionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 mb-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Competencias de Alto Prestigio</h1>
        <p className="text-xl text-muted-foreground">
          Las competencias más importantes a nivel nacional e internacional para poner a prueba tus habilidades.
        </p>
      </div>

      <ResourceGrid items={prestigiousCompetitions} />
    </div>
  )
}
