'use client'

import { useState } from 'react'
import { X, Loader2, ListPlus, Link as LinkIcon } from 'lucide-react'
import type { Video } from '../../lib/storage'

interface AddVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onAddVideo: (video: Video) => void
}

function extractVideoId(url: string): string | null {
  url = url.trim()
  // Handle shorts, standard watch, youtu.be, embed, and playlist-style links
  const patterns = [
    /(?:v=|v\/|vi=|vi\/|shorts\/|embed\/|youtu\.be\/|be\/)([^#&?]*)/,
    /[?&]v=([^#&?]*)/,
    /([a-zA-Z0-9_-]{11})/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1] && match[1].length === 11) return match[1]
  }
  return null
}

async function fetchVideoData(videoId: string): Promise<Video> {
  const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  try {
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
    )
    const data = await response.json()
    
    if (!data || !data.title) {
      throw new Error("No data found")
    }

    return {
      id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      youtubeId: videoId,
      title: data.title,
      thumbnail: fallbackThumbnail,
      duration: 'YouTube Video',
      completed: false,
      progress: 0,
      notes: '',
      timestamps: [],
    }
  } catch (error) {
    return {
      id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      youtubeId: videoId,
      title: `Video (${videoId})`,
      thumbnail: fallbackThumbnail,
      duration: 'YouTube Video',
      completed: false,
      progress: 0,
      notes: '',
      timestamps: [],
    }
  }
}

export default function AddVideoModal({ isOpen, onClose, onAddVideo }: AddVideoModalProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'single' | 'bulk'>('single')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const urls = mode === 'bulk' 
        ? input.split(/[\n,]/).map(u => u.trim()).filter(u => u)
        : [input.trim()]

      const videoIds = urls.map(extractVideoId).filter(id => id) as string[]

      if (videoIds.length === 0) {
        setError('No valid YouTube IDs found.')
        setIsLoading(false)
        return
      }

      // Fetch all concurrently
      const results = await Promise.all(videoIds.map(fetchVideoData))
      results.forEach(onAddVideo)

      setInput('')
      onClose()
    } catch (err) {
      setError('Failed to fetch video information.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Add Content</h2>
            <p className="text-sm text-gray-500">Import your study materials</p>
          </div>
          <button onClick={onClose} className="rounded-full hover:bg-white/5 p-2 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl bg-white/5 p-1">
          <button 
            onClick={() => setMode('single')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${mode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <LinkIcon size={14} /> Single Video
          </button>
          <button 
            onClick={() => setMode('bulk')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${mode === 'bulk' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <ListPlus size={14} /> Bulk / Playlist
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-widest">
              {mode === 'single' ? 'YouTube URL or Video ID' : 'URLs (one per line)'}
            </label>
            {mode === 'single' ? (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                required
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                placeholder="Paste multiple links here..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
                required
              />
            )}
          </div>

          {error && <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 text-xs text-red-500">{error}</div>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : mode === 'bulk' ? 'Import All' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

