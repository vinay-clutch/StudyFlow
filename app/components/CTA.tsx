'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section
      id="pricing"
      className="relative py-32 px-6 overflow-hidden bg-black"
    >
      {/* Centered static blue blur */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full blur-[200px] opacity-70 bg-[radial-gradient(circle_at_center,#06b6d4,#1e3a8a)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            Ready to learn
            <br />
            <span className="gradient-text">without distractions?</span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join hundreds of students who transformed their learning experience. Start free, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="group px-10 py-5 bg-accent hover:bg-accent-hover text-white rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Free forever. No credit card required. Start in 30 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  )
}