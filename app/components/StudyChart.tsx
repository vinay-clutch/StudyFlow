'use client'

import { BarChart } from 'lucide-react'

export default function StudyChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = [2, 3, 1.5, 4, 2.5, 3, 1]

  const total = hours.reduce((a, b) => a + b, 0)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex items-center gap-2">
        <BarChart className="h-5 w-5 text-blue-500" />
        <h3 className="text-sm font-semibold text-white">This Week</h3>
      </div>

      <div className="flex h-40 items-end justify-between gap-2">
        {days.map((day, i) => (
          <div key={day} className="flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-500 transition-all hover:from-blue-500 hover:to-blue-400"
              style={{ height: `${(hours[i] / 4) * 100}%` }}
            />
            <span className="mt-2 text-xs text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="text-3xl font-bold text-blue-500">{total}h</div>
        <div className="text-sm text-gray-500">Total this week</div>
      </div>
    </div>
  )
}

