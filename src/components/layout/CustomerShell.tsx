import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { TierChip } from '@/components/brand/TierChip';
import { DemoBar } from '@/components/demo/DemoBar';
import { StorageBanner } from '@/components/demo/StorageBanner';
import { useMemberSession } from '@/hooks/useMemberSession';
import { memberSignOut } from '@/services/auth';
import { Home, Gift, Clock, User, Bell, LogOut, X } from 'lucide-react';
import { useAppStore } from '@/data/store';

export const CustomerShell: React.FC = () => {
  const { details } = useMemberSession();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = () => {
    memberSignOut();
    navigate('/login');
  };

  const handleMarkNotificationsRead = () => {
    if (!details) return;
    useAppStore.getState().commit((prev) => {
      const nowIso = new Date().toISOString();
      const updated = prev.notifications.map((n) =>
        n.customerId === details.customer.id ? { ...n, readAt: n.readAt ?? nowIso } : n
      );
      return { ...prev, notifications: updated };
    });
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col pb-16 md:pb-0">
      <StorageBanner />
      <DemoBar />

      {/* Main Customer Header */}
      <header className="bg-sand-card border-b border-sand-subtle sticky top-7 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Portal Brand */}
          <Link to="/club" className="flex items-center">
            <Wordmark size="md" />
          </Link>

          {/* Member Quick Info & Actions */}
          {details && (
            <div className="flex items-center gap-3">
              {/* Balance & Tier Chip */}
              <Link
                to="/club/membership"
                className="flex items-center gap-2 p-1.5 pl-2.5 bg-sand hover:bg-sand-subtle/40 border border-sand-subtle transition-colors"
                title="View membership status"
              >
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted block leading-none">
                    Balance
                  </span>
                  <span className="font-serif text-sm font-semibold text-charcoal">
                    {details.balance.toLocaleString('en-IN')} <span className="text-[10px] text-charcoal-muted">pts</span>
                  </span>
                </div>
                <TierChip tier={details.tier} size="sm" />
              </Link>

              {/* Notification Bell */}
              <button
                onClick={() => {
                  setNotificationsOpen(true);
                  handleMarkNotificationsRead();
                }}
                className="relative p-2 text-charcoal-muted hover:text-charcoal hover:bg-sand transition-colors"
                aria-label={`Notifications (${details.unreadNotificationsCount} unread)`}
              >
                <Bell className="w-5 h-5" />
                {details.unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full" />
                )}
              </button>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal p-2 hover:bg-sand transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex max-w-5xl mx-auto px-4 border-t border-sand-subtle bg-sand-card">
          <NavLink
            to="/club"
            end
            className={({ isActive }) =>
              `py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                isActive
                  ? 'border-tide text-tide font-bold bg-sand-card'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/club/rewards"
            className={({ isActive }) =>
              `py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                isActive
                  ? 'border-tide text-tide font-bold bg-sand-card'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`
            }
          >
            Rewards Catalogue
          </NavLink>
          <NavLink
            to="/club/activity"
            className={({ isActive }) =>
              `py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                isActive
                  ? 'border-tide text-tide font-bold bg-sand-card'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`
            }
          >
            Points Activity
          </NavLink>
          <NavLink
            to="/club/membership"
            className={({ isActive }) =>
              `py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                isActive
                  ? 'border-tide text-tide font-bold bg-sand-card'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`
            }
          >
            Tier Ladder
          </NavLink>
          <NavLink
            to="/club/profile"
            className={({ isActive }) =>
              `py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                isActive
                  ? 'border-tide text-tide font-bold bg-sand-card'
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`
            }
          >
            My Profile
          </NavLink>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sand-card border-t border-sand-subtle z-30 flex items-center justify-around shadow-lg">
        <NavLink
          to="/club"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 w-1/4 ${
              isActive ? 'text-tide font-semibold' : 'text-charcoal-muted'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wider uppercase font-medium">Home</span>
        </NavLink>
        <NavLink
          to="/club/rewards"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 w-1/4 ${
              isActive ? 'text-tide font-semibold' : 'text-charcoal-muted'
            }`
          }
        >
          <Gift className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wider uppercase font-medium">Rewards</span>
        </NavLink>
        <NavLink
          to="/club/activity"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 w-1/4 ${
              isActive ? 'text-tide font-semibold' : 'text-charcoal-muted'
            }`
          }
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wider uppercase font-medium">Activity</span>
        </NavLink>
        <NavLink
          to="/club/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 w-1/4 ${
              isActive ? 'text-tide font-semibold' : 'text-charcoal-muted'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wider uppercase font-medium">Profile</span>
        </NavLink>
      </nav>

      {/* Notifications Slide-over Sheet */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal/30 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-sand-card h-full shadow-2xl flex flex-col border-l border-sand-subtle">
            <div className="p-4 border-b border-sand-subtle flex items-center justify-between bg-sand">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-tide" />
                <h3 className="font-serif text-sm font-semibold text-charcoal">Notifications</h3>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1 text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {details && details.notifications.length > 0 ? (
                details.notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 bg-sand border border-sand-subtle space-y-1 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-semibold text-charcoal">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-charcoal-muted">
                        {new Date(n.at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed">{n.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-charcoal-muted text-center py-8">
                  No notifications yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
