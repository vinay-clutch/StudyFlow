import { createClient } from './supabase/client'
import { type Roadmap, type Video } from './storage'

const supabase = createClient()

export interface Task {
  id: string
  title: string
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  tags: string[]
}

// --- ROADMAPS ---

export async function fetchRoadmaps() {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching roadmaps:', error)
    return null
  }
  return data as Roadmap[]
}

export async function upsertRoadmap(roadmap: Roadmap) {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  const { error } = await supabase
    .from('roadmaps')
    .upsert({
      id: roadmap.id.includes('roadmap_') ? undefined : roadmap.id, // Handle new vs existing
      user_id: userId,
      name: roadmap.name,
      description: roadmap.description,
      videos: roadmap.videos,
      total_progress: roadmap.totalProgress,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error saving roadmap:', error)
    return false
  }
  return true
}

export async function deleteRoadmapFromDb(id: string) {
  const { error } = await supabase
    .from('roadmaps')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting roadmap:', error)
    return false
  }
  return true
}

// --- TASKS ---

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return null
  }
  return data as Task[]
}

export async function upsertTask(task: Task) {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id

  const { error } = await supabase
    .from('tasks')
    .upsert({
      id: task.id.length > 20 ? task.id : undefined, // UUID vs local timestamp ID
      user_id: userId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate,
      tags: task.tags
    })

  if (error) {
    console.error('Error saving task:', error)
    return false
  }
  return true
}

export async function deleteTaskFromDb(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting task:', error)
    return false
  }
  return true
}
