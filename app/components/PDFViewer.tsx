'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'

export default function PDFViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file)
      setPdfUrl(url)
      setFileName(file.name)
    }
  }

  const clearPDF = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
    setFileName('')
  }

  return (
    <div className="flex h-full flex-col">
      {!pdfUrl ? (
        <label className="flex h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 transition-colors hover:border-blue-500/50">
          <Upload className="mb-4 h-12 w-12 text-gray-500" />
          <span className="mb-1 text-sm text-gray-300">Upload PDF</span>
          <span className="text-xs text-gray-500">Click to select file</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/60">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <span className="truncate text-xs text-gray-300">{fileName}</span>
            <button
              type="button"
              onClick={clearPDF}
              className="text-gray-500 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <iframe src={pdfUrl ?? ''} className="h-full w-full flex-1" title="PDF Viewer" />
        </div>
      )}
    </div>
  )
}

