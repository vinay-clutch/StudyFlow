'use client'

import { Github, Twitter, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-6 bg-black">
      <div className="max-w-6xl mx-auto text-center space-y-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">StudyFlow</h3>
          <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
            Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for focused learning
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <Github className="w-4 h-4" />
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="text-gray-500 hover:text-white transition-colors">
            <Linkedin className="w-4 h-4" />
          </a>
        </div>

        <p className="text-sm text-gray-500 pt-4 border-t border-white/5">
          © 2026 StudyFlow. All rights reserved.
        </p>
      </div>
    </footer>
  )
}