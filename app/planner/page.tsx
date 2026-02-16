'use client'

import { useState, useEffect } from 'react'
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

      <main className="ml-64 px-8 pb-16 pt-8">
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">Focus Planner</h1>
                {isSyncing && <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 animate-pulse">
                  <Cloud size={10} /> Syncing
                </div>}
              </div>
              <p className="mt-1 text-sm text-gray-400">Organize your study tasks and deadlines in one place.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-all">
                <Calendar size={16} />
                Calendar View
              </button>
            </div>
          </div>
        </header>

        {/* New Task Bar */}
        <form onSubmit={addTask} className="mb-10">
          <div className="relative group">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Type a new task and press Enter..."
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xl"
            />
            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={20} />
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
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${section.color.replace('/20', '')}`} />
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">{section.title}</h2>
                    <span className="text-xs bg-white/5 border border-white/10 text-gray-500 px-2 py-0.5 rounded-full">
                      {tasks.filter(t => t.status === section.status).length}
                    </span>
                  </div>
                  <button className="text-gray-600 hover:text-white transition-colors">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  {tasks.filter(t => t.status === section.status).map((task) => (
                    <div 
                      key={task.id}
                      className="group bg-[#090909] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all shadow-sm hover:shadow-blue-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={() => toggleStatus(task.id)}
                          className="mt-0.5 text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          {task.status === 'done' ? <CheckCircle2 size={18} className="text-green-500" /> : <Circle size={18} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${task.status === 'done' ? 'text-gray-600 line-through' : 'text-gray-200'} font-medium`}>
                            {task.title}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                              task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' : 
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Calendar size={10} />
                                {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
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
      </main>
    </div>
  )
}
