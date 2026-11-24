import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useMemberSession } from '@/hooks/useMemberSession';
import { useStaffSession } from '@/hooks/useStaffSession';
import { useCan } from '@/hooks/useCan';
import type { Permission } from '@/domain/permissions';
import { AccessDenied } from '@/components/layout/AccessDenied';
import { runCommand } from '@/services/command';
import { ok } from '@/lib/result';

export const RequireMember: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useMemberSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const RequireStaff: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useStaffSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/counter/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const RequirePermission: React.FC<{
  permission: Permission;
  children?: React.ReactNode;
}> = ({ permission, children }) => {
  const hasPermission = useCan(permission);
  const { staff } = useStaffSession();
  const location = useLocation();
  const auditedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasPermission && staff && auditedRef.current !== location.pathname) {
      auditedRef.current = location.pathname;
      runCommand({
        actor: {
          kind: 'staff',
          id: staff.id,
          name: staff.name,
          role: staff.role,
        },
        input: {},
        handler: (_, d) => ok({ nextData: d, value: true }),
        audit: () => ({
          action: 'ACCESS_DENIED',
          entity: { type: 'route', id: location.pathname },
          summary: `${staff.name} (${staff.role}) denied access to ${location.pathname} (requires ${permission})`,
        }),
      });
    }
  }, [hasPermission, staff, location.pathname, permission]);

  if (!hasPermission) {
    return <AccessDenied requiredPermission={permission} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
