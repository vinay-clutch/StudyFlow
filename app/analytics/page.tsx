'use client'

import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { FileText, Plus, Trash2, Eye, Download, Upload, File, FileCode, Search, Filter, Loader2 } from 'lucide-react'

interface StudyNote {
  id: string
  title: string
  content: string
  type: 'note' | 'pdf' | 'markdown'
  date: string
  fileSize?: string
}

export default function AnalyticsPage() {
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState({ title: '', content: '' })

  useEffect(() => {
    // Load from local storage for now
    const saved = localStorage.getItem('studyflow_library')
    if (saved) {
      setNotes(JSON.parse(saved))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    localStorage.setItem('studyflow_library', JSON.stringify(notes))
  }, [notes])

  const addNote = () => {
    if (!newNote.title.trim()) return
    const note: StudyNote = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      type: 'note',
      date: new Date().toLocaleDateString(),
    }
    setNotes([note, ...notes])
    setNewNote({ title: '', content: '' })
    setIsAdding(false)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-foreground">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-8">
        <header className="mb-10 lg:flex lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Study Library</h1>
            <p className="mt-1 text-sm text-gray-500">Your collection of notes, research, and uploaded documents.</p>
          </div>
          <div className="mt-4 flex items-center gap-3 lg:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} />
              Add Note
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-all">
              <Upload size={18} />
              Upload PDF
            </button>
          </div>
        </header>

        {isAdding && (
          <div className="mb-10 rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-4">
              <input 
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="Note Title"
                className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-gray-700"
              />
              <textarea 
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder="Write your study findings here..."
                rows={4}
                className="w-full bg-transparent text-gray-300 outline-none resize-none placeholder:text-gray-700"
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={addNote}
                  className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 transition-all"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 rounded-3xl border border-dashed border-white/5 bg-white/[0.02]">
            <div className="mb-4 rounded-full bg-blue-500/10 p-4">
              <FileText className="text-blue-500" size={32} />
            </div>
            <p className="text-lg font-medium text-gray-300">Your library is empty</p>
            <p className="text-sm text-gray-500 mt-1">Start by adding your first study note or uploading a PDF.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div 
                key={note.id}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-[#090909] p-6 hover:border-blue-500/30 hover:bg-[#0c0c0c] transition-all shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${note.type === 'pdf' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {note.type === 'pdf' ? <File size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteNote(note.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-500 transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="mb-2 text-lg font-bold text-white truncate">{note.title}</h3>
                <p className="mb-6 line-clamp-3 text-sm text-gray-400 leading-relaxed font-normal">
                  {note.content || "No description provided."}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{note.date}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 font-bold uppercase">{note.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
