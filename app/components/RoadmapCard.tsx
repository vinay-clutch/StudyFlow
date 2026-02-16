import Link from 'next/link'
import Image from 'next/image'
import type { Roadmap } from '../../lib/storage'

interface RoadmapCardProps {
  roadmap: Roadmap
}

export default function RoadmapCard({ roadmap }: RoadmapCardProps) {
  const href =
    roadmap.videos.length > 0
      ? `/watch?videoId=${roadmap.videos[0].youtubeId}&roadmapId=${roadmap.id}`
      : `/roadmap`

  const completedCount = roadmap.videos.filter((v) => v.completed).length
  const completion =
    roadmap.videos.length > 0 ? Math.round((completedCount / roadmap.videos.length) * 100) : 0

  return (
    <Link
      href={href}
      className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-[#18181b] shadow-lg shadow-black/40 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/50"
    >
      {roadmap.videos.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={roadmap.videos[0].thumbnail}
            alt={roadmap.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}

      <div className="p-6">
        <h3 className="mb-2 line-clamp-1 text-xl font-semibold text-white">{roadmap.name}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-gray-400">{roadmap.description}</p>

        <div className="mb-4">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-blue-400">{roadmap.totalProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${roadmap.totalProgress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{roadmap.videos.length} videos</span>
          <span>{completion}% complete</span>
        </div>
      </div>
    </Link>
  )
}

