import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rit-Spanda Wellness Studio — Meru Chikitsa, North Bangalore',
  description: 'Gentle, contact-based healing for your nervous system. Meru Chikitsa (Network Spinal) sessions at Rit-Spanda Wellness Studio, Vidyaranyapura, North Bangalore.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${cormorant.variable} ${dmSans.variable}`}>
      <body className="h-full" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
