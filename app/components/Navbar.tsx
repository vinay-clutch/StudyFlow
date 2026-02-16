'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { LogIn, User, Search, GraduationCap } from 'lucide-react'
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
    <nav className="fixed left-0 right-0 top-0 z-[100] border-b border-white/5 bg-[#09090b]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black shadow-lg">
            <span className="text-lg font-black">S</span>
          </div>
          <span className="text-lg font-black text-white tracking-tighter font-outfit">StudyFlow.</span>
        </Link>

        {/* Dynamic Search - Only visible after sign-in */}
        {user && (
          <div className="ml-12 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={14} />
              <input 
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 rounded-xl border border-white/5 bg-zinc-900 py-1.5 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-white/20 transition-all focus:bg-zinc-800"
              />
            </div>
          </div>
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
                    className="w-48 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSending}
                  className="group flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
                >
                  <LogIn size={16} className="transition-transform group-hover:translate-x-1" />
                  {isSending ? 'Sending...' : 'Sign In'}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end md:flex">
                <p className="text-xs font-bold text-zinc-400 leading-none">{user.email?.split('@')[0]}</p>
                <button 
                  onClick={handleSignOut}
                  className="mt-1 text-[10px] font-bold text-zinc-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <div className="group relative">
                <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-xs font-bold text-white transition-transform hover:scale-105 hover:bg-zinc-800">
                  {user.email?.[0].toUpperCase() ?? <User size={16} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
