'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, Sparkles, ArrowRight, Zap, Shield, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function Hero() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black selection:bg-white/30">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.08] bg-white animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.1] bg-blue-900" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md"
        >
          <Sparkles size={12} className="text-white" />
          The Future of Focused Learning
        </motion.div>

        {/* Huge Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tightest leading-[0.9]"
        >
          Focus. Study.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
            Evolve.
          </span>
        </motion.h1>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Master any subject from YouTube with zero distractions. Built for high-performance students who value their time.
        </motion.p>

        {/* Main Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24"
        >
          {/* Sign In Trigger (Hidden Input Hack Wrapper) */}
          <Link
            href={user ? "/dashboard" : "#"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault()
                toast.info('Ready to grow?', {
                  description: 'Please Sign In with GitHub or Email to start your journey.',
                  action: {
                    label: 'Sign In',
                    onClick: () => {
                      (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus()
                    }
                  }
                })
              }
            }}
            className="group relative px-10 py-5 rounded-[2rem] font-bold text-lg transition-all duration-500 bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {user ? 'Go to Dashboard' : 'Get Started for Free'}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          
          <Link
             href="/watch?videoId=dQw4w9WgXcQ"
             className="px-10 py-5 rounded-[2rem] font-bold text-lg transition-all duration-500 border border-white/10 glass hover:bg-white/10 active:scale-95 text-white flex items-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            Watch Demo
          </Link>
        </motion.div>

        {/* Feature Grid - Miniature */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Zap, title: "Zero Noise", desc: "No ads, no suggestions, just knowledge." },
            { icon: Shield, title: "Deep Work", desc: "Built-in Focus Timer & Privacy." },
            { icon: Target, title: "Roadmaps", desc: "AI-powered structured learning." }
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-card p-8 flex flex-col items-center group cursor-default"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-500">
                 <feat.icon size={24} />
              </div>
              <h3 className="text-white font-bold mb-2 uppercase tracking-widest text-[10px]">{feat.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
