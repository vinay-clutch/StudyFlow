'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer as TimerIcon, Clock } from 'lucide-react'

interface StudyTimerProps {
  variant?: 'default' | 'compact'
}

export default function StudyTimer({ variant = 'default' }: StudyTimerProps) {
  const [seconds, setSeconds] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [totalTime, setTotalTime] = useState(25 * 60)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
    } else if (seconds === 0) {
      setIsActive(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive, seconds])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setSeconds(25 * 60)
    setTotalTime(25 * 60)
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = ((totalTime - seconds) / totalTime) * 100

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 shadow-lg">
        <div className="relative h-2 w-16 overflow-hidden rounded-full bg-white/5">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <span className="font-mono text-sm font-bold text-white">{formatTime(seconds)}</span>
        <button onClick={toggleTimer} className="text-blue-500 hover:text-blue-400">
          {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl overflow-hidden relative group">
      {/* Background glow */}
      <div className={`absolute -inset-20 bg-blue-600/10 blur-[100px] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative mb-6">
        {/* Progress Ring */}
        <svg className="h-48 w-48 -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 88}
            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
            strokeLinecap="round"
            className="text-blue-500 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-4xl font-bold tracking-tighter text-white transition-all ${isActive ? 'scale-110' : 'scale-100'}`}>
            {formatTime(seconds)}
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Focus Session</span>
        </div>
      </div>

      <div className="flex items-center gap-6 relative z-10">
        <button
          onClick={resetTimer}
          className="rounded-full bg-white/5 p-3 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={toggleTimer}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
            isActive 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]'
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        <button className="rounded-full bg-white/5 p-3 text-gray-400 transition-all hover:bg-white/10 hover:text-white">
          <TimerIcon size={20} />
        </button>
      </div>
    </div>
  )
}
