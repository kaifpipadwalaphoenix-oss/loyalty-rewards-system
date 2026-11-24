export interface MemberSession {
  customerId: string;
  signedInAt: string;
}

export interface StaffSession {
  staffId: string;
  signedInAt: string;
}

export const SESSION_KEYS = {
  MEMBER: 'troveclub.session.member',
  STAFF: 'troveclub.session.staff',
} as const;

function isSessionAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.sessionStorage;
}

export function getMemberSession(): MemberSession | null {
  if (!isSessionAvailable()) return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEYS.MEMBER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setMemberSession(session: MemberSession): void {
  if (!isSessionAvailable()) return;
  try {
    window.sessionStorage.setItem(SESSION_KEYS.MEMBER, JSON.stringify(session));
  } catch {
    // Ignore
  }
}

export function clearMemberSession(): void {
  if (!isSessionAvailable()) return;
  try {
    window.sessionStorage.removeItem(SESSION_KEYS.MEMBER);
  } catch {
    // Ignore
  }
}

export function getStaffSession(): StaffSession | null {
  if (!isSessionAvailable()) return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEYS.STAFF);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStaffSession(session: StaffSession): void {
  if (!isSessionAvailable()) return;
  try {
    window.sessionStorage.setItem(SESSION_KEYS.STAFF, JSON.stringify(session));
  } catch {
    // Ignore
  }
}

export function clearStaffSession(): void {
  if (!isSessionAvailable()) return;
  try {
    window.sessionStorage.removeItem(SESSION_KEYS.STAFF);
  } catch {
    // Ignore
  }
}
