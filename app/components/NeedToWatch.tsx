'use client'

import { useState, useEffect } from 'react'
import { Bookmark, Plus, Play, Trash2, ExternalLink, Link as LinkIcon, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QueuedVideo {
  id: string
  title: string
  url: string
  thumbnail: string
  addedAt: string
}

export default function NeedToWatch() {
  const [queue, setQueue] = useState<QueuedVideo[]>([])
  const [url, setUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('studyflow_watch_queue')
    if (saved) setQueue(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('studyflow_watch_queue', JSON.stringify(queue))
  }, [queue])

  const extractId = (url: string) => {
    const match = url.match(/[?&]v=([^#&?]*)/) || url.match(/youtu\.be\/([^#&?]*)/)
    return match ? match[1] : null
  }

  const addToQueue = async (e: React.FormEvent) => {
    e.preventDefault()
    const videoId = extractId(url)
    if (!videoId) return alert("Invalid YouTube URL")

    setIsAdding(true)
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
      const data = await res.json()
      
      const newVideo: QueuedVideo = {
        id: Date.now().toString(),
        title: data.title || "Untitled Video",
        url: url,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        addedAt: new Date().toISOString()
      }
      
      setQueue([newVideo, ...queue])
      setUrl('')
    } catch (err) {
      alert("Failed to fetch video details")
    } finally {
      setIsAdding(false)
    }
  }

  const remove = (id: string) => {
    setQueue(queue.filter(v => v.id !== id))
  }

  return (
    <section className="mt-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white font-outfit">Need to Watch</h2>
          <p className="text-sm text-gray-500 font-light">Your personal queue for future learning.</p>
        </div>
        <div className="flex glass p-1.5 rounded-2xl border border-white/5">
           <Bookmark size={16} className="text-indigo-400 mx-2" />
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">{queue.length} Saved</span>
        </div>
      </div>

      <form onSubmit={addToQueue} className="mb-10 flex gap-4">
        <div className="relative flex-1 group">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Paste a YouTube video or playlist link to save for later..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 outline-none focus:border-indigo-500/50 transition-all focus:bg-white/[0.06]"
          />
        </div>
        <button 
          type="submit"
          disabled={!url || isAdding}
          className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          Add to Queue
        </button>
      </form>

      {queue.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]">
          <p className="text-sm text-gray-600 font-medium italic">Your queue is empty. Start saving videos for later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {queue.map((video) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={video.id}
                className="glass-card !p-0 overflow-hidden group border border-white/5 hover:border-indigo-500/30 transition-all"
              >
                <div className="relative aspect-video">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                     <a href={video.url} target="_blank" className="p-3 rounded-full bg-indigo-600 text-white hover:scale-110 transition-all"><Play size={20} fill="currentColor" /></a>
                     <button onClick={() => remove(video.id)} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-red-500 transition-all"><Trash2 size={20} /></button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white truncate font-outfit mb-1">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Added {new Date(video.addedAt).toLocaleDateString()}</span>
                    <ExternalLink size={12} className="text-gray-700" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}
