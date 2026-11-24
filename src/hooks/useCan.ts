import { useStaffSession } from './useStaffSession';
import type { Permission } from '@/domain/permissions';
import { can } from '@/domain/permissions';

export function useCan(permission: Permission): boolean {
  const { staff } = useStaffSession();
  if (!staff) return false;
  return can(staff.role, permission);
}
