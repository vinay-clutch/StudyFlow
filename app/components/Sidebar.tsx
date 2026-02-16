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
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-black/80 backdrop-blur-2xl">
      <div className="flex h-full flex-col justify-between px-6 py-10">
        <div className="space-y-12">
           <div className="px-2">
             <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-6">Navigation</h3>
             <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-xs font-bold transition-all duration-500 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'
                        : 'text-gray-500 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-outfit tracking-wide">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
           </div>
        </div>

        <div className="space-y-6">
           <div className="rounded-3xl bg-indigo-600/5 p-6 border border-indigo-500/10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Build your path</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-4 font-medium">Ready to start a new learning journey?</p>
              <Link
                href="/roadmap/create"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
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

