'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { GraduationCap } from 'lucide-react'

type NavbarVariant = 'default' | 'minimal'

interface NavbarProps {
  variant?: NavbarVariant
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
  const isMinimal = variant === 'minimal'
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/roadmap?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            StudyFlow
          </span>
        </Link>

        {/* Center search (hidden on minimal) */}
        {!isMinimal && (
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 items-center justify-center md:flex"
          >
            <div className="w-full max-w-xl">
              <input
                type="text"
                placeholder="Search your roadmaps, videos, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:border-blue-500"
              />
            </div>
          </form>
        )}

        {/* Right side user/avatar */}
        <div className="ml-auto flex items-center gap-4">
          {!isMinimal && (
            <button className="hidden text-sm text-gray-400 hover:text-white md:inline-flex transition-colors">
              Feedback
            </button>
          )}
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-medium text-white">
            SF
          </button>
        </div>
      </div>
    </header>
  )
}

