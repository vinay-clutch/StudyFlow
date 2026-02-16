 'use client'

import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RoadmapCard from '../components/RoadmapCard'
import ProgressBar from '../components/ProgressBar'
import StudyChart from '../components/StudyChart'
import { getRoadmaps, type Roadmap } from '../../lib/storage'

export default function DashboardPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])

  useEffect(() => {
    setRoadmaps(getRoadmaps())
  }, [])

  const totalRoadmaps = roadmaps.length
  const totalVideos = roadmaps.reduce((sum, r) => sum + r.videos.length, 0)
  const completionRate =
    totalRoadmaps === 0
      ? 0
      : Math.round(
          roadmaps.reduce((sum, r) => sum + (r.totalProgress ?? 0), 0) /
            totalRoadmaps,
        )

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-8">
        {/* Stats */}
        <section className="mb-10">
          <h1 className="mb-6 text-2xl font-semibold text-white">Overview</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
              <p className="text-xs text-gray-400">Total Roadmaps</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {totalRoadmaps}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
              <p className="text-xs text-gray-400">Videos</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {totalVideos}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
              <p className="text-xs text-gray-400">Hours Learned</p>
              <p className="mt-2 text-3xl font-semibold text-white">—</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#18181b] p-6">
              <p className="text-xs text-gray-400">Completion Rate</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {completionRate}%
              </p>
            </div>
          </div>
        </section>

        {/* Study chart */}
        <section className="mb-12">
          <StudyChart />
        </section>

        {/* Roadmaps */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Roadmaps</h2>
            <a
              href="/roadmap/create"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/30 transition-transform duration-200 hover:scale-105 hover:bg-blue-500"
            >
              Create New
            </a>
          </div>

          {roadmaps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#050505] p-8 text-sm text-gray-400">
              You don&apos;t have any roadmaps yet. Create one to start tracking
              your learning.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <RoadmapCard key={roadmap.id} roadmap={roadmap} />
              ))}
            </div>
          )}
        </section>

        {/* Continue learning (placeholder for last watched) */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Continue Learning
          </h2>
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#18181b] p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Resume your last watched video (coming soon).
              </p>
            </div>
            <div className="w-full max-w-xs">
              <ProgressBar progress={0} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

