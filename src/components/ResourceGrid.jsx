import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, FileText, Globe, BookOpen, Code, Trophy, Calendar, ArrowRight } from 'lucide-react'

const icons = {
  BookOpen: <BookOpen className="h-5 w-5" />,
  Code: <Code className="h-5 w-5" />,
  Trophy: <Trophy className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
}

export function ResourceGrid({ title, items, layout = "grid" }) {
  if (!items?.length) return null

  if (layout === "list") {
    return (
      <section className="space-y-3">
        {title && <h2 className="text-title-sm text-on-surface flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" />{title}</h2>}
        <div className="space-y-2">
          {items.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl bg-surface-card p-4 transition-colors hover:bg-surface-elevated group">
              {r.icon && <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted group-hover:text-primary transition-colors">{r.icon}</div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-body-md font-semibold text-on-surface">{r.title}</span>
                  {r.tags?.slice(0, 2).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
                <p className="text-body-sm text-muted mt-0.5 line-clamp-1">{r.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </section>
    )
  }

  if (layout === "featured") {
    const featured = items.slice(0, 2)
    const rest = items.slice(2)
    return (
      <section className="space-y-4">
        {title && <h2 className="text-title-lg text-on-surface flex items-center gap-2">{title}</h2>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {featured.map((r, i) => (
            <Card key={i} className="overflow-hidden group">
              <div className="relative aspect-video w-full bg-surface-elevated flex items-center justify-center p-6 border-b border-hairline/60">
                <div className="text-6xl text-primary/30 group-hover:text-primary/50 transition-colors">{icons[r.iconName] || r.icon}</div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-title-sm text-on-surface">{r.title}</h3>
                <p className="text-body-sm text-muted leading-relaxed">{r.description}</p>
                <div className="flex flex-wrap gap-1">{r.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div>
                <div className="flex gap-2 pt-1">
                  {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer"><Button size="sm" className="h-8 text-caption gap-1"><ExternalLink className="h-3 w-3" />Visitar</Button></a>}
                  {r.repoUrl && <a href={r.repoUrl} target="_blank" rel="noopener noreferrer"><Button variant="secondary" size="icon" className="h-8 w-8"><Github className="h-4 w-4" /></Button></a>}
                </div>
              </div>
            </Card>
          ))}
        </div>
        {rest.length > 0 && (
          <ResourceGrid items={rest} layout="list" />
        )}
      </section>
    )
  }

  // Default grid layout
  return (
    <section className="space-y-4">
      {title && <h2 className="text-title-sm text-on-surface flex items-center gap-2">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-fr">
        {items.map((r, i) => (
          <Card key={i} className="group flex h-full min-h-[15.5rem] flex-col p-4 transition-colors hover:bg-surface-elevated">
            <div className="flex items-start justify-between gap-3">
              {r.icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted transition-colors group-hover:text-primary">
                  {r.icon}
                </div>
              )}
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted/60 transition-colors group-hover:text-primary" />
            </div>

            <div className="mt-3 flex min-w-0 flex-1 flex-col">
              <h3 className="min-h-[2.6rem] text-body-md font-semibold leading-snug text-on-surface line-clamp-2">{r.title}</h3>
              <p className="mt-1 min-h-[3.9rem] text-body-sm text-muted line-clamp-3">{r.description}</p>
              <div className="mt-3 flex min-h-[1.375rem] flex-wrap gap-1 overflow-hidden">
                {r.tags.slice(0, 3).map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
              </div>

              <div className="mt-auto flex items-center gap-1.5 pt-4">
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <Button size="xs" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Ir
                    </Button>
                  </a>
                )}
                {r.pdfUrl && (
                  <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="xs" className="gap-1">
                      <FileText className="h-3 w-3" />
                      PDF
                    </Button>
                  </a>
                )}
                {r.repoUrl && (
                  <a href={r.repoUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="icon" className="h-7 w-7">
                      <Github className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
                {r.extraLink && (
                  <a href={r.extraLink.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="icon" className="h-7 w-7">
                      <Globe className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
