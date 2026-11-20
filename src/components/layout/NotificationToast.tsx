import React from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useLoyalty();

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none"
      aria-live="polite"
      role="region"
      aria-label="System notifications"
    >
      {notifications.map((notif) => {
        const isSuccess = notif.type === 'success';
        const isError = notif.type === 'error';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform translate-y-0 ${
              isSuccess
                ? 'bg-slate-900 text-white border-emerald-500/40 shadow-emerald-950/20'
                : isError
                ? 'bg-red-950 text-white border-red-500/40 shadow-red-950/20'
                : 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-950/20'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" aria-hidden="true" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-400" aria-hidden="true" />}
            </div>
            <div className="flex-1 leading-snug">
              {notif.message}
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
