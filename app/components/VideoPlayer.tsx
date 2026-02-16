'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, CheckCircle } from 'lucide-react'
import { markVideoComplete, updateVideoProgress } from '../../lib/storage'

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
  const playerRef = useRef<any>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
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
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      })
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true)
      startProgressTracking()
    } else {
      setIsPlaying(false)
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const startProgressTracking = () => {
    if (intervalRef.current) return

    intervalRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime()
        const duration = playerRef.current.getDuration()

        if (!duration || !isFinite(duration)) return

        const raw = (currentTime / duration) * 100
        const clamped = Math.min(100, Math.max(0, raw))
        setProgress(clamped)

        if (roadmapId) {
          updateVideoProgress(roadmapId, videoId, clamped)
        }

        if (clamped >= 95 && !isComplete) {
          setIsComplete(true)
          if (roadmapId) {
            markVideoComplete(roadmapId, videoId)
          }
        }
      }
    }, 1000)
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
      <div className="relative w-full flex-1 overflow-hidden rounded-2xl bg-black shadow-2xl">
        <div className="relative h-0 w-full pb-[56.25%]">
          <div
            id="youtube-player"
            className="absolute inset-0 h-full w-full overflow-hidden rounded-xl"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlayPause}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Play
              </>
            )}
          </button>

          <button
            type="button"
            onClick={markComplete}
            className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${
              isComplete
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <CheckCircle className={`h-5 w-5 ${isComplete ? 'fill-white' : ''}`} />
            {isComplete ? 'Completed' : 'Mark complete'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="font-medium text-white">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
