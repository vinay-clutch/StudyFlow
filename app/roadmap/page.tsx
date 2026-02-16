 'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RoadmapCard from '../components/RoadmapCard'
import { deleteRoadmap, getRoadmaps, type Roadmap } from '../../lib/storage'
import { Trash2 } from 'lucide-react'

export default function RoadmapListPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    const allRoadmaps = getRoadmaps()
    if (searchQuery) {
      const lowered = searchQuery.toLowerCase()
      const filtered = allRoadmaps.filter(
        (roadmap) =>
          roadmap.name.toLowerCase().includes(lowered) ||
          roadmap.description.toLowerCase().includes(lowered),
      )
      setRoadmaps(filtered)
    } else {
      setRoadmaps(allRoadmaps)
    }
  }, [searchQuery])

  const handleDelete = (id: string) => {
    deleteRoadmap(id)
    const allRoadmaps = getRoadmaps()
    if (searchQuery) {
      const lowered = searchQuery.toLowerCase()
      setRoadmaps(
        allRoadmaps.filter(
          (roadmap) =>
            roadmap.name.toLowerCase().includes(lowered) ||
            roadmap.description.toLowerCase().includes(lowered),
        ),
      )
    } else {
      setRoadmaps(allRoadmaps)
    }
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-8">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">My Roadmaps</h1>
            <p className="text-sm text-gray-400">
              Organize your learning journeys and track progress.
            </p>
          </div>
          <a
            href="/roadmap/create"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/30 transition-transform duration-200 hover:scale-105 hover:bg-blue-500"
          >
            Create New
          </a>
        </header>

        {searchQuery && (
          <p className="mb-4 text-sm text-gray-400">
            Search results for: &quot;{searchQuery}&quot;
          </p>
        )}

        {roadmaps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#050505] p-8 text-sm text-gray-400">
            No roadmaps yet. Click &quot;Create New&quot; to start building your
            first roadmap.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((roadmap) => (
              <div key={roadmap.id} className="relative">
                <RoadmapCard roadmap={roadmap} />
                <button
                  type="button"
                  onClick={() => handleDelete(roadmap.id)}
                  className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-black/70 p-1.5 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

