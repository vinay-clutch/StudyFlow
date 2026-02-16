'use client'

import { BarChart } from 'lucide-react'

export default function StudyChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = [2.5, 3.8, 1.5, 5.2, 3.0, 4.5, 2.0]

  const max = Math.max(...hours)
  const total = hours.reduce((a, b) => a + b, 0).toFixed(1)

  return (
    <div className="glass-card !p-8 border border-white/5 bg-[#09090b]">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-800 text-white">
            <BarChart size={18} />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none">Activity</h3>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Last 7 Days</span>
      </div>

      <div className="flex h-52 items-end justify-between gap-4">
        {days.map((day, i) => {
          const heightPct = (hours[i] / max) * 100
          return (
            <div key={day} className="flex flex-1 flex-col items-center group relative h-full justify-end">
              <div 
                className="w-full rounded-t-lg bg-zinc-800 transition-all duration-500 group-hover:bg-blue-600 relative overflow-hidden"
                style={{ height: `${heightPct}%` }}
              >
                 <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold bg-white text-black px-2 py-1 rounded-md mb-1 transform translate-y-2 group-hover:translate-y-0">
                {hours[i]}h
              </div>

              <span className="mt-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">{day}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Hours</p>
          <p className="text-3xl font-black text-white font-outfit tracking-tight">{total}<span className="text-lg text-zinc-600 font-medium">h</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Weekly Goal</p>
          <p className="text-sm font-bold text-emerald-400 font-outfit flex items-center justify-end gap-2">
            On Track <span className="text-xs bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-500">92%</span>
          </p>
        </div>
      </div>
    </div>
  )
}

