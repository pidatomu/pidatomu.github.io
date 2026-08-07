"use client";

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let globalToastFn: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = "info"): void {
  if (globalToastFn) {
    globalToastFn(message, type);
  }
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  useEffect(() => {
    globalToastFn = addToast;
    return () => {
      globalToastFn = null;
    };
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onRemove, 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const colors: Record<ToastType, string> = {
    success: "border-[#22c55e] bg-[#22c55e]/10",
    error: "border-[var(--color-danger)] bg-[var(--color-danger)]/10",
    info: "border-[var(--color-accent)] bg-[var(--color-accent)]/10",
    warning: "border-[#f59e0b] bg-[#f59e0b]/10",
  };

  return (
    <div
      className={`pointer-events-auto border-[3px] border-[var(--color-ink)] px-4 py-3 text-sm font-semibold flex items-center gap-3 min-w-[260px] max-w-[400px] shadow-[4px_4px_0_var(--color-ink)] transition-all duration-300 ${colors[toast.type]} ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
      }`}
      role="alert"
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button onClick={onRemove} className="text-black/40 hover:text-black text-lg leading-none cursor-pointer">
        ×
      </button>
    </div>
  );
}
