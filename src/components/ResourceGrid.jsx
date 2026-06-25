'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, FileText, Globe } from 'lucide-react'

export function ResourceGrid({ title, items }) {
  if (!items?.length) return null
  return (
    <section className="space-y-4">{title && <h2 className="text-lg font-bold tracking-tight">{title}</h2>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((r, i) => (
          <div key={i} className="h-full">
            <Card className="group flex flex-col h-full overflow-hidden transition-all hover:shadow-sm border-border/30">
              <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 to-indigo-400" />
              {r.image ? <div className="relative aspect-video w-full overflow-hidden bg-muted/20 flex items-center justify-center p-4 border-b border-border/20"><img src={r.image} alt={r.title} className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" /></div>
                : <CardHeader className="p-3 pb-1"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/50">{r.icon}</div><CardTitle className="text-base leading-tight">{r.title}</CardTitle></div></div></CardHeader>}
              <CardContent className={`space-y-2.5 flex-grow ${r.image ? 'p-3' : 'px-3 pb-2'}`}>
                {r.image && <CardTitle className="text-base tracking-tight mb-0.5">{r.title}</CardTitle>}
                <CardDescription className="text-sm text-foreground/70 leading-relaxed">{r.description}</CardDescription>
                <div className="flex flex-wrap gap-1">{r.tags.map(tag => <Badge key={tag} variant="secondary" className="font-medium text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-muted/30">{tag}</Badge>)}</div>
              </CardContent>
              {(r.url || r.pdfUrl || r.repoUrl) && <CardFooter className="flex flex-col gap-2 pt-2 pb-3 items-start mt-auto px-3">
                <div className="flex gap-2 w-full">{r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className={r.repoUrl ? 'flex-1' : ''}><Button variant="default" size="sm" className="w-full gap-1.5 h-8 text-xs"><ExternalLink className="h-3.5 w-3.5" />Visitar</Button></a>}
                  {r.pdfUrl && <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1"><Button variant="default" size="sm" className="w-full gap-1.5 h-8 text-xs"><FileText className="h-3.5 w-3.5" />PDF</Button></a>}
                  {r.repoUrl && <a href={r.repoUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="icon" className="h-8 w-8 border-border/30"><Github className="h-4 w-4" /></Button></a>}
                </div>
                {r.extraLink && <a href={r.extraLink.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline flex items-center gap-1"><Globe className="h-3 w-3" />{r.extraLink.label}</a>}
              </CardFooter>}
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}
