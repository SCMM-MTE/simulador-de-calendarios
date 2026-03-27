import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SCMM - Simulador de Calendarios',
  description: 'Portal de Simuladores de Calendario y Rotación para SCMM-MTE',
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  themeColor: '#0066cc',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </main>
      </body>
    </html>
  )
}
