import type { Metadata } from 'next'
import { Orbitron, Rajdhani } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/header'
import './globals.css'

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: '--font-orbitron'
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani'
});

export const metadata: Metadata = {
  title: 'Distopia_x | College eSports Tournament',
  description: 'Join the ultimate BGMI college tournament. Compete, dominate, and claim your glory in Distopia_x.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${orbitron.variable} ${rajdhani.variable} font-sans antialiased bg-background text-foreground`}>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
