'use client'

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { HeaderLogo } from "@/components/HeaderLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/NotificationBell"

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/contests", label: "Contests" },
    { href: "/resources", label: "Recursos" },
    { href: "/judges", label: "Jueces" },
    { href: "/competitions", label: "Competencias" },
    { href: "/communities", label: "Comunidades" },
    { href: "/about", label: "Acerca de" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        
        {/* Left Side: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" onClick={closeMenu}>
            <HeaderLogo />
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
             {navItems.slice(0, 6).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </Link>
             ))}
          </nav>
        </div>

        {/* Right Side: Desktop Actions + Mobile Toggle */}
        <div className="flex items-center gap-4">
           {/* Desktop About Link */}
           <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Acerca de
              </Link>
           </nav>

           <div className="flex items-center gap-1">
             <NotificationBell />
             <ThemeToggle />
           </div>
           
           {/* Mobile Toggle */}
           <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
           </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t p-4 bg-background">
           <nav className="flex flex-col gap-4">
             {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={closeMenu}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
             ))}
           </nav>
        </div>
      )}
    </header>
  )
}
