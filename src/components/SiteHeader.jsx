'use client'
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { HeaderLogo } from "@/components/HeaderLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NotificationBell } from "@/components/NotificationBell"

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/contests", label: "Contests" },
  { href: "/resources", label: "Recursos" },
  { href: "/judges", label: "Jueces" },
  { href: "/competitions", label: "Competiciones" },
  { href: "/communities", label: "Comunidades" },
]

export function SiteHeader() {
  const [isOpen, setIsOpen] = React.useState(false)
  const close = () => setIsOpen(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-canvas border-b border-hairline/60" style={{ height: 64 }}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" onClick={close} className="flex items-center">
            <HeaderLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 text-nav-link text-body hover:text-on-surface transition-colors rounded-sm ${isActive ? 'text-on-surface font-semibold' : ''}`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <Link
            href="/about"
            className="hidden sm:inline-flex items-center justify-center h-10 px-5 bg-primary text-on-primary text-btn rounded-md hover:bg-primary-active transition-colors btn-active"
          >
            Acerca de
          </Link>
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 text-body hover:text-on-surface"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden border-t border-hairline/60 bg-canvas">
          <nav className="mx-auto max-w-[1440px] flex flex-col gap-0.5 px-5 py-3">
            {navItems.concat([{ href: "/about", label: "Acerca de" }]).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="px-3 py-2.5 text-body-md text-body hover:text-on-surface hover:bg-surface-card rounded-md transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
