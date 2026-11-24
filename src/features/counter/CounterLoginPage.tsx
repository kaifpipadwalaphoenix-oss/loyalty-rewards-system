import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { WaveLine } from '@/components/brand/WaveLine';
import { PinPad } from '@/components/ui/PinPad';
import { Button } from '@/components/ui/button';
import { DemoBar } from '@/components/demo/DemoBar';
import { useAppData } from '@/hooks/useAppData';
import { staffSignIn } from '@/services/auth';
import type { StaffMember } from '@/domain/types';
import { Store, ArrowLeft, ShieldAlert } from 'lucide-react';

export const CounterLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const staff = useAppData((d) => d.staff);
  const staffList = useMemo(() => staff.filter((s) => s.active), [staff]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Terminal Lockout State (R5.4)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const rem = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setSecondsRemaining(rem);
      if (rem <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setError(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setPin('');
    setError(null);
  };

  const isLocked = lockoutUntil !== null && secondsRemaining > 0;

  const handlePinComplete = (pinCode: string) => {
    if (!selectedStaff || isLocked) return;
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = staffSignIn(selectedStaff.id, pinCode);
      setLoading(false);

      if (!res.ok) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setPin('');

        if (nextAttempts >= 3) {
          const lockTime = Date.now() + 60000;
          setLockoutUntil(lockTime);
          setSecondsRemaining(60);
          setError('Security Lockout: 3 consecutive incorrect PIN attempts. Terminal locked for 60 seconds.');
        } else {
          setError(`${res.error.message} (${3 - nextAttempts} attempt${3 - nextAttempts === 1 ? '' : 's'} remaining).`);
        }
        return;
      }

      setFailedAttempts(0);
      setLockoutUntil(null);

      // Route destination:
      const destination =
        from ?? (res.value.role === 'admin' ? '/admin' : '/counter');
      navigate(destination, { replace: true });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col justify-between">
      <DemoBar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-sand-card p-8 border border-sand-subtle shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <Wordmark size="md" />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sand border border-sand-subtle text-[11px] uppercase tracking-wider text-charcoal font-semibold mt-2">
              <Store className="w-3.5 h-3.5 text-tide" />
              <span>Counter &amp; Admin Station</span>
            </div>
            <h1 className="font-serif text-2xl text-charcoal font-normal">Staff Sign In</h1>
            <p className="text-xs text-charcoal-muted">
              Select your staff account and enter your 4-digit PIN.
            </p>
            <div className="flex justify-center pt-1">
              <WaveLine className="w-16 text-terracotta" />
            </div>
          </div>

          {error && (
            <div className={`p-3 text-xs text-center border ${
              isLocked
                ? 'bg-rose-100 border-rose-300 text-rose-900 font-semibold'
                : 'bg-terracotta/10 border-terracotta/30 text-terracotta'
            }`}>
              {isLocked ? (
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Terminal Locked: Try again in {secondsRemaining}s</span>
                </div>
              ) : (
                error
              )}
            </div>
          )}

          {!selectedStaff ? (
            /* Staff Member Selector */
            <div className="space-y-3">
              <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider text-center">
                Select Your Account
              </p>
              <div className="space-y-2">
                {staffList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStaffSelect(s)}
                    className="w-full p-4 text-left bg-sand hover:bg-sand-subtle/40 border border-sand-subtle hover:border-sand-muted transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="font-serif font-semibold text-sm text-charcoal block">
                        {s.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted capitalize">
                        {s.role} · PIN: {s.pin}
                      </span>
                    </div>
                    <span className="text-xs text-tide font-semibold">Select &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* PIN Entry Pad */
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-3 bg-sand border border-sand-subtle flex items-center justify-between">
                <div>
                  <span className="font-serif font-semibold text-sm text-charcoal block">
                    {selectedStaff.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted capitalize">
                    {selectedStaff.role} · Default PIN: {selectedStaff.pin}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="text-xs text-tide font-semibold underline flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Switch
                </button>
              </div>

              <div className="space-y-2 text-center">
                <span className="text-xs font-semibold text-charcoal block">
                  Enter 4-Digit Staff PIN
                </span>
                <div className="flex justify-center">
                  <PinPad
                    length={4}
                    value={pin}
                    onChange={setPin}
                    onComplete={handlePinComplete}
                    disabled={loading || isLocked}
                  />
                </div>
              </div>

              <Button
                onClick={() => handlePinComplete(pin)}
                fullWidth
                disabled={pin.length !== 4 || loading || isLocked}
              >
                {loading ? 'Authenticating...' : isLocked ? `Locked (${secondsRemaining}s)` : 'Authorize Station'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <footer className="p-4 text-center text-xs text-charcoal-muted">
        <Link to="/" className="hover:text-tide underline">
          &larr; Return to Trove Club Home
        </Link>
      </footer>
    </div>
  );
};
