import { useState, useCallback } from 'react'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type Prediction = {
  prediction: 'NORMAL' | 'PNEUMONIA'
  confidence: number
  raw_score: number
  threshold_used: number
}
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError(null)
    setStatus('idle')
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type.startsWith('image/')) handleFile(dropped)
  }, [])

  const handleReset = () => {       // ← outside handleAnalyzer
    setFile(null)
    setPreview(null)
    setResult(null)
    setStatus('idle')
    setError(null)
  }

  const handleAnalyzer = async () => {
    if (!file) return
    setStatus('loading')
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || `Server Error ${res.status}`)
      }
      const data: Prediction = await res.json()
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }                               

  const isNormal = result?.prediction === 'NORMAL'  

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-14 px-4">
      <div className="text-center mb-10">
        <div className=''>
          




        </div>

      </div>
    </div>
  )
}                                