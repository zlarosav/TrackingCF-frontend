'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, FileText, Globe } from 'lucide-react'

export function ResourceGrid({ title, items }) {
    if (!items || items.length === 0) return null
    
    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {items.map((resource, index) => (
                    <div key={index} className="h-full">
                         <Card className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 border-muted">
                          
                          {/* Card Image Header (if provided) */}
                          {resource.image ? (
                            <div className="relative aspect-video w-full overflow-hidden bg-muted/50 flex items-center justify-center p-6 border-b">
                              <img 
                                src={resource.image} 
                                alt={resource.title} 
                                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <CardHeader>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-muted flex items-center justify-center w-10 h-10 overflow-hidden">
                                    {resource.icon}
                                  </div>
                                  <CardTitle className="text-xl leading-tight">{resource.title}</CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                          )}

                          <CardContent className={`space-y-4 flex-grow ${resource.image ? 'pt-6' : ''}`}>
                            {resource.image && <CardTitle className="text-2xl tracking-tight mb-2">{resource.title}</CardTitle>}
                            
                            <CardDescription className="text-base text-foreground/80 leading-relaxed">
                              {resource.description}
                            </CardDescription>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                              {resource.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="font-medium text-[10px] uppercase tracking-wider px-2 py-0.5 bg-muted/50 hover:bg-muted transition-colors">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>

                          <CardFooter className="flex flex-col gap-3 pt-4 pb-6 items-start mt-auto px-6">
                            <div className="flex gap-3 w-full">
                              {resource.url && (
                                  <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1"
                                  >
                                  <Button variant="default" className="w-full gap-2 font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                                      <ExternalLink className="h-4 w-4" />
                                      Visitar Sitio
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
                                  <Button variant="default" className="w-full gap-2 font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
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
                                  <Button variant="outline" size="icon" title="Ver Repositorio" className="border-muted-foreground/20 hover:bg-muted">
                                      <Github className="h-4 w-4" />
                                  </Button>
                                  </a>
                              )}
                            </div>
                            
                            {resource.extraLink && (
                               <a
                               href={resource.extraLink.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline flex items-center gap-1.5 mt-1 transition-colors"
                               >
                               <Globe className="h-3.5 w-3.5" />
                               {resource.extraLink.label}
                               </a>
                            )}
                          </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </section>
    )
}
