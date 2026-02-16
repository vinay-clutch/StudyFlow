import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import MouseGlow from './components/MouseGlow'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
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
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} bg-background antialiased`}>
        <MouseGlow />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}