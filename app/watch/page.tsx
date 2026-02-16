'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import VideoPlayer from '../components/VideoPlayer'
import NotesEditor from '../components/NotesEditor'
import VideoTimeline from '../components/VideoTimeline'
import PDFViewer from '../components/PDFViewer'
import StudyTimer from '../components/StudyTimer'
import { FileText, Edit3, Video as VideoIcon, Layout, Timer, List } from 'lucide-react'

type ViewMode = 'split' | 'video-focus' | 'notes-focus' | 'pdf-focus'

export default function WatchPage() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get('videoId') || ''
  const roadmapId = searchParams.get('roadmapId') || undefined
  const [activeTab, setActiveTab] = useState<'notes' | 'pdf' | 'timeline' | 'timer'>('notes')
  const [viewMode, setViewMode] = useState<ViewMode>('split')

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
    <div className="min-h-screen bg-black text-foreground flex flex-col h-screen overflow-hidden">
      <Navbar variant="minimal" />

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#050505] px-6 py-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex gap-1">
            <button 
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              title="Split View"
            >
              <Layout size={18} />
            </button>
            <button 
              onClick={() => setViewMode('video-focus')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'video-focus' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              title="Video Focus"
            >
              <VideoIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode('notes-focus')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'notes-focus' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              title="Notes Focus"
            >
              <Edit3 size={18} />
            </button>
            <button 
              onClick={() => setViewMode('pdf-focus')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'pdf-focus' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
              title="PDF Focus"
            >
              <FileText size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Quick status/timer can go here */}
           <StudyTimer variant="compact" />
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Section: Video */}
        <div className={`transition-all duration-300 border-r border-white/10 bg-black ${
          viewMode === 'video-focus' ? 'w-full' : 
          viewMode === 'notes-focus' || viewMode === 'pdf-focus' ? 'w-0 overflow-hidden' : 
          'w-[60%]'
        }`}>
          <div className="h-full p-4">
            <VideoPlayer videoId={videoId} roadmapId={roadmapId} />
            <div className="mt-4">
              <VideoTimeline roadmapId={roadmapId} videoId={videoId} />
            </div>
          </div>
        </div>

        {/* Right Section: Tools (Notes / PDF) */}
        <div className={`transition-all duration-300 flex flex-col bg-[#090909] ${
          viewMode === 'video-focus' ? 'w-0 overflow-hidden' : 
          viewMode === 'notes-focus' || viewMode === 'pdf-focus' ? 'w-full' : 
          'w-[40%]'
        }`}>
          {/* Tabs for Tools */}
          <div className="flex border-b border-white/10 bg-black/40">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'notes' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Edit3 size={16} />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === 'pdf' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <FileText size={16} />
              PDF Reader
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'notes' && (
              <div className="h-full">
                <NotesEditor roadmapId={roadmapId} videoId={videoId} />
              </div>
            )}
            {activeTab === 'pdf' && (
              <div className="h-full">
                <PDFViewer />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

