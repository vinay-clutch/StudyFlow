'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StudyCalendar from '../components/StudyCalendar'
import { Plus, Trash2, CheckCircle2, Circle, Calendar, Tag, ChevronDown, MoreVertical, Loader2, Cloud, List as ListIcon } from 'lucide-react'
import { fetchTasks, upsertTask, deleteTaskFromDb, type Task } from '@/lib/supabase-service'

export default function PlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Load tasks from Supabase
  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true)
      const data = await fetchTasks()
      if (data) {
        setTasks(data)
      } else {
        // Fallback to local
        const saved = localStorage.getItem('studyflow_tasks')
        if (saved) setTasks(JSON.parse(saved))
      }
      setIsLoading(false)
    }
    loadTasks()
  }, [])

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
    
    // Optimistic update
    setTasks([newTask, ...tasks])
    setNewTaskTitle('')
    
    // Sync to Supabase
    await upsertTask(newTask)
    setIsSyncing(false)
  }

  const toggleStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const nextStatus: Task['status'] = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo'
    const updatedTask = { ...task, status: nextStatus }

    // Optimistic update
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

  const sections: { title: string; status: Task['status']; color: string }[] = [
    { title: 'To Do', status: 'todo', color: 'bg-gray-500/20' },
    { title: 'In Progress', status: 'doing', color: 'bg-blue-500/20' },
    { title: 'Completed', status: 'done', color: 'bg-green-500/20' }
  ]

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-32">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-white tracking-tightest font-outfit">Focus Planner</h1>
                {isSyncing && <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 animate-pulse">
                  <Cloud size={10} /> Syncing
                </div>}
              </div>
              <p className="mt-2 text-sm text-gray-400 font-light">Optimize your deep work sessions and daily habits.</p>
            </div>
            <div className="flex items-center gap-2 p-1.5 glass rounded-2xl border border-white/5">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
              >
                <ListIcon size={14} />
                List
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
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
            {/* Contribution Graph - Notion/GitHub style */}
            <section className="glass-card !p-8 border border-white/5">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Study Consistency</h3>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter">Your learning velocity</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 91 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 rounded-sm ${i % 7 === 0 ? 'bg-indigo-600/60' : i % 13 === 0 ? 'bg-indigo-400/30' : 'bg-white/[0.03]'} transition-all hover:scale-125 hover:rotate-12 cursor-pointer border border-white/5`}
                    title={`Day ${i + 1}: Study session completed`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-600 font-bold uppercase">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.03]" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-900/40" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600/60" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />
                </div>
                <span>More</span>
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Daily Habits */}
              <div className="xl:col-span-1 space-y-6">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest px-2">Daily Habits</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Morning Focus', done: true },
                    { name: 'Algorithm Drill', done: false },
                    { name: 'Project Build', done: true },
                    { name: 'Review Notes', done: false }
                  ].map((habit, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 glass rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${habit.done ? 'bg-indigo-600 border-indigo-600' : 'border-white/10 group-hover:border-indigo-500/30'}`}>
                        {habit.done && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className={`text-xs font-bold font-outfit ${habit.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{habit.name}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:border-indigo-500/30 hover:text-indigo-400 transition-all">
                  + Add Daily Habit
                </button>
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
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-gray-700 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all font-outfit"
                    />
                    <Plus className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-indigo-500 transition-colors" size={24} />
                  </div>
                </form>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                    <p className="text-sm text-gray-500">Loading your board...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {sections.map((section) => (
                      <div key={section.status} className="flex flex-col">
                        <div className="flex items-center justify-between mb-6 px-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-1.5 h-1.5 rounded-full ${section.color.replace('/20', '')} shadow-[0_0_10px_currentColor]`} />
                            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{section.title}</h2>
                            <span className="text-[10px] font-black text-indigo-400 px-2 py-0.5 rounded-md glass">
                              {tasks.filter(t => t.status === section.status).length}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {tasks.filter(t => t.status === section.status).map((task) => (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={task.id}
                              className="group glass-card !p-5 hover:border-indigo-500/30 cursor-default"
                            >
                              <div className="flex items-start gap-3">
                                <button 
                                  onClick={() => toggleStatus(task.id)}
                                  className="mt-1 transition-all transform hover:scale-110 active:scale-90"
                                >
                                  {task.status === 'done' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-gray-700 hover:text-indigo-400" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold font-outfit ${task.status === 'done' ? 'text-gray-600 line-through' : 'text-gray-100'} leading-tight`}>
                                    {task.title}
                                  </p>
                                  <div className="mt-4 flex items-center gap-3">
                                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${
                                      task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                                      'bg-indigo-500/10 text-indigo-400'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    {task.dueDate && (
                                      <span className="text-[9px] text-gray-600 font-bold flex items-center gap-1 uppercase tracking-tighter">
                                        <Calendar size={10} />
                                        {task.dueDate}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  onClick={() => deleteTask(task.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-700 hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </motion.div>
                          ))}

                          {tasks.filter(t => t.status === section.status).length === 0 && (
                            <div className="border border-dashed border-white/5 rounded-xl py-8 text-center">
                              <p className="text-xs text-gray-700 font-medium italic">Empty</p>
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
