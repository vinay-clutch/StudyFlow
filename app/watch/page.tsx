'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '../components/Navbar'
import VideoPlayer from '../components/VideoPlayer'
import NotesEditor from '../components/NotesEditor'
import VideoTimeline from '../components/VideoTimeline'
import PDFViewer from '../components/PDFViewer'
import StudyTimer from '../components/StudyTimer'
import { getRoadmaps, saveRoadmap, type Roadmap } from '../../lib/storage'
import { FileText, Edit3, Video as VideoIcon, Layout, Timer, List, ArrowLeft, ArrowRight, Trash2, Play, CheckCircle2, Loader2, Lock } from 'lucide-react'

type ViewMode = 'split' | 'video-focus' | 'notes-focus' | 'pdf-focus'

function WatchContent() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const videoId = searchParams.get('videoId') || ''
  const roadmapId = searchParams.get('roadmapId') || undefined
  
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'playlist' | 'notes' | 'pdf' | 'timeline'>('notes')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (roadmapId) {
      const roadmaps = getRoadmaps()
      const found = roadmaps.find(r => r.id === roadmapId)
      if (found) {
        setRoadmap(found)
        setActiveTab('playlist')
      }
    }
  }, [roadmapId])

  const handleDeleteVideo = async (vidId: string) => {
    if (!roadmap) return
    if (confirm('Remove this video from the roadmap?')) {
      const updatedVideos = roadmap.videos.filter(v => v.youtubeId !== vidId)
      const updatedRoadmap = { ...roadmap, videos: updatedVideos }
      setRoadmap(updatedRoadmap)
      await saveRoadmap(updatedRoadmap)
      
      // If deleted current video, redirect to first video or roadmap list
      if (vidId === videoId) {
        if (updatedVideos.length > 0) {
          router.push(`/watch?videoId=${updatedVideos[0].youtubeId}&roadmapId=${roadmapId}`)
        } else {
          router.push('/roadmap')
        }
      }
    }
  }

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

  // --- DEMO MODE (UNAUTHENTICATED) ---
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-foreground flex flex-col h-screen overflow-hidden">
        <Navbar variant="minimal" />
        
        {/* Demo Banner */}
        <div className="bg-blue-600/10 border-b border-blue-500/20 px-6 py-2 flex items-center justify-center gap-4">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Demo Mode: Your notes will not be saved. Sign in to sync progress.
          </p>
          <Link 
            href="/"
            className="rounded-full bg-blue-500 px-3 py-1 text-[10px] font-bold text-white hover:bg-blue-400 transition-all uppercase"
          >
            Sign In Now
          </Link>
        </div>

        <main className="flex-1 flex overflow-hidden">
          {/* Left: Video */}
          <div className="w-[60%] border-r border-white/5 bg-black overflow-y-auto">
            <div className="bg-zinc-950 flex justify-center pt-8 pb-8 px-6">
              <div className="w-full max-w-5xl"> 
                <VideoPlayer videoId={videoId} />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 text-center py-20 grayscale opacity-30">
               <Lock size={24} className="mx-auto mb-4 text-zinc-500" />
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Roadmap Timeline Locked</p>
            </div>
          </div>

          {/* Right: Notes */}
          <div className="w-[40%] bg-[#09090b] flex flex-col">
            <div className="flex border-b border-white/5 bg-black/20">
              <button className="flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 border-zinc-100 text-white bg-white/5">
                <Edit3 size={14} />
                Demo Notes
              </button>
              <button className="flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-600 grayscale cursor-not-allowed">
                <List size={14} />
                Playlist Locked
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <NotesEditor initialNotes="# Demo Notes\nTry typing here! These notes link to the video timestamp [[00:05]]." />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // --- FULL VIEW (AUTHENTICATED) ---
  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col h-screen overflow-hidden">
      
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#09090b] px-6 py-3 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-md transition-all ${viewMode === 'split' ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              title="Split View"
            >
              <Layout size={16} />
            </button>
            <button 
              onClick={() => setViewMode('video-focus')}
              className={`p-2 rounded-md transition-all ${viewMode === 'video-focus' ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              title="Video Focus"
            >
              <VideoIcon size={16} />
            </button>
            <button 
              onClick={() => setViewMode('notes-focus')}
              className={`p-2 rounded-md transition-all ${viewMode === 'notes-focus' ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              title="Notes Focus"
            >
              <Edit3 size={16} />
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
        <div className={`transition-all duration-300 border-r border-white/5 bg-black overflow-y-auto custom-scrollbar ${
          viewMode === 'video-focus' ? 'w-full' : 
          viewMode === 'notes-focus' || viewMode === 'pdf-focus' ? 'w-0 overflow-hidden' : 
          'w-[65%]'
        }`}>
          <div className="min-h-full flex flex-col">
            <div className="bg-zinc-950 flex justify-center pt-8 pb-8 px-6 relative shrink-0">
              <div className="w-full max-w-5xl"> 
                {/* VideoPlayer renders both the video and the status card */}
                <VideoPlayer videoId={videoId} roadmapId={roadmapId} />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 bg-[#09090b] flex-1">
              <VideoTimeline roadmapId={roadmapId} videoId={videoId} />
            </div>
          </div>
        </div>

        {/* Right Section: Tools (Notes / PDF / Playlist) */}
        <div className={`transition-all duration-300 flex flex-col bg-[#09090b] ${
          viewMode === 'video-focus' ? 'w-0 overflow-hidden' : 
          viewMode === 'notes-focus' || viewMode === 'pdf-focus' ? 'w-full' : 
          'w-[35%]'
        }`}>
          {/* Tabs for Tools */}
          <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto">
            {roadmapId && (
              <button
                onClick={() => setActiveTab('playlist')}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex-shrink-0 ${
                  activeTab === 'playlist' ? 'border-zinc-100 text-white bg-white/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <List size={14} />
                Playlist
              </button>
            )}
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex-shrink-0 ${
                activeTab === 'notes' ? 'border-zinc-100 text-white bg-white/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Edit3 size={14} />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 flex-shrink-0 ${
                activeTab === 'pdf' ? 'border-zinc-100 text-white bg-white/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FileText size={14} />
              PDF Reader
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'playlist' && roadmap && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider">Course Content</h3>
                   <span className="text-xs text-zinc-500">{roadmap.videos.length} videos</span>
                </div>
                {roadmap.videos.map((video, index) => (
                  <div 
                    key={video.id}
                    className={`group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                      video.youtubeId === videoId 
                        ? 'bg-zinc-800 border-zinc-700' 
                        : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => router.push(`/watch?videoId=${video.youtubeId}&roadmapId=${roadmap.id}`)}
                  >
                     <div className="relative w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                        <img src={video.thumbnail} alt={video.title} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                        {video.completed && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          </div>
                        )}
                        {video.youtubeId === videoId && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play size={16} className="text-white fill-current" />
                          </div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold line-clamp-2 ${video.youtubeId === videoId ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                          {index + 1}. {video.title}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-1">{video.duration || 'Video'}</p>
                     </div>
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleDeleteVideo(video.youtubeId); }}
                       className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                       title="Remove video"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                ))}
              </div>
            )}

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

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    }>
      <WatchContent />
    </Suspense>
  )
}
