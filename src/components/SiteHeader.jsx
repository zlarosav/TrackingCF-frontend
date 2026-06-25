'use client'
import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { HeaderLogo } from "@/components/HeaderLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/NotificationBell"

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false); const close = () => setIsOpen(false)
  const items = [{ href: "/", label: "Inicio" }, { href: "/compare", label: "Comparar" }, { href: "/contests", label: "Contests" }, { href: "/resources", label: "Recursos" }, { href: "/judges", label: "Jueces" }, { href: "/competitions", label: "Comp." }, { href: "/communities", label: "Comunidades" }]
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-between">
        <div className="flex items-center gap-6"><Link href="/" onClick={close}><HeaderLogo /></Link>
          <nav className="hidden md:flex items-center gap-0.5">{items.map(({ href, label }) => (<Link key={href} href={href} className="px-2.5 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40">{label}</Link>))}</nav>
        </div>
        <div className="flex items-center gap-1.5"><NotificationBell /><ThemeToggle /><Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</Button></div>
      </div>
      {isOpen && <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-xl"><nav className="container flex flex-col gap-0.5 py-2">{items.concat([{ href: "/about", label: "Acerca de" }]).map(({ href, label }) => (<Link key={href} href={href} onClick={close} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-colors">{label}</Link>))}</nav></div>}
    </header>
  )
}
