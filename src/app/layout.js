import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

export const metadata = {
  title: 'TrackingCF - Codeforces Tracker',
  description: 'Sistema de tracking de problemas de Codeforces',
  icons: {
    icon: [
      { url: '/TCF_logo_light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/TCF_logo_dark.svg', media: '(prefers-color-scheme: dark)' },
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} font-body`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
