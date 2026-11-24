import React, { useState } from 'react';
import { isQuotaExceeded, getRecoveryStatus, clearRecoveryStatus } from '@/data/storage';

export const StorageBanner: React.FC = () => {
  const quotaExceeded = isQuotaExceeded();
  const [recoveryStatus, setRecoveryStatus] = useState(() => getRecoveryStatus());

  const handleDismissRecovery = () => {
    clearRecoveryStatus();
    setRecoveryStatus(null);
  };

  if (quotaExceeded) {
    return (
      <div className="bg-terracotta text-white text-xs px-4 py-2 flex items-center justify-between z-50">
        <span>
          <strong>Local Storage Full:</strong> Browser storage quota reached. Please reset the demo to free up space.
        </span>
        <button
          onClick={() => window.location.reload()}
          className="underline font-semibold ml-4 hover:opacity-80"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (recoveryStatus === 'recovered-from-backup') {
    return (
      <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-between z-50">
        <span>
          <strong>Data Restored:</strong> Corrupted browser storage was detected and automatically recovered from your latest valid backup.
        </span>
        <button
          onClick={handleDismissRecovery}
          className="underline font-semibold ml-4 hover:opacity-80"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (recoveryStatus === 'recovered-seed') {
    return (
      <div className="bg-terracotta text-white text-xs px-4 py-2 flex items-center justify-between z-50">
        <span>
          <strong>Storage Reset:</strong> Browser storage was unrecoverable and has been reset to the default demo data.
        </span>
        <button
          onClick={handleDismissRecovery}
          className="underline font-semibold ml-4 hover:opacity-80"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return null;
};
