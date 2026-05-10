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
 
  const handleAnalyze = async () => {
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
        throw new Error(err.detail || `Server error: ${res.status}`)
      }
      const data: Prediction = await res.json()
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }
 
  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setStatus('idle')
    setError(null)
  }
 
  const isNormal = result?.prediction === 'NORMAL'
 
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-14 px-4">
 

      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🫁</div>
        <h1 className="text-3xl font-bold tracking-tight">
          Chest X-Ray Classifier
        </h1>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">NORMAL</span>
          <span className="text-gray-600 text-xs">vs</span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">PNEUMONIA</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !preview && document.getElementById('file-input')?.click()}
          className={`
            relative flex items-center justify-center transition-all duration-200
            ${preview ? 'cursor-default bg-gray-950' : 'cursor-pointer min-h-56'}
            ${dragging ? 'bg-blue-500/10 border-b-2 border-blue-500' : 'border-b border-gray-800'}
            ${!preview && !dragging ? 'hover:bg-gray-800/40' : ''}
          `}
        >
          {preview ? (
            <div className="relative w-full">
              <img
                src={preview}
                alt="X-Ray preview"
                className="w-full max-h-80 object-contain"
              />
              
              <button
                onClick={(e) => { e.stopPropagation(); handleReset() }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-900/80 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all
                ${dragging ? 'bg-blue-500/20 scale-110' : 'bg-gray-800'}
              `}>
                🩻
              </div>
              <div>
                <p className="text-gray-200 font-medium">Drop your X-Ray here</p>
                <p className="text-gray-500 text-sm mt-1">or click to browse files</p>
              </div>
              <p className="text-gray-600 text-xs">PNG · JPG · WEBP</p>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
 
        <div className="p-5 flex flex-col gap-4">
 

          {file && status !== 'success' && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm">
              <span className="text-gray-500 shrink-0">📎</span>
              <span className="text-gray-300 truncate flex-1">{file.name}</span>
              <span className="text-gray-500 shrink-0 text-xs">
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}
 

          {status !== 'success' && (
            <button
              onClick={handleAnalyze}
              disabled={!file || status === 'loading'}
              className={`
                w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                ${!file || status === 'loading'
                  ? 'bg-blue-600/30 text-blue-400/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                }
              `}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze X-Ray'
              )}
            </button>
          )}
 
          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="text-red-400 shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium">Analysis failed</p>
                <p className="text-red-400/70 text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="text-red-400/50 hover:text-red-400 text-xs shrink-0"
              >
                Try again
              </button>
            </div>
          )}
 
          {status === 'success' && result && (
            <div className={`
              rounded-xl border p-5 flex flex-col gap-4
              ${isNormal
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-red-500/5 border-red-500/20'
              }
            `}>
 

              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                  ${isNormal ? 'bg-green-500/15' : 'bg-red-500/15'}
                `}>
                  {isNormal ? '✅' : '🔴'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                    Prediction
                  </p>
                  <p className={`text-xl font-bold tracking-tight ${isNormal ? 'text-green-400' : 'text-red-400'}`}>
                    {result.prediction}
                  </p>
                </div>
                <div className={`
                  px-3 py-1.5 rounded-full text-sm font-bold shrink-0
                  ${isNormal
                    ? 'bg-green-500/15 text-green-300'
                    : 'bg-red-500/15 text-red-300'
                  }
                `}>
                  {result.confidence}%
                </div>
              </div>
 

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Confidence</span>
                  <span>{result.confidence}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isNormal ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
 
              
              <p className="text-sm text-gray-300 leading-relaxed">
                {isNormal
                  ? 'No signs of Pneumonia detected in this X-Ray. Lungs appear normal.'
                  : 'Signs of Pneumonia detected in this X-Ray. Please consult a medical professional immediately.'
                }
              </p>
 

              <div className="flex gap-2.5 p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                <span className="text-yellow-500/80 shrink-0 text-xs mt-0.5">⚠️</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                  For educational purposes only. This tool is not a substitute for professional medical diagnosis. Always consult a qualified physician.
                </p>
              </div>
 

              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:border-gray-500 hover:text-gray-200 transition-all"
              >
                Analyze Another X-Ray
              </button>
            </div>
          )}
        </div>
      </div>
 
      
      <div className="flex items-center gap-6 mt-8 text-center">
        <div>
          <p className="text-white font-bold text-lg">97.5%</p>
          <p className="text-gray-500 text-xs">Test Accuracy</p>
        </div>
        <div className="w-px h-8 bg-gray-800"/>

        <div className="w-px h-8 bg-gray-800"/>
        <div>
          <p className="text-white font-bold text-lg">128×128</p>
          <p className="text-gray-500 text-xs">Input Size</p>
        </div>
      </div>
 
      <p className="text-gray-700 text-xs mt-8">
        Built by Omar Ahmed · FastAPI + React
      </p>
    </div>
  )
}
 