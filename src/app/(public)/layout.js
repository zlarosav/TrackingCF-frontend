import { SiteHeader } from "@/components/SiteHeader"
import { GlobalBanner } from "@/components/GlobalBanner"

export default function PublicLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-canvas-dark">
      <GlobalBanner />
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-5 sm:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
