import { create } from 'zustand';
import type { AppData } from '@/domain/types';
import { loadAppData, saveAppData, clearAppData, STORAGE_KEYS } from './storage';
import { runSweeps } from '@/services/sweeps';
import { buildSeed } from './seed/buildSeed';
import {
  getMemberSession,
  clearMemberSession,
  getStaffSession,
  clearStaffSession,
} from './sessions';

interface StoreState {
  data: AppData;
  isLoaded: boolean;
  commit: (updater: (prev: AppData) => AppData, options?: { skipSweeps?: boolean }) => AppData;
  reload: () => void;
  reset: () => void;
}

const initialData = loadAppData();
const sweepResult = runSweeps(initialData, new Date());
if (sweepResult.expiredPointsTotal > 0 || sweepResult.occasionsGrantedTotal > 0) {
  saveAppData(sweepResult.data);
}

export const useAppStore = create<StoreState>((set) => ({
  data: sweepResult.data,
  isLoaded: true,

  commit: (updater, options) => {
    // Re-read storage first for cross-tab multi-window safety
    const latestRaw = loadAppData();
    const updated = updater(latestRaw);

    // Run sweeps unless explicitly skipped
    const finalData = options?.skipSweeps ? updated : runSweeps(updated, new Date()).data;

    // Persist
    const success = saveAppData(finalData);
    if (!success) {
      throw new Error('STORAGE_QUOTA_OR_UNAVAILABLE');
    }

    // Update store state
    set({ data: finalData });
    return finalData;
  },

  reload: () => {
    const loaded = loadAppData();
    const swept = runSweeps(loaded, new Date()).data;
    set({ data: swept });
  },

  reset: () => {
    // Keep session if customer/staff still exists in fresh seed (TC-034)
    const memberSession = getMemberSession();
    const staffSession = getStaffSession();

    clearAppData();
    const fresh = buildSeed();
    saveAppData(fresh);

    if (memberSession) {
      const exists = fresh.customers.some((c) => c.id === memberSession.customerId);
      if (!exists) clearMemberSession();
    }
    if (staffSession) {
      const exists = fresh.staff.some((s) => s.id === staffSession.staffId);
      if (!exists) clearStaffSession();
    }

    set({ data: fresh });
  },
}));

// Set up cross-tab synchronization via storage events
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.DATA) {
      useAppStore.getState().reload();
    }
  });
}
