import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { DemoBar } from '@/components/demo/DemoBar';
import { StorageBanner } from '@/components/demo/StorageBanner';
import { useStaffSession } from '@/hooks/useStaffSession';
import { staffSignOut } from '@/services/auth';
import { can, type Permission } from '@/domain/permissions';
import {
  LayoutDashboard,
  Users,
  Sliders,
  Gift,
  UserCheck,
  History,
  Store,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export const AdminShell: React.FC = () => {
  const { staff } = useStaffSession();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    staffSignOut();
    navigate('/counter/login');
  };

  const navItems: Array<{ label: string; to: string; icon: React.ComponentType<{ className?: string }>; end?: boolean; permission: Permission }> = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true, permission: 'dashboard.view' },
    { label: 'Customers', to: '/admin/customers', icon: Users, permission: 'customers.view' },
    { label: 'Programme Settings', to: '/admin/programme', icon: Sliders, permission: 'programme.manage' },
    { label: 'Rewards Catalogue', to: '/admin/rewards', icon: Gift, permission: 'rewards.manage' },
    { label: 'Staff & Roles', to: '/admin/staff', icon: UserCheck, permission: 'staff.manage' },
    { label: 'Audit Trail', to: '/admin/audit', icon: History, permission: 'audit.view' },
  ];

  const allowedNavItems = navItems.filter((item) => can(staff?.role, item.permission));

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <StorageBanner />
      <DemoBar />

      {/* Admin Top Header on Mobile */}
      <header className="md:hidden bg-sand-card border-b border-sand-subtle px-4 h-16 flex items-center justify-between sticky top-7 z-30">
        <Link to="/admin" className="flex items-center gap-2">
          <Wordmark size="sm" />
          <span className="font-serif italic text-xs text-tide pl-1 border-l border-sand-subtle">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-charcoal hover:bg-sand"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar / Mobile Drawer */}
        <aside
          className={`fixed md:sticky top-7 md:top-7 z-20 h-[calc(100vh-28px)] w-64 bg-sand-card border-r border-sand-subtle flex flex-col transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Brand header */}
          <div className="hidden md:flex p-6 border-b border-sand-subtle items-center justify-between bg-sand-card">
            <div>
              <Wordmark size="md" />
              <p className="text-[10px] uppercase font-bold tracking-widest text-tide mt-1">
                Programme Admin
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
                      isActive
                        ? 'bg-tide text-white'
                        : 'text-charcoal hover:bg-sand text-charcoal-muted hover:text-charcoal'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer: Staff Card & Shortcuts */}
          {staff && (
            <div className="p-4 border-t border-sand-subtle bg-sand/40 space-y-3">
              <div className="p-2.5 bg-sand-card border border-sand-subtle flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-charcoal block leading-none">
                    {staff.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted capitalize">
                    {staff.role}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-sand"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <Link
                to="/counter"
                className="flex items-center justify-center gap-2 w-full py-2 bg-sand hover:bg-sand-subtle text-xs font-semibold text-charcoal border border-sand-subtle transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-tide" />
                <span>Store Counter</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Backdrop for mobile drawer */}
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close mobile navigation"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 z-10 bg-charcoal/30 backdrop-blur-xs w-full h-full border-0 cursor-pointer"
          />
        )}

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
