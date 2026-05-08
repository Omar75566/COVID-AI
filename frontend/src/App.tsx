import { useState,useCallback  } from 'react'


type Prediction = {
  prediction: 'NORMAL' | 'PNEUMONIA'
  confidence: number
  raw_score: number
  threshold_used: number
}
type Status = 'idle' | 'loading' | 'success' | 'error'


export default function App(){
  const [file,setFile]=useState<File | null>(null)
  const [preview,setPreview]=useState<string | null>(null)
  const [file,setFile]=useState<File | null>(null)
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

}
