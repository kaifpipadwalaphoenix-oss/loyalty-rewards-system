export function isE2eMode(): boolean {
  if (typeof window === 'undefined') return false;
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('e2e') === '1') {
    try {
      window.sessionStorage.setItem('trove_e2e', '1');
    } catch {
      // Ignore
    }
    return true;
  }
  try {
    return window.sessionStorage.getItem('trove_e2e') === '1';
  } catch {
    return false;
  }
}

/**
 * Realistic delay simulator:
 * In E2E automated test runs (?e2e=1), returns immediately (0ms).
 * In normal interactive demo, simulates network/processing delay (150ms-350ms).
 */
export async function simulatedDelay(ms = 250): Promise<void> {
  if (isE2eMode()) {
    return Promise.resolve();
  }
  const jitter = Math.floor(Math.random() * 150) - 50;
  const effectiveMs = Math.max(50, ms + jitter);
  return new Promise((resolve) => setTimeout(resolve, effectiveMs));
}
