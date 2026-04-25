'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Toast {
 id: string
 message: string
 type: 'success' | 'error' | 'info'
}

interface ToastContextType {
 showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
 const context = useContext(ToastContext)
 if (!context) {
 throw new Error('useToast must be used within ToastProvider')
 }
 return context
}

interface ToastProviderProps {
 children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
 const [toasts, setToasts] = useState<Toast[]>([])

 const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
 const id = `toast_${Date.now()}`
 setToasts(prev => [...prev, { id, message, type }])
 
 setTimeout(() => {
 setToasts(prev => prev.filter(t => t.id !== id))
 }, 3000)
 }, [])

 const removeToast = useCallback((id: string) => {
 setToasts(prev => prev.filter(t => t.id !== id))
 }, [])

 return (
 <ToastContext.Provider value={{ showToast }}>
 {children}
 
 {/* Toast Container */}
 <div className="fixed bottom-20 left-1/2 z-[100] -translate-x-1/2 sm:bottom-24">
 <AnimatePresence> {toasts.map((toast) => (
 <motion.div
 key={toast.id}
 initial={{ opacity: 0, y: 20, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -10, scale: 0.95 }}
 transition={{ type: 'spring', stiffness: 400, damping: 30 }}
 className={`mb-2 rounded-[1rem] border px-5 py-3 shadow-[var(--shadow-lg)] ${
 toast.type === 'success' 
 ? 'border-[var(--status-success)]/20 bg-[var(--status-success-soft)] text-[var(--status-success-dark)]'
 : toast.type === 'error'
 ? 'border-[var(--status-error)]/20 bg-[var(--status-error-soft)] text-[var(--status-error)]'
 : 'border-[var(--status-info)]/20 bg-[var(--status-info-soft)] text-[var(--status-info)]'
 }`}
 onClick={() => removeToast(toast.id)}
 >
 <span className="text-sm font-medium">{toast.message}</span>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 </ToastContext.Provider>
 )
}
