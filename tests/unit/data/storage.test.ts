import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadAppData,
  saveAppData,
  STORAGE_KEYS,
  isStorageAvailable,
} from '@/data/storage';

describe('Storage Adapter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('probes storage availability', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it('loads fresh seed when localStorage is empty', () => {
    const data = loadAppData();
    expect(data.customers.length).toBeGreaterThanOrEqual(6);
    expect(localStorage.getItem(STORAGE_KEYS.DATA)).not.toBeNull();
  });

  it('persists and retrieves updated AppData', () => {
    const data = loadAppData();
    data.config.earning.spendUnitPaise = 20000;
    saveAppData(data);

    const reloaded = loadAppData();
    expect(reloaded.config.earning.spendUnitPaise).toBe(20000);
  });

  it('backs up prior state when saving', () => {
    const data = loadAppData();
    saveAppData(data);
    data.config.earning.spendUnitPaise = 15000;
    saveAppData(data);

    expect(localStorage.getItem(STORAGE_KEYS.BACKUP)).not.toBeNull();
  });

  it('falls back to fresh seed on corrupt localStorage JSON', () => {
    localStorage.setItem(STORAGE_KEYS.DATA, 'INVALID_CORRUPT_JSON{{{');
    const data = loadAppData();
    expect(data.customers.length).toBeGreaterThanOrEqual(6);

    // Verifies corruption dump key was created
    const keys = Object.keys(localStorage);
    expect(keys.some((k) => k.startsWith(STORAGE_KEYS.CORRUPT_PREFIX))).toBe(true);
  });
});
