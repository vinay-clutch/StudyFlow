'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useEffect } from 'react'
import { LogIn, User, Search, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
      toast.error(err.message || 'Authentication failed. Please check your setup.')
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
      toast.success('Magic link sent!', {
        description: 'Check your email to sign in.'
      })
      setShowEmailInput(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/')
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
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSignIn}
                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-95"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
              
              <div className="h-4 w-px bg-white/10 mx-1" />

              <form onSubmit={handleEmailLogin} className="flex items-center gap-2">
                <input 
                  type="email"
                  placeholder="Email login..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-40 rounded-xl border border-white/5 bg-zinc-900/50 px-3 py-1.5 text-[10px] text-white outline-none focus:border-white/20 transition-all font-medium"
                />
                <button 
                  type="submit"
                  disabled={isSending}
                  className="rounded-xl bg-white px-4 py-1.5 text-[10px] font-black text-black transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 uppercase tracking-tight"
                >
                  {isSending ? '...' : 'Sign In'}
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
