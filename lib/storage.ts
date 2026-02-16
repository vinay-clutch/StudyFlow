// Local storage helpers and core StudyFlow data structures.
// All functions are safe to call in a Next.js environment (no-ops on server).

import { fetchRoadmaps, upsertRoadmap, deleteRoadmapFromDb } from './supabase-service'

export interface Timestamp {
  time: number // seconds
  note: string
}

export interface Video {
  id: string
  youtubeId: string
  title: string
  thumbnail: string
  duration: string
  completed: boolean
  progress: number // 0-100
  notes: string // Markdown notes
  timestamps: Timestamp[]
}

export interface Roadmap {
  id: string
  name: string
  description: string
  videos: Video[]
  createdAt: string
  updatedAt: string
  totalProgress: number // calculated from videos
}

const STORAGE_KEY = 'studyflow_roadmaps'
const VIDEO_POSITION_KEY = 'studyflow_video_positions'

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function readRoadmaps(): Roadmap[] {
  if (!isBrowser()) return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return safeParse<Roadmap[]>(raw, [])
}

function writeRoadmaps(roadmaps: Roadmap[]) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps))
  } catch (error) {
    console.error('Failed to save StudyFlow roadmaps to localStorage', error)
  }
}

function computeRoadmapProgress(roadmap: Roadmap): number {
  const total = roadmap.videos.length
  if (total === 0) return 0

  const completed = roadmap.videos.filter((v) => v.completed || v.progress >= 100).length
  return Math.round((completed / total) * 100)
}

// --- SYNC / LOCAL STORAGE (LEGACY SUPPORT) ---

export function getRoadmaps(): Roadmap[] {
  const roadmaps = readRoadmaps()
  return roadmaps.map((roadmap) => ({
    ...roadmap,
    totalProgress: computeRoadmapProgress(roadmap),
  }))
}

export function saveRoadmapLocal(roadmap: Roadmap): void {
  const existing = getRoadmaps()
  const now = new Date().toISOString()
  const normalized: Roadmap = {
    ...roadmap,
    updatedAt: now,
    totalProgress: computeRoadmapProgress(roadmap),
  }

  const index = existing.findIndex((r) => r.id === roadmap.id)
  if (index === -1) {
    if (!normalized.createdAt) normalized.createdAt = now
    existing.push(normalized)
  } else {
    existing[index] = { ...existing[index], ...normalized }
  }

  writeRoadmaps(existing)
}

// --- ASYNC / SUPABASE FIRST (RECOMMENDED) ---

export async function getRoadmapsAsync(): Promise<Roadmap[]> {
  const dbData = await fetchRoadmaps()
  if (dbData) {
    // Sync to local as well for offline use
    writeRoadmaps(dbData)
    return dbData
  }
  return getRoadmaps()
}

export async function saveRoadmap(roadmap: Roadmap): Promise<void> {
  // Always save local first for speed
  saveRoadmapLocal(roadmap)
  
  // Try to sync with Supabase
  await upsertRoadmap(roadmap)
}

export async function deleteRoadmap(id: string): Promise<void> {
  const existing = getRoadmaps()
  const updated = existing.filter((r) => r.id !== id)
  writeRoadmaps(updated)
  
  await deleteRoadmapFromDb(id)
}

export function updateVideoProgress(
  roadmapId: string,
  videoId: string,
  progress: number,
): void {
  const roadmaps = getRoadmaps()
  const roadmapIndex = roadmaps.findIndex((r) => r.id === roadmapId)
  if (roadmapIndex === -1) return

  const roadmap = roadmaps[roadmapIndex]
  const videos = roadmap.videos.map((video) =>
    video.id === videoId
      ? {
          ...video,
          progress: Math.max(0, Math.min(100, progress)),
          completed: progress >= 100 ? true : video.completed,
        }
      : video,
  )

  const updatedRoadmap: Roadmap = {
    ...roadmap,
    videos,
    updatedAt: new Date().toISOString(),
    totalProgress: computeRoadmapProgress({ ...roadmap, videos }),
  }

  roadmaps[roadmapIndex] = updatedRoadmap
  writeRoadmaps(roadmaps)
  
  // Background sync if possible
  upsertRoadmap(updatedRoadmap)
}

export function saveNotes(
  roadmapId: string,
  videoId: string,
  notes: string,
): void {
  const roadmaps = getRoadmaps()
  const roadmapIndex = roadmaps.findIndex((r) => r.id === roadmapId)
  if (roadmapIndex === -1) return

  const roadmap = roadmaps[roadmapIndex]
  const videos = roadmap.videos.map((video) =>
    video.id === videoId ? { ...video, notes } : video,
  )

  const updatedRoadmap: Roadmap = {
    ...roadmap,
    videos,
    updatedAt: new Date().toISOString(),
    totalProgress: computeRoadmapProgress({ ...roadmap, videos }),
  }

  roadmaps[roadmapIndex] = updatedRoadmap
  writeRoadmaps(roadmaps)
  
  // Background sync
  upsertRoadmap(updatedRoadmap)
}

export function markVideoComplete(roadmapId: string, videoId: string): void {
  updateVideoProgress(roadmapId, videoId, 100)
}

type VideoPositionMap = Record<string, number>

export function getVideoPosition(videoId: string): number {
  if (!isBrowser()) return 0
  const raw = window.localStorage.getItem(VIDEO_POSITION_KEY)
  const map = safeParse<VideoPositionMap>(raw, {})
  return map[videoId] ?? 0
}

export function saveVideoPosition(videoId: string, seconds: number): void {
  if (!isBrowser()) return
  try {
    const raw = window.localStorage.getItem(VIDEO_POSITION_KEY)
    const map = safeParse<VideoPositionMap>(raw, {})
    map[videoId] = seconds
    window.localStorage.setItem(VIDEO_POSITION_KEY, JSON.stringify(map))
  } catch (error) {
    console.error('Failed to save video position', error)
  }
}


