'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Video } from '../../lib/storage'

interface AddVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onAddVideo: (video: Video) => void
}

// Improved YouTube video ID extraction.
function extractVideoId(url: string): string | null {
  url = url.trim()

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
    /youtube\.com\/v\/([^&\s]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  // If it's just the ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  return null
}

async function fetchVideoData(videoId: string): Promise<Video> {
  try {
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
    )
    const data = await response.json()

    return {
      id: Date.now().toString(),
      youtubeId: videoId,
      title: data.title || 'Untitled Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: '0:00',
      completed: false,
      progress: 0,
      notes: '',
      timestamps: [],
    }
  } catch (error) {
    console.error('Error fetching video data:', error)
    return {
      id: Date.now().toString(),
      youtubeId: videoId,
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: '0:00',
      completed: false,
      progress: 0,
      notes: '',
      timestamps: [],
    }
  }
}

export default function AddVideoModal({ isOpen, onClose, onAddVideo }: AddVideoModalProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const videoId = extractVideoId(url.trim())

    if (!videoId) {
      setError('Please enter a valid YouTube video URL.')
      return
    }

    setIsLoading(true)

    try {
      const video = await fetchVideoData(videoId)

      onAddVideo(video)
      setUrl('')
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to fetch video information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#050505] p-6 shadow-2xl shadow-black/60">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Add YouTube Video</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              YouTube URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <p className="text-xs text-gray-500">
            Playlist URLs and advanced metadata are not yet supported; this adds a single video
            using YouTube oEmbed.
          </p>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-200 transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 hover:scale-105 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Add to Roadmap
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

