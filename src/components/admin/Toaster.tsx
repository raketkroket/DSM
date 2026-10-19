'use client';

import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { createContext, use, useCallback, useState, type ReactNode } from 'react';

type Toast = { id: number; tone: 'success' | 'error'; message: string; details?: string[] };
type Notify = (tone: Toast['tone'], message: string, details?: string[]) => void;

const ToastContext = createContext<Notify>(() => {});

export function useToast() {
  return use(ToastContext);
}

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));
  const notify = useCallback<Notify>((tone, message, details) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-3), { id, tone, message, details }]);
    setTimeout(() => dismiss(id), tone === 'error' ? 9000 : 4500);
  }, []);

  return (
    <ToastContext value={notify}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex gap-3 rounded-2xl border border-line bg-white p-4 shadow-panel"
            >
              {toast.tone === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
              )}
              <div className="min-w-0 flex-1 text-[0.9rem]">
                <p className="text-navy">{toast.message}</p>
                {toast.details && toast.details.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-[0.8rem] text-muted">
                    {toast.details.slice(0, 6).map((detail) => (
                      <li key={detail} className="break-words">
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} className="h-6 w-6 shrink-0 rounded-md text-muted hover:bg-mist" aria-label="Melding sluiten">
                <X className="mx-auto h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}
