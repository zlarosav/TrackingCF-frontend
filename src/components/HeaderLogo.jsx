'use client'

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

export function HeaderLogo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render a placeholder or nothing during SSR to avoid hydration mismatch
  if (!mounted) {
    return <div className="w-8 h-8 mr-2" />
  }

  const src = resolvedTheme === 'dark' ? '/TCF_logo_dark.svg' : '/TCF_logo_light.svg'

  return (
    <div className="relative w-24 h-8 mr-2">
      <Image 
        src={src} 
        alt="TrackingCF Logo" 
        fill 
        className="object-contain" 
        priority 
      />
    </div>
  )
}
