import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastData {
  id: string
  type: 'success' | 'error'
  message: string
}

interface Props {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

export default function Toast({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(id)
  }, [toast.id, onDismiss])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm min-w-72 max-w-sm border ${
        isSuccess
          ? 'bg-white border-green-200 text-gray-800'
          : 'bg-white border-red-200 text-gray-800'
      }`}
    >
      {isSuccess
        ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
        : <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      }
      <p className="flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X size={15} />
      </button>
    </div>
  )
}
