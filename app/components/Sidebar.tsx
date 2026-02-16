'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Library, MonitorPlay, FolderSearch, Plus } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Planner', href: '/planner', icon: CheckSquare },
  { label: 'My Roadmaps', href: '/roadmap', icon: FolderSearch },
  { label: 'Watch', href: '/watch', icon: MonitorPlay },
  { label: 'Study Library', href: '/analytics', icon: Library },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-[#09090b]">
      <div className="flex h-full flex-col justify-between px-6 py-10">
        <div className="space-y-12">
           <div className="px-2">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Navigation</h3>
             <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-100 text-black'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={`transition-transform ${isActive ? 'scale-100' : 'group-hover:scale-105'}`} />
                    <span className="font-outfit tracking-wide">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
           </div>
        </div>

        <div className="space-y-6">
           <div className="rounded-2xl bg-zinc-900 border border-white/5 p-6">
              <p className="text-xs font-bold text-white mb-2">Build your path</p>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">Ready to start a new learning journey?</p>
              <Link
                href="/roadmap/create"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-black hover:bg-zinc-200 transition-all active:scale-95"
              >
                <Plus size={16} />
                <span>Create Roadmap</span>
              </Link>
           </div>
        </div>
      </div>
    </aside>
  )
}

