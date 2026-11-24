import type { Role } from './types';

export type Permission =
  | 'counter.use'
  | 'counter.ownHistory'
  | 'dashboard.view'
  | 'customers.view'
  | 'customers.edit'
  | 'customers.export'
  | 'points.adjust'
  | 'points.correct' // correct = void purchase, cancel voucher
  | 'reports.view'
  | 'audit.view'
  | 'programme.manage'
  | 'rewards.manage'
  | 'staff.manage';

export const ALL_PERMISSIONS: Permission[] = [
  'counter.use',
  'counter.ownHistory',
  'dashboard.view',
  'customers.view',
  'customers.edit',
  'customers.export',
  'points.adjust',
  'points.correct',
  'reports.view',
  'audit.view',
  'programme.manage',
  'rewards.manage',
  'staff.manage',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,
  manager: [
    'counter.use',
    'counter.ownHistory',
    'dashboard.view',
    'customers.view',
    'customers.edit',
    'customers.export',
    'points.adjust',
    'points.correct',
    'reports.view',
    'audit.view',
  ],
  cashier: ['counter.use', 'counter.ownHistory'],
};

/**
 * Evaluates if a role has the given permission (BR-52).
 */
export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}
