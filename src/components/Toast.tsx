import { useCallback, useState } from 'react'

export type Toast = { id: number; message: string; type?: 'success'|'error'|'info' }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])
  const dismiss = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  return { toasts, show, dismiss }
}

export default function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id:number)=>void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`rounded px-4 py-2 text-sm shadow ${
          t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <span>{t.message}</span>
            <button className="opacity-80 hover:opacity-100" onClick={() => dismiss(t.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
