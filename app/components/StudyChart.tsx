'use client'

import { BarChart } from 'lucide-react'

export default function StudyChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = [2, 3, 1.5, 4, 2.5, 3, 1]

  const total = hours.reduce((a, b) => a + b, 0)

  return (
    <div className="glass-card !p-8 border border-white/5">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <BarChart size={18} />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Activity</h3>
        </div>
        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">7 Days</span>
      </div>

      <div className="flex h-48 items-end justify-between gap-3">
        {days.map((day, i) => (
          <div key={day} className="flex flex-1 flex-col items-center group">
            <div className="relative w-full">
              <div
                className="w-full rounded-xl bg-indigo-600/40 transition-all duration-500 group-hover:bg-indigo-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                style={{ height: `${(hours[i] / 4) * 100}%` }}
              />
            </div>
            <span className="mt-4 text-[10px] font-black text-gray-600 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{day}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
        <div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Hours</p>
          <p className="text-3xl font-black text-white font-outfit">{total}h</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Goal Status</p>
          <p className="text-sm font-black text-indigo-400 font-outfit">On Track 🚀</p>
        </div>
      </div>
    </div>
  )
}

