'use client'

import { useState } from 'react'
import { Clock, Trash2, Plus } from 'lucide-react'

interface Chapter {
  id: string
  time: number // seconds
  title: string
  description?: string
}

interface VideoTimelineProps {
  videoId: string
  roadmapId?: string
}

export default function VideoTimeline({ videoId, roadmapId }: VideoTimelineProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newChapter, setNewChapter] = useState({
    time: '',
    title: '',
    description: '',
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
    return 0
  }

  const addChapter = () => {
    if (newChapter.time && newChapter.title) {
      const chapter: Chapter = {
        id: Date.now().toString(),
        time: parseTime(newChapter.time),
        title: newChapter.title,
        description: newChapter.description,
      }
      setChapters((prev) => [...prev, chapter].sort((a, b) => a.time - b.time))
      setNewChapter({ time: '', title: '', description: '' })
      setIsAdding(false)
    }
  }

  const deleteChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Clock className="h-4 w-4 text-blue-500" />
          Video Timeline
        </h3>
        <button
          type="button"
          onClick={() => setIsAdding((prev) => !prev)}
          className="flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-400"
        >
          <Plus className="h-3 w-3" />
          Add Chapter
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 space-y-3 rounded-lg bg-white/5 p-3">
          <input
            type="text"
            placeholder="Time (MM:SS)"
            value={newChapter.time}
            onChange={(e) => setNewChapter({ ...newChapter, time: e.target.value })}
            className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-500"
          />
          <input
            type="text"
            placeholder="Chapter title"
            value={newChapter.title}
            onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
            className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={newChapter.description}
            onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
            className="w-full resize-none rounded border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addChapter}
              className="rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded bg-white/10 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {chapters.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-500">
            No chapters yet. Add chapters to organize this video.
          </p>
        ) : (
          chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="group flex items-start justify-between rounded-lg bg-white/5 p-3 text-xs hover:bg-white/10"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-blue-400">
                    {formatTime(chapter.time)}
                  </span>
                  <span className="font-medium text-white">{chapter.title}</span>
                </div>
                {chapter.description && (
                  <p className="text-gray-400">{chapter.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => deleteChapter(chapter.id)}
                className="ml-2 opacity-0 transition-opacity group-hover:opacity-100 text-red-500 hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

