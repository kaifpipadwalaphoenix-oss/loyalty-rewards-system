import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { DemoBar } from '@/components/demo/DemoBar';
import { StorageBanner } from '@/components/demo/StorageBanner';
import { useStaffSession } from '@/hooks/useStaffSession';
import { staffSignOut } from '@/services/auth';
import { Store, LogOut, Shield } from 'lucide-react';

export const CounterShell: React.FC = () => {
  const { staff } = useStaffSession();
  const navigate = useNavigate();

  const handleSignOut = () => {
    staffSignOut();
    navigate('/counter/login');
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <StorageBanner />
      <DemoBar />

      {/* Counter Header */}
      <header className="bg-sand-card border-b border-sand-subtle sticky top-7 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          {/* Logo & Counter Station Info */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/counter" className="flex items-center gap-2">
              <Wordmark size="sm" />
            </Link>
            <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-sand-subtle text-xs text-charcoal">
              <Store className="w-4 h-4 text-tide" />
              <span className="font-semibold hidden sm:inline">Store Counter</span>
            </div>
          </div>

          {/* Staff Info & Navigation */}
          {staff && (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-sand border border-sand-subtle">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="text-left text-xs">
                  <span className="font-semibold text-charcoal block leading-none truncate max-w-[80px] sm:max-w-none">
                    {staff.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted capitalize block">
                    {staff.role}
                  </span>
                </div>
              </div>

              {(staff.role === 'admin' || staff.role === 'manager') && (
                <Link
                  to="/admin"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-sand-card border border-sand-subtle hover:border-sand-muted text-xs font-semibold text-charcoal transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-tide" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors border border-transparent hover:border-sand-subtle"
                title="Sign out of counter"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Counter Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
