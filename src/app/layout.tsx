import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QR Menu SaaS - Create Digital Restaurant Menus',
  description: 'Create your restaurant\'s QR menu in minutes. No coding. No stress. Just sign up, build, and print your QR.',
  keywords: 'QR menu, digital menu, restaurant menu, contactless menu, menu generator',
  authors: [{ name: 'QR Menu SaaS' }],
  robots: 'index, follow',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
