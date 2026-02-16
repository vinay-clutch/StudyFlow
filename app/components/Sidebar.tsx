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
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="flex h-full flex-col justify-between px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <Link
            href="/roadmap/create"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-transform duration-200 hover:scale-105 hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            <span>Create Roadmap</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}

