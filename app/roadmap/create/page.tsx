'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import AddVideoModal from '../../components/AddVideoModal'
import type { Roadmap, Video } from '../../../lib/storage'
import { saveRoadmap } from '../../../lib/storage'
import { ArrowUp, ArrowDown, Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function CreateRoadmapPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
      }
    }
    checkUser()
  }, [])

  const handleAddVideo = (video: Video) => {
    setVideos((prev) => [...prev, video])
  }

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    setVideos((prev) => {
      const next = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= next.length) return prev
      const [item] = next.splice(index, 1)
      next.splice(targetIndex, 0, item)
      return next
    })
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsCreating(true)

    try {
      const now = new Date().toISOString()
      const roadmap: Roadmap = {
        id: `roadmap_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        videos,
        createdAt: now,
        updatedAt: now,
        totalProgress: 0,
      }

      await saveRoadmap(roadmap)
      toast.success('Roadmap created successfully!')
      router.push('/dashboard')
    } catch (err) {
      console.error("Failed to create roadmap:", err)
      toast.error("Failed to save roadmap. Please check your connection.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-24">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Create Roadmap</h1>
          <p className="text-sm text-gray-400">
            Give your roadmap a name, description, and add YouTube videos.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Meta form */}
          <section className="space-y-4 rounded-2xl border border-white/10 bg-[#18181b] p-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-300">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. React for Beginners"
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What will you learn in this roadmap?"
                className="w-full resize-none rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* Videos list */}
          <section className="space-y-4 rounded-2xl border border-white/10 bg-[#18181b] p-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Videos</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-blue-500/30 transition-transform duration-200 hover:scale-105 hover:bg-blue-500"
              >
                <Plus className="h-3 w-3" />
                Add Video
              </button>
            </div>

            {videos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-black/40 p-6 text-xs text-gray-400">
                No videos added yet. Click &quot;Add Video&quot; to attach YouTube
                videos to this roadmap.
              </div>
            ) : (
              <ul className="space-y-3">
                {videos.map((video, index) => (
                  <li
                    key={video.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-3"
                  >
                    <div className="h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-black/60">
                      {/* Thumbnail placeholder; in the future we can use next/image */}
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">
                        {video.title}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {video.duration || 'Unknown duration'}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveVideo(index, 'up')}
                        className="rounded-full bg-white/5 p-1 text-gray-300 hover:bg-white/10"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveVideo(index, 'down')}
                        className="rounded-full bg-white/5 p-1 text-gray-300 hover:bg-white/10"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="rounded-full bg-red-500/10 p-1 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Roadmap...
              </>
            ) : (
              'Create Roadmap'
            )}
          </button>
        </div>
      </main>

      <AddVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddVideo={handleAddVideo}
      />
    </div>
  )
}

