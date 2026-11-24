import { useState, useEffect, useMemo } from 'react';
import { getStaffSession } from '@/data/sessions';
import { useAppData } from './useAppData';
import type { StaffMember } from '@/domain/types';

export function useStaffSession(): {
  session: ReturnType<typeof getStaffSession>;
  staff: StaffMember | null;
  isAuthenticated: boolean;
} {
  const [session, setSession] = useState(() => getStaffSession());

  useEffect(() => {
    const handleStorage = () => {
      setSession(getStaffSession());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const data = useAppData();

  const staff = useMemo(() => {
    return session?.staffId ? data.staff.find((s) => s.id === session.staffId && s.active) ?? null : null;
  }, [data, session]);

  return {
    session,
    staff,
    isAuthenticated: !!session && !!staff,
  };
}
