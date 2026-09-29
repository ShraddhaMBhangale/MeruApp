import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meru Chikitsa Practice Manager',
  description: 'Practice management for Meru Chikitsa — NSA & SRI spinal wellness',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
