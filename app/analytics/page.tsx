'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { FileText, Plus, Trash2, Eye, Download, Upload, File, FileCode, Search, Filter, Loader2, Image as ImageIcon, FileUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface StudyNote {
  id: string
  title: string
  content: string
  type: 'note' | 'pdf' | 'markdown' | 'image'
  date: string
  fileSize?: string
  url?: string
}

export default function AnalyticsPage() {
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('studyflow_library')
    if (saved) setNotes(JSON.parse(saved))
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const note: StudyNote = {
        id: Date.now().toString(),
        title: file.name,
        content: `Uploaded ${type.toUpperCase()} file.`,
        type: type,
        date: new Date().toLocaleDateString(),
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        url: event.target?.result as string
      }
      setNotes([note, ...notes])
    }
    reader.readAsDataURL(file)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-indigo-500/30">
      <Navbar />
      <Sidebar />

      <main className="ml-64 px-8 pb-16 pt-8">
        <header className="mb-12 lg:flex lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tightest font-outfit">Study Library</h1>
            <p className="mt-2 text-sm text-gray-400 font-light">Secure vault for your research, documents and visual assets.</p>
          </div>
          
          <div className="mt-6 flex items-center gap-4 lg:mt-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search only this page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 rounded-2xl border border-white/5 bg-white/[0.03] py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500/50 transition-all focus:bg-white/[0.06] backdrop-blur-md"
              />
            </div>
            
            <button 
              onClick={() => setIsAdding(true)}
              className="group flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-3 text-sm font-bold transition-all hover:bg-white/90 active:scale-95 shadow-xl shadow-white/5"
            >
              <Plus size={18} />
              New Note
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl glass hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
                title="Upload PDF"
              >
                <FileUp size={20} />
              </button>
              <button 
                onClick={() => imageInputRef.current?.click()}
                className="p-3 rounded-2xl glass hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
                title="Upload Image"
              >
                <ImageIcon size={20} />
              </button>
            </div>
            
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'pdf')} />
            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
          </div>
        </header>

        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12 glass-card !p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <div className="space-y-6">
                <input 
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Note Title"
                  className="w-full bg-transparent text-2xl font-black text-white outline-none placeholder:text-gray-800 font-outfit"
                  autoFocus
                />
                <textarea 
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="Capture your thoughts..."
                  rows={4}
                  className="w-full bg-transparent text-gray-300 outline-none resize-none placeholder:text-gray-800 text-lg font-light leading-relaxed"
                />
                <div className="flex justify-end gap-6 pt-6 border-t border-white/5">
                  <button onClick={() => setIsAdding(false)} className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
                    Discard
                  </button>
                  <button 
                    onClick={addNote}
                    className="rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    Save to Library
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] border border-dashed border-white/5 glass bg-white/[0.01]">
            <div className="mb-6 rounded-3xl bg-indigo-500/10 p-6 glow-indigo">
              <FileText className="text-indigo-400" size={48} />
            </div>
            <p className="text-2xl font-black text-white font-outfit">Library is clear</p>
            <p className="text-gray-500 mt-2 font-light">Add notes or drag & drop files to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredNotes.map((note) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={note.id}
                className="group relative flex flex-col glass-card !p-8 hover:border-indigo-500/40 cursor-default"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    note.type === 'pdf' ? 'bg-red-500/10 text-red-400' : 
                    note.type === 'image' ? 'bg-green-500/10 text-green-400' :
                    'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {note.type === 'pdf' ? <File size={24} /> : 
                     note.type === 'image' ? <ImageIcon size={24} /> : 
                     <FileText size={24} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteNote(note.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-white truncate font-outfit">{note.title}</h3>
                <p className="mb-8 line-clamp-3 text-sm text-gray-400 leading-relaxed font-light">
                  {note.content}
                </p>

                {note.url && note.type === 'image' && (
                  <div className="mb-6 rounded-xl overflow-hidden border border-white/10 aspect-video">
                    <img src={note.url} alt={note.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none mb-1">{note.date}</span>
                    {note.fileSize && <span className="text-[10px] text-gray-500 font-medium">{note.fileSize}</span>}
                  </div>
                  <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-bold uppercase tracking-tighter">{note.type}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
