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
      className="group relative block h-full overflow-hidden rounded-[2rem] border border-white/5 bg-[#090909] transition-all duration-500 hover:scale-[1.02] hover:border-indigo-500/30 shadow-2xl"
    >
      {roadmap.videos.length > 0 && (
        <div className="relative h-56 overflow-hidden">
          <Image
            src={roadmap.videos[0].thumbnail}
            alt={roadmap.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/20 to-transparent" />
          <div className="absolute bottom-4 left-6">
             <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-600/20">
               {roadmap.videos.length} Modules
             </span>
          </div>
        </div>
      )}

      <div className="p-8">
        <h3 className="mb-2 line-clamp-1 text-2xl font-black text-white font-outfit tracking-tight">{roadmap.name}</h3>
        <p className="mb-6 line-clamp-2 text-sm text-gray-500 font-light leading-relaxed">{roadmap.description}</p>

        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Mastery</span>
            <span className="text-sm font-black text-indigo-400 font-outfit">{roadmap.totalProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.03] border border-white/5">
            <div
              className="h-full rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all duration-1000"
              style={{ width: `${roadmap.totalProgress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

