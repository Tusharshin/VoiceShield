import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onDismiss, className = '' }) => {
  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
    },
  }[type];

  return (
    <div
      role="alert"
      className={`border rounded-2xl p-4 flex items-start justify-between text-xs font-medium shadow-2xs transition-all ${styles.bg} ${className}`}
    >
      <div className="flex items-start space-x-2.5">
        {styles.icon}
        <div>
          {title && <h5 className="font-extrabold mb-0.5">{title}</h5>}
          <p className="leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
        </button>
      )}
    </div>
  );
};
