import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'StudyFlow - Learn Without Distractions',
  description:
    'Your focused learning workspace. Watch YouTube courses without distractions, take notes, track progress, and build custom learning roadmaps.',
  keywords:
    'youtube learning, distraction free, study platform, notes, progress tracking, learning roadmap, studyflow',
  authors: [{ name: 'StudyFlow' }],
  openGraph: {
    title: 'StudyFlow - Learn Without Distractions',
    description: 'Your focused learning workspace. Watch YouTube courses without distractions.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}