import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if invoked outside provider
    return {
      showToast: (msg) => console.log(msg),
      success: (msg) => console.log('[SUCCESS]', msg),
      error: (msg) => console.error('[ERROR]', msg),
      warning: (msg) => console.warn('[WARN]', msg),
      info: (msg) => console.info('[INFO]', msg),
    };
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Limit to max 5 simultaneous toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Overlay Container */}
      <div 
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const bgColor = isSuccess 
            ? 'bg-[#A3E635]' 
            : isError 
            ? 'bg-[#FF5E5B]' 
            : isWarning 
            ? 'bg-[#FFED66]' 
            : 'bg-[#00CECB]';

          const defaultTitle = isSuccess 
            ? 'Thành công' 
            : isError 
            ? 'Thông báo lỗi' 
            : isWarning 
            ? 'Cảnh báo' 
            : 'Thông tin';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-3 border-black p-3.5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${bgColor} text-black flex items-start gap-3 transition-all animate-bounce-in`}
              role="alert"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 stroke-[3] text-black" />}
                {isError && <AlertCircle className="w-5 h-5 stroke-[3] text-black" />}
                {isWarning && <AlertTriangle className="w-5 h-5 stroke-[3] text-black" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 stroke-[3] text-black" />}
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-black uppercase tracking-wider text-black">
                  {toast.title || defaultTitle}
                </h5>
                <p className="text-xs font-bold text-black mt-0.5 leading-snug break-words">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
