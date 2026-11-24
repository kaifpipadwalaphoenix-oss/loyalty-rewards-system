import { useAppStore } from '@/data/store';
import type { AppData } from '@/domain/types';

export function useAppData<T = AppData>(selector?: (data: AppData) => T): T {
  return useAppStore((state) => (selector ? selector(state.data) : (state.data as unknown as T)));
}
