import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PRODE Mundial 2026',
  description: 'El prode de tus amigos para el Mundial 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-[#0D0D1A] text-[#F5F5F5] antialiased">
        {children}
      </body>
    </html>
  )
}
