'use client'

import { useEffect, useState } from 'react'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'

export default function StudyTimer() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: number | undefined

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            return 59
          }
          return prevSeconds - 1
        })
        setMinutes((prevMinutes) => {
          if (seconds === 0) {
            if (prevMinutes === 0) {
              setIsActive(false)
              return 0
            }
            return prevMinutes - 1
          }
          return prevMinutes
        })
      }, 1000)
    }

    return () => {
      if (interval) window.clearInterval(interval)
    }
  }, [isActive, minutes, seconds])

  const reset = () => {
    setMinutes(25)
    setSeconds(0)
    setIsActive(false)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-500" />
        <h3 className="text-sm font-semibold text-white">Study Timer</h3>
      </div>

      <div className="mb-6 text-center font-mono text-4xl font-bold md:text-5xl">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsActive((prev) => !prev)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isActive ? 'Pause' : 'Start'}
        </button>

        <button
          type="button"
          onClick={reset}
          className="flex items-center justify-center rounded-lg bg-white/10 px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/20"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

