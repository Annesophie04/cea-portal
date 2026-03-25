import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};
const COLORS = {
  success: 'bg-green-50 border-success/30 text-success dark:bg-green-500/10 dark:border-green-500/20',
  warning: 'bg-orange-50 border-warning/30 text-warning dark:bg-orange-500/10 dark:border-orange-500/20',
  error: 'bg-red-50 border-danger/30 text-danger dark:bg-red-500/10 dark:border-red-500/20',
  info: 'bg-blue-50 border-blue-600/30 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} pointer-events-auto rounded-xl border shadow-xl overflow-hidden ${COLORS[toast.type]}`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="toast-icon-pop shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold flex-1">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className={`toast-progress toast-progress-${toast.type}`} style={{ animationDuration: `${toast.duration || 3500}ms` }} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
