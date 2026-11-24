import { useState, useEffect, useMemo } from 'react';
import { getMemberSession } from '@/data/sessions';
import { useAppData } from './useAppData';
import { selectMemberDetails, type MemberDetails } from '@/data/selectors/member';

export function useMemberSession(): {
  session: ReturnType<typeof getMemberSession>;
  details: MemberDetails | null;
  isAuthenticated: boolean;
} {
  const [session, setSession] = useState(() => getMemberSession());

  useEffect(() => {
    const handleStorage = () => {
      setSession(getMemberSession());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const data = useAppData();

  const details = useMemo(() => {
    return session?.customerId ? selectMemberDetails(data, session.customerId) : null;
  }, [data, session]);

  return {
    session,
    details,
    isAuthenticated: !!session && !!details,
  };
}
