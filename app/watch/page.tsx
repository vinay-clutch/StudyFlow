'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'
import VideoPlayer from '../components/VideoPlayer'
import NotesEditor from '../components/NotesEditor'
import VideoTimeline from '../components/VideoTimeline'
import PDFViewer from '../components/PDFViewer'
import StudyTimer from '../components/StudyTimer'

export default function WatchPage() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get('videoId') || ''
  const roadmapId = searchParams.get('roadmapId') || undefined

  if (!videoId) {
    return (
      <div className="min-h-screen bg-black text-foreground">
        <Navbar variant="minimal" />
        <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">No video selected</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar variant="minimal" />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-10 pt-6 lg:flex-row">
        <div className="w-full lg:w-[70%] p-0 lg:pr-4">
          <div className="h-full flex flex-col">
            <VideoPlayer videoId={videoId} roadmapId={roadmapId} />
          </div>
        </div>
        <div className="w-full lg:w-[30%] border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-4">
          <div className="flex h-full flex-col gap-4">
            <StudyTimer />
            <NotesEditor roadmapId={roadmapId} videoId={videoId} />
            <PDFViewer />
            <VideoTimeline roadmapId={roadmapId} videoId={videoId} />
          </div>
        </div>
      </main>
    </div>
  )
}

