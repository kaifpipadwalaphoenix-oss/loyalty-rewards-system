import type { AppData } from '@/domain/types';
import { AppDataSchema } from '@/data/schema';
import { buildSeed } from './seed/buildSeed';
import { migrateData } from './migrations';

export const STORAGE_KEYS = {
  DATA: 'troveclub.data',
  BACKUP: 'troveclub.data.backup',
  IMAGES: 'troveclub.images',
  CORRUPT_PREFIX: 'troveclub.corrupt.',
} as const;

export interface StorageStatus {
  available: boolean;
  quotaExceeded: boolean;
  lastSavedAt: string | null;
}

let quotaExceededState = false;
let recoveryStatusState: 'recovered-from-backup' | 'recovered-seed' | null = null;

export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const probe = '__trove_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function isQuotaExceeded(): boolean {
  return quotaExceededState;
}

export function getRecoveryStatus(): 'recovered-from-backup' | 'recovered-seed' | null {
  return recoveryStatusState;
}

export function clearRecoveryStatus(): void {
  recoveryStatusState = null;
}

/**
 * Loads AppData from localStorage.
 * If data is missing or corrupted, safely creates a backup and resets to fresh seed.
 */
export function loadAppData(): AppData {
  if (!isStorageAvailable()) {
    return buildSeed();
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.DATA);
  if (!raw) {
    const seed = buildSeed();
    saveAppData(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(raw);
    const migrated = migrateData(parsed);
    const validated = AppDataSchema.parse(migrated);
    return validated;
  } catch (error) {
    // Corruption fallback: clean up old corrupt keys, save single latest corrupt payload
    console.error('Failed to load AppData from localStorage. Checking backup.', error);
    try {
      const corruptKeys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.CORRUPT_PREFIX)) {
          corruptKeys.push(key);
        }
      }
      for (const k of corruptKeys) {
        window.localStorage.removeItem(k);
      }
      const corruptKey = `${STORAGE_KEYS.CORRUPT_PREFIX}${Date.now()}`;
      window.localStorage.setItem(corruptKey, raw);
    } catch {
      // Ignore if quota or storage issue
    }

    // Try restoring from backup first
    const backupRaw = window.localStorage.getItem(STORAGE_KEYS.BACKUP);
    if (backupRaw) {
      try {
        const parsedBackup = JSON.parse(backupRaw);
        const migratedBackup = migrateData(parsedBackup);
        const validatedBackup = AppDataSchema.parse(migratedBackup);
        saveAppData(validatedBackup);
        recoveryStatusState = 'recovered-from-backup';
        return validatedBackup;
      } catch (backupErr) {
        console.error('Backup was also corrupted. Falling back to fresh seed.', backupErr);
      }
    }

    recoveryStatusState = 'recovered-seed';
    const seed = buildSeed();
    saveAppData(seed);
    return seed;
  }
}

/**
 * Persists AppData to localStorage after validating schema.
 * Automatically saves a previous backup for rollback.
 */
export function saveAppData(data: AppData): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    // Validate schema
    AppDataSchema.parse(data);

    const serialized = JSON.stringify(data);

    // Backup existing before writing
    const existing = window.localStorage.getItem(STORAGE_KEYS.DATA);
    if (existing) {
      try {
        window.localStorage.setItem(STORAGE_KEYS.BACKUP, existing);
      } catch {
        // Non-fatal if backup fails
      }
    }

    window.localStorage.setItem(STORAGE_KEYS.DATA, serialized);
    quotaExceededState = false;
    return true;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'QuotaExceededError') {
      quotaExceededState = true;
      console.error('Storage quota exceeded while saving Trove Club data', err);
    } else {
      console.error('Error saving AppData', err);
    }
    return false;
  }
}

export function clearAppData(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.DATA);
    window.localStorage.removeItem(STORAGE_KEYS.BACKUP);
    window.localStorage.removeItem(STORAGE_KEYS.IMAGES);
  } catch {
    // Ignore
  }
}

export interface ImageStore {
  [imageId: string]: string; // base64 or object URL
}

export function loadImageStore(): ImageStore {
  if (!isStorageAvailable()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.IMAGES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveImage(imageId: string, dataUrl: string): boolean {
  if (!isStorageAvailable()) return false;
  try {
    const store = loadImageStore();
    store[imageId] = dataUrl;
    window.localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(store));
    return true;
  } catch (err) {
    console.error('Failed to store image in local storage', err);
    return false;
  }
}

export function getImage(imageId: string): string | null {
  const store = loadImageStore();
  return store[imageId] ?? null;
}
