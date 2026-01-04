import {
    createContext,
    useContext,
    useState,
    useCallback
} from 'react'
import type { ReactNode } from "react";


type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (opts: { type?: ToastType; message: string; durationMs?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        ({ type = 'info', message, durationMs = 3000 }: { type?: ToastType; message: string; durationMs?: number }) => {
            const id = Date.now();
            const toast: Toast = { id, type, message };
            setToasts((prev) => [...prev, toast]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, durationMs);
        },
        []
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast container */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-4 lg:translate-x-0 z-50 space-y-2 max-w-[calc(100vw-2rem)]">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`max-w-xs w-full rounded-xl border px-3 py-2 text-xs shadow-lg backdrop-blur bg-slate-900/90 ${toast.type === 'success'
                            ? 'border-emerald-500/60 text-emerald-100'
                            : toast.type === 'error'
                                ? 'border-red-500/70 text-red-100'
                                : 'border-sky-500/70 text-sky-100'
                            }`}
                    >
                        <p className="font-medium mb-0.5">
                            {toast.type === 'success'
                                ? 'Success'
                                : toast.type === 'error'
                                    ? 'Error'
                                    : 'Info'}
                        </p>
                        <p className="text-[11px] leading-snug break-words">{toast.message}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return ctx;
}
