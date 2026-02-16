'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RoadmapCard from '../components/RoadmapCard'
import ProgressBar from '../components/ProgressBar'
import StudyChart from '../components/StudyChart'
import NeedToWatch from '../components/NeedToWatch'
import { getRoadmapsAsync, type Roadmap } from '../../lib/storage'
import { BookOpen, PlayCircle, Clock, CheckCircle, Loader2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
      }
    }
    checkUser()
  }, [])

  const refreshData = async () => {
    setIsLoading(true)
    const data = await getRoadmapsAsync()
    setRoadmaps(data)
    setIsLoading(false)
  }

  useEffect(() => {
    setMounted(true)
    refreshData()

    // Refresh when window gets focus
    window.addEventListener('focus', refreshData)
    return () => window.removeEventListener('focus', refreshData)
  }, [])

  if (!mounted) return null

  const totalRoadmaps = roadmaps.length
  const totalVideos = roadmaps.reduce((sum, r) => sum + r.videos.length, 0)
  
  // Calculate completion rate more accurately
  const totalProgressSum = roadmaps.reduce((sum, r) => sum + (r.totalProgress ?? 0), 0)
  const completionRate = totalRoadmaps === 0 ? 0 : Math.round(totalProgressSum / totalRoadmaps)

  // Estimate hours learned (dummy calc for now: 20 mins per completed video or equivalent progress)
  const estimatedSeconds = roadmaps.reduce((sum, r) => {
    return sum + r.videos.reduce((vSum, v) => vSum + (v.progress > 0 ? (v.progress / 100) * 1200 : 0), 0)
  }, 0)
  const estimatedHours = (estimatedSeconds / 3600).toFixed(1)

  const stats = [
    { label: 'Total Roadmaps', value: totalRoadmaps, icon: BookOpen, color: 'text-indigo-500' },
    { label: 'Videos Added', value: totalVideos, icon: PlayCircle, color: 'text-purple-500' },
    { label: 'Hours Learned', value: estimatedHours, icon: Clock, color: 'text-orange-500' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: CheckCircle, color: 'text-emerald-500' },
  ]

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-indigo-500/30">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-24">
        {isLoading && roadmaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Digitalizing Roadmaps...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <section className="mb-10">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                <p className="text-sm text-zinc-500 mt-1">Track your growth and learning milestones.</p>
              </header>
          
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <div key={i} className="group relative glass-card !p-6 hover:border-blue-500/30 bg-[#09090b]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                        <p className="mt-2 text-3xl font-black text-white font-outfit">{stat.value}</p>
                      </div>
                      <div className={`rounded-xl bg-zinc-800 p-2.5 ${stat.color} transition-colors group-hover:bg-zinc-700`}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                    {/* Subtle bottom accent */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 transition-all group-hover:w-full" />
                  </div>
                ))}
              </div>
            </section>

        {/* Study chart */}
        <section className="mb-12">
          <StudyChart />
        </section>

        {/* Roadmaps */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Continue Your Journey</h2>
            <Link
              href="/roadmap/create"
              className="group flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              New Roadmap
            </Link>
          </div>

          {roadmaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#090909] py-20 px-8 text-center transition-all hover:border-white/20">
              <div className="mb-4 rounded-full bg-white/5 p-4 text-gray-600">
                <BookOpen size={48} />
              </div>
              <h3 className="text-lg font-medium text-white">No roadmaps yet</h3>
              <p className="mt-2 max-w-xs text-sm text-gray-500">
                Create your first study roadmap to start organizing your educational content.
              </p>
              <Link
                 href="/roadmap/create"
                 className="mt-6 text-sm font-bold text-indigo-500 hover:text-indigo-400 underline underline-offset-4"
              >
                Get Started →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} />
              ))}
            </div>
          )}
        </section>

        <NeedToWatch />

        {/* Recent Activity */}
        <section>
          <div className="rounded-2xl border border-white/10 bg-[#090909] p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md">
                <h3 className="text-lg font-semibold text-white">Smart Productivity</h3>
                <p className="mt-1 text-sm text-gray-400">
                   Soon, StudyFlow will use AI to summarize your notes and recommend the best time for your next study session.
                </p>
              </div>
              <button disabled className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-500 transition-all cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  )
}

