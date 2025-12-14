import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import "./globals.css";
import { Providers } from './providers'
import { Header } from '@/components/layout/Header'
import { SpaceBackground } from '@/components/layout/SpaceBackground'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: 'Project Chimera - Deep Space Communication System',
  description: 'AI-powered interface for astronaut guidance and spacecraft diagnostics',
  keywords: ['space', 'astronaut', 'AI', 'communication', 'diagnostics', 'NASA', 'spacecraft'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} ${orbitron.variable}`}>
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <Providers>
          <SpaceBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster 
            position="bottom-right"
            theme="dark"
            expand={true}
            richColors
          />
        </Providers>
      </body>
    </html>
  )
}