'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { GraduationCap, LogIn, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type NavbarVariant = 'default' | 'minimal'

interface NavbarProps {
  variant?: NavbarVariant
}

export default function Navbar({ variant = 'default' }: NavbarProps) {
  const isMinimal = variant === 'minimal'
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/roadmap?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (err: any) {
      console.error('Auth Error:', err.message)
      alert(err.message || 'Check your Supabase GitHub keys setup.')
    }
  }

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSending(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      alert('Check your email for the magic login link!')
      setShowEmailInput(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
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
                placeholder="Search your roadmaps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </form>
        )}

        {/* Right side user/avatar */}
        <div className="ml-auto flex items-center gap-4">
          {!user ? (
            <div className="flex flex-col items-end gap-2">
              <form onSubmit={handleEmailLogin} className="flex items-center gap-3">
                <div className="relative">
                  <input 
                    type="email"
                    placeholder="Enter email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-48 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition-all focus:bg-white/10"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="group flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <LogIn size={16} className="transition-transform group-hover:translate-x-1" />
                  {isSending ? 'Sending...' : 'Sign In'}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end md:flex">
                <p className="text-xs font-bold text-gray-300 leading-none">{user.email?.split('@')[0]}</p>
                <button 
                  onClick={handleSignOut}
                  className="mt-1 text-[10px] font-bold text-indigo-400 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-sm font-bold text-indigo-400 shadow-xl shadow-indigo-500/10 transition-transform hover:scale-105">
                {user.email?.[0].toUpperCase() ?? <User size={18} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

