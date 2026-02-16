'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'

export default function Hero() {
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
          className="text-6xl md:text-8xl font-bold mb-6 text-balance text-white"
        >
          StudyFlow.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto text-balance"
        >
          Learn from YouTube without distractions. Build custom roadmaps, take notes, and track your progress—all in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/dashboard"
            className="group px-8 py-4 rounded-full font-medium transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Get Started Free
            <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="/watch?videoId=dQw4w9WgXcQ"
            className="px-8 py-4 rounded-full font-medium transition-all duration-300 border border-white/20 text-white/80 hover:bg-white/5"
          >
            Watch Demo
          </Link>
        </motion.div>
      </div>
    </section>
  )
}