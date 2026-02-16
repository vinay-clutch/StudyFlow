'use client'

import { motion } from 'framer-motion'
import { Eye, BookOpen, TrendingUp, Zap, Lock, Lightbulb } from 'lucide-react'

const features = [
  {
    icon: Eye,
    title: 'Distraction-Free Player',
    description:
      'Watch YouTube videos without recommendations, comments, or sidebar distractions. Pure focus.',
  },
  {
    icon: BookOpen,
    title: 'Built-in Notes',
    description:
      'Take markdown notes right beside your video. Timestamp your notes to jump back instantly.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description:
      "See exactly how much you've completed. Visual analytics keep you motivated.",
  },
  {
    icon: Zap,
    title: 'Custom Roadmaps',
    description:
      "Build your own learning paths. Add videos in your order, not YouTube's algorithm.",
  },
  {
    icon: Lock,
    title: 'Stay Focused',
    description:
      'No autoplay, no suggested videos. You control what comes next in your learning journey.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Bookmarks',
    description:
      'Mark important sections, create highlights, and build your personal knowledge base.',
  },
]

const iconGradients = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600',
]

export default function Features() {
  return (
    <section id="features" className="relative py-24 px-6 bg-black">
      {/* Subtle radial background behind cards */}
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-full max-w-5xl h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_60%)] opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Everything you need to
            <br />
            <span className="gradient-text">learn faster</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built by students, for students. No distractions, just pure learning.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#18181b] backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02] hover:border-[rgba(59,130,246,0.3)] shadow-[0_24px_60px_rgba(0,0,0,0.5),_inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:shadow-[0_32px_80px_rgba(59,130,246,0.2),_inset_0_1px_0_0_rgba(255,255,255,0.05)]"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradients[index]} shadow-lg shadow-blue-500/50 transition-transform duration-300 group-hover:rotate-3`}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="mb-3 text-xl font-semibold tracking-tight text-white">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}