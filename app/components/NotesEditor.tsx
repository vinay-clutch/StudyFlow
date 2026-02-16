'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Clock, Sparkles } from 'lucide-react'
import { saveNotes } from '../../lib/storage'

interface NotesEditorProps {
  roadmapId?: string
  videoId?: string
  initialNotes?: string
}

const DEBOUNCE_MS = 1000

export default function NotesEditor({
  roadmapId,
  videoId,
  initialNotes = '',
}: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    setNotes(initialNotes)
  }, [initialNotes])

  useEffect(() => {
    if (!roadmapId || !videoId) return
    const handle = window.setTimeout(() => {
      saveNotes(roadmapId, videoId, notes)
      setLastSavedAt(new Date())
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [notes, roadmapId, videoId])

  const characterCount = notes.length

  const savedLabel = useMemo(() => {
    if (!lastSavedAt) return 'Not saved yet'
    return `Saved at ${lastSavedAt.toLocaleTimeString()}`
  }, [lastSavedAt])

  const handleExport = () => {
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studyflow-notes-${videoId ?? 'video'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleAddTimestamp = () => {
    const snippet = '[[00:00]] '
    setNotes((prev) =>
      prev.endsWith('\n') || prev.length === 0 ? prev + snippet : `${prev}\n${snippet}`,
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#050505]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Notes</h2>
          <p className="text-xs text-gray-400">
            Take notes here. Use [[00:00]] for timestamps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              alert(
                'AI Summary feature coming soon! This will use Claude API to summarize the video transcript.',
              )
            }
            className="hidden items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-600/20 px-3 py-1.5 text-[11px] text-purple-200 transition-colors hover:bg-purple-600/30 sm:flex"
          >
            <Sparkles className="h-3 w-3" />
            AI Summary
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-100 transition-transform duration-200 hover:scale-105 hover:border-blue-500/60 hover:bg-blue-500/10"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-3">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium ${
              mode === 'edit' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium ${
              mode === 'preview' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300'
            }`}
          >
            Preview
          </button>
        </div>

        {mode === 'preview' ? (
          <div className="mb-3 flex-1 overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-gray-100">
            {notes ? (
              <div
                className="prose prose-invert max-w-none text-sm"
                dangerouslySetInnerHTML={{
                  __html: notes
                    .replace(/```([\s\S]*?)```/g, '<pre class="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 font-mono text-indigo-300 my-4 overflow-x-auto"><code>$1</code></pre>')
                    .replace(/\n/g, '<br />')
                }}
              />
            ) : (
              <p className="text-xs text-gray-500">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mb-3 min-h-[160px] flex-1 resize-none bg-transparent text-sm font-mono text-gray-100 outline-none placeholder:text-gray-500"
            placeholder="Take notes here... Use [[00:00]] for timestamps"
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{savedLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{characterCount} chars</span>
          <button
            type="button"
            onClick={handleAddTimestamp}
            className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-gray-100 transition-transform duration-200 hover:scale-105 hover:bg-blue-600/70"
          >
            Add Timestamp
          </button>
        </div>
      </div>
    </div>
  )
}

