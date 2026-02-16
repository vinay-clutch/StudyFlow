'use client'

import { motion } from 'framer-motion'
import { Plus, Play, Edit, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: Plus,
    number: '01',
    title: 'Add Your Videos',
    description: 'Paste YouTube links or entire playlists. Build your custom learning roadmap.',
  },
  {
    icon: Play,
    number: '02',
    title: 'Watch Without Distractions',
    description: 'Clean player with no recommendations. Focus on what matters—learning.',
  },
  {
    icon: Edit,
    number: '03',
    title: 'Take Smart Notes',
    description: 'Markdown editor with timestamps. Click to jump to any moment in the video.',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Track Your Progress',
    description: 'See your completion rate, study time, and keep the momentum going.',
  },
]

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-32 px-6 bg-black"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            How it works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Four simple steps to transform how you learn from YouTube
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Card */}
              <div className="relative p-8 rounded-2xl bg-[#18181b] border border-white/10">
                {/* Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-accent" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}