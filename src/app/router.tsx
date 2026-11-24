import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RouteError } from '@/components/layout/ErrorBoundary';
import { NotFound } from '@/components/layout/NotFound';
import { RequireMember, RequireStaff, RequirePermission } from './guards';

// Layout Shells
import { CustomerShell } from '@/components/layout/CustomerShell';
import { CounterShell } from '@/components/layout/CounterShell';
import { AdminShell } from '@/components/layout/AdminShell';

// Suspense loading fallback
const SuspenseFallback: React.FC = () => (
  <div className="min-h-72 flex items-center justify-center p-8 text-xs text-charcoal-muted">
    <div className="space-y-2 text-center animate-pulse">
      <div className="w-6 h-6 border-2 border-tide border-t-transparent rounded-full animate-spin mx-auto" />
      <span className="font-serif italic text-charcoal">Loading Trove Club...</span>
    </div>
  </div>
);

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Component />
    </Suspense>
  );
}

// Public Pages (Chunk: public)
const LandingPage = lazy(() => import('@/features/public/LandingPage').then((m) => ({ default: m.LandingPage })));
const MemberLoginPage = lazy(() => import('@/features/public/MemberLoginPage').then((m) => ({ default: m.MemberLoginPage })));
const MemberRegisterPage = lazy(() => import('@/features/public/MemberRegisterPage').then((m) => ({ default: m.MemberRegisterPage })));
const CounterLoginPage = lazy(() => import('@/features/counter/CounterLoginPage').then((m) => ({ default: m.CounterLoginPage })));
const DesignSystemPage = lazy(() => import('@/features/dev/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })));

// Customer Portal Pages (Chunk: customer)
const CustomerDashboardPage = lazy(() => import('@/features/customer/CustomerDashboardPage').then((m) => ({ default: m.CustomerDashboardPage })));
const CustomerMembershipPage = lazy(() => import('@/features/customer/CustomerMembershipPage').then((m) => ({ default: m.CustomerMembershipPage })));
const CustomerRewardsPage = lazy(() => import('@/features/customer/CustomerRewardsPage').then((m) => ({ default: m.CustomerRewardsPage })));
const CustomerActivityPage = lazy(() => import('@/features/customer/CustomerActivityPage').then((m) => ({ default: m.CustomerActivityPage })));
const CustomerProfilePage = lazy(() => import('@/features/customer/CustomerProfilePage').then((m) => ({ default: m.CustomerProfilePage })));

// Counter Station (Chunk: counter)
const CounterWorkspacePage = lazy(() => import('@/features/counter/CounterWorkspacePage').then((m) => ({ default: m.CounterWorkspacePage })));

// Admin Portal Pages (Chunk: admin)
const AdminDashboardPage = lazy(() => import('@/features/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminCustomersPage = lazy(() => import('@/features/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminCustomerDetailPage = lazy(() => import('@/features/admin/AdminCustomerDetailPage').then((m) => ({ default: m.AdminCustomerDetailPage })));
const AdminProgrammePage = lazy(() => import('@/features/admin/AdminProgrammePage').then((m) => ({ default: m.AdminProgrammePage })));
const AdminRewardsPage = lazy(() => import('@/features/admin/AdminRewardsPage').then((m) => ({ default: m.AdminRewardsPage })));
const AdminRewardEditorPage = lazy(() => import('@/features/admin/AdminRewardEditorPage').then((m) => ({ default: m.AdminRewardEditorPage })));
const AdminStaffPage = lazy(() => import('@/features/admin/AdminStaffPage').then((m) => ({ default: m.AdminStaffPage })));
const AdminAuditPage = lazy(() => import('@/features/admin/AdminAuditPage').then((m) => ({ default: m.AdminAuditPage })));

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    children: [
      // 1. Public Routes
      {
        index: true,
        element: withSuspense(LandingPage),
      },
      {
        path: 'login',
        element: withSuspense(MemberLoginPage),
      },
      {
        path: 'join',
        element: withSuspense(MemberRegisterPage),
      },
      {
        path: 'counter/login',
        element: withSuspense(CounterLoginPage),
      },
      {
        path: 'dev/design-system',
        element: withSuspense(DesignSystemPage),
      },

      // 2. Customer Portal Routes
      {
        path: 'club',
        element: (
          <RequireMember>
            <CustomerShell />
          </RequireMember>
        ),
        children: [
          {
            index: true,
            element: withSuspense(CustomerDashboardPage),
          },
          {
            path: 'membership',
            element: withSuspense(CustomerMembershipPage),
          },
          {
            path: 'rewards',
            element: withSuspense(CustomerRewardsPage),
          },
          {
            path: 'rewards/:id',
            element: withSuspense(CustomerRewardsPage),
          },
          {
            path: 'activity',
            element: withSuspense(CustomerActivityPage),
          },
          {
            path: 'profile',
            element: withSuspense(CustomerProfilePage),
          },
        ],
      },

      // 3. Store Counter Station
      {
        path: 'counter',
        element: (
          <RequireStaff>
            <CounterShell />
          </RequireStaff>
        ),
        children: [
          {
            index: true,
            element: withSuspense(CounterWorkspacePage),
          },
        ],
      },

      // 4. Admin Portal Routes
      {
        path: 'admin',
        element: (
          <RequireStaff>
            <RequirePermission permission="dashboard.view">
              <AdminShell />
            </RequirePermission>
          </RequireStaff>
        ),
        children: [
          {
            index: true,
            element: withSuspense(AdminDashboardPage),
          },
          {
            path: 'customers',
            element: (
              <RequirePermission permission="customers.view">
                {withSuspense(AdminCustomersPage)}
              </RequirePermission>
            ),
          },
          {
            path: 'customers/:id',
            element: (
              <RequirePermission permission="customers.view">
                {withSuspense(AdminCustomerDetailPage)}
              </RequirePermission>
            ),
          },
          {
            path: 'programme',
            element: (
              <RequirePermission permission="programme.manage">
                {withSuspense(AdminProgrammePage)}
              </RequirePermission>
            ),
          },
          {
            path: 'rewards',
            element: (
              <RequirePermission permission="rewards.manage">
                {withSuspense(AdminRewardsPage)}
              </RequirePermission>
            ),
          },
          {
            path: 'rewards/new',
            element: (
              <RequirePermission permission="rewards.manage">
                {withSuspense(AdminRewardEditorPage)}
              </RequirePermission>
            ),
          },
          {
            path: 'rewards/:id',
            element: (
              <RequirePermission permission="rewards.manage">
                {withSuspense(AdminRewardEditorPage)}
              </RequirePermission>
            ),
          },
          {
            path: 'staff',
            element: (
              <RequirePermission permission="staff.manage">
                {withSuspense(AdminStaffPage)}
              </RequirePermission>
            ),
          },
          {
            path: 'audit',
            element: (
              <RequirePermission permission="audit.view">
                {withSuspense(AdminAuditPage)}
              </RequirePermission>
            ),
          },
        ],
      },

      // 5. Catch-all Not Found
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
