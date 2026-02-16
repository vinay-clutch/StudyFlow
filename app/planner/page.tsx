'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StudyCalendar from '../components/StudyCalendar'
import { Plus, Trash2, CheckCircle2, Circle, Calendar, List as ListIcon, Cloud, Loader2, Zap, ArrowLeft } from 'lucide-react'
import { fetchTasks, upsertTask, deleteTaskFromDb, type Task } from '@/lib/supabase-service'
import { format, subDays, isSameDay, parseISO } from 'date-fns'
import Link from 'next/link'

// Types
interface Habit {
  id: string
  name: string
  completedDates: string[] // ISO date strings YYYY-MM-DD
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Load data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      
      // Load Tasks
      const data = await fetchTasks()
      if (data) {
        setTasks(data)
      } else {
        const saved = localStorage.getItem('studyflow_tasks')
        if (saved) setTasks(JSON.parse(saved))
      }

      // Load Habits
      const savedHabits = localStorage.getItem('studyflow_habits')
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits))
      } else {
        // Default habits
        const defaults: Habit[] = [
          { id: '1', name: 'Morning Focus', completedDates: [] },
          { id: '2', name: 'Review Notes', completedDates: [] }
        ]
        setHabits(defaults)
      }

      setIsLoading(false)
    }
    loadData()
  }, [])

  // Save Habits effect
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('studyflow_habits', JSON.stringify(habits))
    }
  }, [habits, isLoading])

  // --- Task Handlers ---

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    setIsSyncing(true)
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
      tags: []
    }
    
    setTasks([newTask, ...tasks])
    setNewTaskTitle('')
    
    await upsertTask(newTask)
    setIsSyncing(false)
  }

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const nextStatus: Task['status'] = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo'
    const updatedTask = { ...task, status: nextStatus }

    setTasks(tasks.map(t => t.id === id ? updatedTask : t))
    
    setIsSyncing(true)
    await upsertTask(updatedTask)
    setIsSyncing(false)
  }

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
    setIsSyncing(true)
    await deleteTaskFromDb(id)
    setIsSyncing(false)
  }

  // --- Habit Handlers ---

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim()) return

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      completedDates: []
    }

    setHabits([...habits, newHabit])
    setNewHabitName('')
    setIsAddingHabit(false)
  }

  const deleteHabit = (id: string) => {
    if (confirm('Delete this habit?')) {
      setHabits(habits.filter(h => h.id !== id))
    }
  }

  const toggleHabit = (id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    setHabits(habits.map(h => {
      if (h.id === id) {
        const isCompleted = h.completedDates.includes(today)
        return {
          ...h,
          completedDates: isCompleted 
            ? h.completedDates.filter(d => d !== today)
            : [...h.completedDates, today]
        }
      }
      return h
    }))
  }

  // --- Consistency Logic ---
  const getConsistencyData = () => {
    const days = 91 // roughly 3 months
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      
      // Count completions for this day across all habits
      const completions = habits.reduce((acc, habit) => {
        return acc + (habit.completedDates.includes(dateStr) ? 1 : 0)
      }, 0)
      
      // Determine intensity level (0-4)
      let level = 0
      if (completions > 0) level = 1
      if (completions >= 2) level = 2
      if (completions >= 4) level = 3
      if (completions >= 6) level = 4 // rare but possible

      data.push({ date, level })
    }
    return data
  }

  const consistencyData = getConsistencyData()

  const sections: { title: string; status: Task['status']; color: string }[] = [
    { title: 'To Do', status: 'todo', color: 'bg-zinc-500/20' },
    { title: 'In Progress', status: 'doing', color: 'bg-blue-500/20' },
    { title: 'Completed', status: 'done', color: 'bg-emerald-500/20' }
  ]

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-32">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="p-2 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors">
                  <ArrowLeft size={16} className="text-zinc-400" />
                </Link>
                <h1 className="text-2xl font-black text-white tracking-tightest font-outfit">Focus Planner</h1>
                {isSyncing && <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 animate-pulse">
                  <Cloud size={10} /> Syncing
                </div>}
              </div>
              <p className="mt-2 text-xs text-zinc-400 font-light ml-12">Optimize your deep work sessions and daily habits.</p>
            </div>
            <div className="flex items-center gap-1 p-1.5 glass rounded-xl border border-white/5 bg-zinc-900/50">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <ListIcon size={14} />
                List
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                <Calendar size={14} />
                Calendar
              </button>
            </div>
          </div>
        </header>

        {viewMode === 'calendar' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <StudyCalendar />
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Contribution Graph */}
            <section className="glass-card !p-8 border border-white/5 bg-[#09090b]">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                     <Zap size={16} className="fill-current" />
                   </div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest">Habit Consistency</h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Last 90 Days</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {consistencyData.map((day, i) => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 cursor-pointer border border-white/5 ${
                      day.level === 0 ? 'bg-zinc-900' :
                      day.level === 1 ? 'bg-blue-900/60' :
                      day.level === 2 ? 'bg-blue-700/60' :
                      day.level === 3 ? 'bg-blue-500' :
                      'bg-blue-400'
                    }`}
                    title={`${format(day.date, 'MMM do')}: ${day.level > 0 ? 'Completed habits' : 'No activity'}`}
                  />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Daily Habits */}
              <div className="xl:col-span-1 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Daily Habits</h3>
                  <span className="text-xs text-zinc-600 font-mono">{habits.filter(h => h.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))).length}/{habits.length}</span>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence>
                    {habits.map((habit) => {
                      const isCompleted = habit.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))
                      return (
                        <motion.div 
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`group flex items-center gap-3 p-4 glass rounded-xl border transition-all cursor-pointer ${
                            isCompleted ? 'bg-blue-500/5 border-blue-500/20' : 'bg-black/20 border-white/5 hover:border-white/10'
                          }`}
                          onClick={() => toggleHabit(habit.id)}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-blue-500 border-blue-500' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                            {isCompleted && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className={`flex-1 text-sm font-medium ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{habit.name}</span>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id); }}
                            className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {isAddingHabit ? (
                    <form onSubmit={addHabit} className="flex gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="New habit name..."
                        className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600"
                        onBlur={() => !newHabitName && setIsAddingHabit(false)}
                      />
                      <button type="submit" className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-500">
                        <Plus size={16} />
                      </button>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setIsAddingHabit(true)}
                      className="w-full py-4 border border-dashed border-white/10 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/5 transition-all"
                    >
                      + Add Daily Habit
                    </button>
                  )}
                </div>
              </div>

              {/* Task Board */}
              <div className="xl:col-span-3">
                <form onSubmit={addTask} className="mb-10">
                  <div className="relative group">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Brain dump your tasks here..."
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:bg-zinc-900 transition-all font-outfit"
                    />
                    <Plus className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={24} />
                  </div>
                </form>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                    <p className="text-sm text-zinc-500">Loading your board...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {sections.map((section) => (
                      <div key={section.status} className="flex flex-col">
                        <div className="flex items-center justify-between mb-6 px-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-1.5 h-1.5 rounded-full ${section.color.replace('/20', '')} shadow-[0_0_10px_currentColor]`} />
                            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{section.title}</h2>
                            <span className="text-[10px] font-black text-blue-400 px-2 py-0.5 rounded-md glass bg-blue-500/10">
                              {tasks.filter(t => t.status === section.status).length}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <AnimatePresence>
                            {tasks.filter(t => t.status === section.status).map((task) => (
                              <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={task.id}
                                className="group glass-card !p-5 hover:border-blue-500/30 cursor-default bg-[#0A0A0A]"
                              >
                                <div className="flex items-start gap-3">
                                  <button 
                                    onClick={() => toggleTaskStatus(task.id)}
                                    className="mt-1 transition-all transform hover:scale-110 active:scale-90"
                                  >
                                    {task.status === 'done' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-zinc-600 hover:text-blue-400" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold font-outfit ${task.status === 'done' ? 'text-zinc-600 line-through' : 'text-zinc-200'} leading-tight`}>
                                      {task.title}
                                    </p>
                                    <div className="mt-4 flex items-center gap-3">
                                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                                        task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                                        'bg-blue-500/10 text-blue-400'
                                      }`}>
                                        {task.priority}
                                      </span>
                                      {task.dueDate && (
                                        <span className="text-[9px] text-zinc-600 font-bold flex items-center gap-1 uppercase tracking-tighter">
                                          <Calendar size={10} />
                                          {task.dueDate}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {tasks.filter(t => t.status === section.status).length === 0 && (
                            <div className="border border-dashed border-white/5 rounded-xl py-8 text-center">
                              <p className="text-xs text-zinc-700 font-medium italic">Empty</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
