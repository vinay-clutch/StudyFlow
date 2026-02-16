'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, CheckCircle, Cloud, AlertCircle, Loader2 } from 'lucide-react'
import {
  getVideoPosition,
  markVideoComplete,
  saveVideoPosition,
  updateVideoProgress,
} from '../../lib/storage'

interface VideoPlayerProps {
  videoId: string
  roadmapId?: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function VideoPlayer({ videoId, roadmapId }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    let player: any = null
    let retryCount = 0
    setPlayerError(null)

    const initPlayer = () => {
      const el = document.getElementById('youtube-player')
      if (!el) {
        if (retryCount < 5) {
          retryCount++
          setTimeout(initPlayer, 200)
        }
        return
      }

      if (!window.YT || !window.YT.Player) return

      try {
        if (playerRef.current) {
          playerRef.current.destroy()
        }

        player = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 1, // Let's try to autoplay if possible
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              playerRef.current = event.target
              const lastPosition = getVideoPosition(videoId)
              if (lastPosition > 0) {
                event.target.seekTo(lastPosition, true)
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
                startProgressTracking()
              } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false)
                if (intervalRef.current) {
                  window.clearInterval(intervalRef.current)
                  intervalRef.current = null
                }
              }
            },
            onError: (e: any) => {
              console.error("YT Player Error:", e.data)
              setPlayerError("This video cannot be played here (restricted or deleted).")
            }
          },
        })
      } catch (err) {
        console.error("YT Player init error", err)
      }
    }

    if (window.YT && window.YT.Player) {
      setTimeout(initPlayer, 100)
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]',
      )

      if (!existingScript) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      }

      window.onYouTubeIframeAPIReady = () => {
        initPlayer()
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
      if (player && player.destroy) {
        player.destroy()
      }
    }
  }, [videoId])

  const startProgressTracking = () => {
    if (intervalRef.current) return

    intervalRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()

        if (!duration || !isFinite(duration) || duration <= 0) return

        const raw = (currentTime / duration) * 100
        const clamped = Math.min(100, Math.max(0, raw))
        setProgress(clamped)

        // Sync to storage
        setIsSyncing(true)
        saveVideoPosition(videoId, currentTime)

        if (roadmapId) {
          updateVideoProgress(roadmapId, videoId, clamped)
        }

        if (clamped >= 98 && !isComplete) {
          setIsComplete(true)
          if (roadmapId) {
            markVideoComplete(roadmapId, videoId)
          }
        }
        
        // Hide sync indicator after a bit
        setTimeout(() => setIsSyncing(false), 800)
      }
    }, 2000)
  }

  const togglePlayPause = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const markComplete = () => {
    const next = !isComplete
    setIsComplete(next)
    const newProgress = next ? 100 : progress
    setProgress(newProgress)

    if (roadmapId) {
      if (next) {
        markVideoComplete(roadmapId, videoId)
      } else {
        updateVideoProgress(roadmapId, videoId, newProgress)
      }
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="relative w-full overflow-hidden rounded-[2rem] bg-black shadow-2xl aspect-video border border-white/5">
        {playerError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
            <AlertCircle className="mb-4 text-red-500" size={48} />
            <p className="text-white font-bold">{playerError}</p>
            <p className="text-sm text-gray-500 mt-2">Try refreshing the page or checking the URL.</p>
          </div>
        ) : (
          <div id="youtube-player" className="h-full w-full" />
        )}
        
        {/* Sync Indicator Overlay */}
        {isSyncing && (
          <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-[10px] font-bold text-blue-400 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            <Cloud size={12} className="animate-pulse" />
            REAL-TIME SYNC
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[#090909] p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlayPause}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 transform active:scale-90 ${
                isPlaying 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-2xl shadow-blue-600/20'
              }`}
            >
              {isPlaying ? <Pause className="fill-current w-6 h-6" /> : <Play className="fill-current w-6 h-6 ml-1" />}
            </button>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                <p className="text-sm font-bold text-white uppercase tracking-wider">{isPlaying ? 'Studying' : 'Paused'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={markComplete}
            className={`flex items-center gap-3 rounded-2xl px-8 py-4 text-sm font-bold transition-all transform active:scale-95 ${
              isComplete
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CheckCircle className={`h-5 w-5 ${isComplete ? 'fill-current' : ''}`} />
            {isComplete ? 'Milestone Completed' : 'Mark as Mastered'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-4xl font-black text-white tracking-tighter">{Math.round(progress)}%</span>
              <span className="text-xs text-blue-500 font-bold ml-3 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">Retained</span>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Estimated Mastery</p>
               <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`h-1 w-4 rounded-full ${progress >= i*20 ? 'bg-blue-500' : 'bg-white/5'}`} />
                  ))}
               </div>
            </div>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-white/5 p-1">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                isComplete 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              }`}
              style={{ width: `${progress}%` }}
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
