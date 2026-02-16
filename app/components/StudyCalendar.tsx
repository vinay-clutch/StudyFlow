'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, Bell, Clock } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns'

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'study' | 'deadline' | 'meeting'
  reminder?: boolean
}

export default function StudyCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('studyflow_calendar_events')
    if (saved) setEvents(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('studyflow_calendar_events', JSON.stringify(events))
  }, [events])

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-gray-500">Plan your learning schedule & milestones.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest glass hover:bg-white/10 transition-all"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  const renderDays = () => {
    const days = []
    const date = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 0; i < 7; i++) {
       days.push(
         <div key={i} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-600 py-4">
           {date[i]}
         </div>
       )
    }
    return <div className="grid grid-cols-7 border-b border-white/5">{days}</div>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd')
        const cloneDay = day
        const dayEvents = events.filter(e => isSameDay(parseISO(e.date), cloneDay))

        days.push(
          <div
            key={day.toString()}
            className={`relative min-h-[120px] p-2 border-r border-b border-white/5 transition-all hover:bg-white/[0.02] cursor-pointer ${
              !isSameMonth(day, monthStart) ? 'opacity-20 pointer-events-none' : ''
            } ${isSameDay(day, selectedDate) ? 'bg-indigo-500/5' : ''}`}
            onClick={() => {
              setSelectedDate(cloneDay)
              setShowAddModal(true)
            }}
          >
            <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-indigo-400' : 'text-gray-400'}`}>
              {formattedDate}
            </span>
            <div className="mt-2 space-y-1">
              {dayEvents.map((e, idx) => (
                <div 
                  key={idx}
                  className="text-[10px] p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 truncate"
                >
                  {e.title}
                </div>
              ))}
            </div>
            {isSameDay(day, new Date()) && (
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
            )}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      )
      days = []
    }
    return <div className="border-l border-t border-white/5 rounded-2xl overflow-hidden">{rows}</div>
  }

  const addEvent = () => {
    if (!newEventTitle.trim()) return
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDate.toISOString(),
      type: 'study'
    }
    setEvents([...events, newEvent])
    setNewEventTitle('')
    setShowAddModal(false)
    
    // Notification simulation
    if (Notification.permission === 'granted') {
       new Notification('Event Added', { body: `Scheduled: ${newEventTitle}` })
    } else {
       Notification.requestPermission()
    }
  }

  return (
    <div className="glass-card !bg-black/40 !p-8 border border-white/5 shadow-2xl overflow-hidden relative">
      
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md glass-card !p-8 bg-[#090909]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">New Milestone</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest font-bold">
              Date: {format(selectedDate, 'PPP')}
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Event Title</label>
                <input 
                  type="text" 
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="What's the goal?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                 <Bell size={18} className="text-indigo-400" />
                 <span className="text-sm text-gray-300">Enable notification reminders</span>
                 <input type="checkbox" defaultChecked className="ml-auto accent-indigo-500" />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={addEvent}
                className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all transform active:scale-95"
              >
                Save Milestone
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
