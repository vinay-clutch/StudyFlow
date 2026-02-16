 'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import RoadmapCard from '../components/RoadmapCard'
import { deleteRoadmap, getRoadmapsAsync, type Roadmap } from '../../lib/storage'
import { Trash2, Loader2, FolderSearch } from 'lucide-react'

export default function RoadmapListPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  const fetchAll = async () => {
    setIsLoading(true)
    const allRoadmaps = await getRoadmapsAsync()
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
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [searchQuery])

  const handleDelete = async (id: string) => {
    await deleteRoadmap(id)
    fetchAll()
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-24">
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

        {isLoading && roadmaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-sm text-gray-500 font-medium">Loading Roadmaps...</p>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#090909] py-20 px-8 text-center">
            <div className="mb-4 rounded-full bg-white/5 p-4 text-gray-600">
               <FolderSearch size={48} />
            </div>
            <h3 className="text-lg font-medium text-white">No roadmaps found</h3>
            <p className="mt-2 max-w-xs text-sm text-gray-500">
               {searchQuery ? `No results for "${searchQuery}"` : "Build your first study roadmap to start organizing your educational content."}
            </p>
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

