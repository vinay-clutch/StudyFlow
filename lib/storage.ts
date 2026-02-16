// Local storage helpers and core StudyFlow data structures.
// All functions are safe to call in a Next.js environment (no-ops on server).

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
    // Swallow quota errors but log to console for debugging.
    // Consumers can choose to surface a toast based on operation result in the future.
    console.error('Failed to save StudyFlow roadmaps to localStorage', error)
  }
}

function computeRoadmapProgress(roadmap: Roadmap): number {
  const total = roadmap.videos.length
  if (total === 0) return 0

  const completed = roadmap.videos.filter((v) => v.completed || v.progress >= 100).length
  return Math.round((completed / total) * 100)
}

export function getRoadmaps(): Roadmap[] {
  const roadmaps = readRoadmaps()
  // Ensure totalProgress is always populated / normalized.
  return roadmaps.map((roadmap) => ({
    ...roadmap,
    totalProgress: computeRoadmapProgress(roadmap),
  }))
}

export function saveRoadmap(roadmap: Roadmap): void {
  const existing = getRoadmaps()
  const now = new Date().toISOString()
  const normalized: Roadmap = {
    ...roadmap,
    updatedAt: now,
    totalProgress: computeRoadmapProgress(roadmap),
  }

  const index = existing.findIndex((r) => r.id === roadmap.id)
  if (index === -1) {
    // If createdAt was not set, initialize it.
    if (!normalized.createdAt) {
      normalized.createdAt = now
    }
    existing.push(normalized)
  } else {
    existing[index] = { ...existing[index], ...normalized }
  }

  writeRoadmaps(existing)
}

export function deleteRoadmap(id: string): void {
  const existing = getRoadmaps()
  const updated = existing.filter((r) => r.id !== id)
  writeRoadmaps(updated)
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
    video.id === videoId
      ? {
          ...video,
          notes,
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
}

export function markVideoComplete(roadmapId: string, videoId: string): void {
  updateVideoProgress(roadmapId, videoId, 100)
}

