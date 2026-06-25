import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"

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
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
