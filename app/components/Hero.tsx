'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Sparkles, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Hero() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-24">
      {/* Centered static blue blur background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[600px] rounded-full blur-[200px] opacity-70 bg-[radial-gradient(circle_at_center,#06b6d4,#1e3a8a)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold mb-6 text-balance text-white tracking-tighter"
        >
          StudyFlow.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto text-balance font-light leading-relaxed"
        >
          Master any subject from YouTube without distractions. Build custom roadmaps, take notes, and track your progress—all in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href={user ? "/dashboard" : "#"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
                alert("Please click 'Sign In' at the top to start your journey!")
              }
            }}
            className="group px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 bg-blue-600 text-white shadow-2xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 active:scale-95"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'}
            {user ? <ArrowRight size={18} /> : <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </Link>
          
          <Link
            href="/watch?videoId=dQw4w9WgXcQ"
            className="px-8 py-4 rounded-2xl font-bold transition-all duration-300 border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            Watch Demo
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
