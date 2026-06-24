import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface ToastItem {
  id: number
  message: string
  sub?: string
}

interface ToastCtx {
  showToast: (message: string, sub?: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)
let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, sub?: string) => {
    const id = (toastId += 1)
    setItems((xs) => [...xs, { id, message, sub }])
    setTimeout(() => setItems((xs) => xs.filter((t) => t.id !== id)), 4500)
  }, [])

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
        aria-live="polite"
        role="status"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex max-w-xs items-start gap-3 rounded border border-govgreen/40 bg-white px-4 py-3 shadow-card animate-toast-in"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-govgreen" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{t.message}</p>
              {t.sub && <p className="text-xs text-midgrey">{t.sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
