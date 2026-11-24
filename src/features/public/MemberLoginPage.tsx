import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { WaveLine } from '@/components/brand/WaveLine';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { OtpInput } from '@/components/ui/OtpInput';
import { DemoBar } from '@/components/demo/DemoBar';
import { requestMemberOtp, verifyMemberOtp, DEMO_OTP } from '@/services/auth';
import { DEMO_PERSONAS, switchPersona, getPersonaLiveBadge } from '@/services/demo';
import { useAppData } from '@/hooks/useAppData';
import { ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react';

export const MemberLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = useAppData();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/club';

  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [unregistered, setUnregistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mobile.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError(null);
    setUnregistered(false);
    setLoading(true);

    setTimeout(() => {
      const res = requestMemberOtp(clean);
      setLoading(false);

      if (!res.isRegistered) {
        setUnregistered(true);
        return;
      }

      setStep('otp');
      setSimulatedOtp(res.demoOtp);
      setOtp(''); // Do not pre-fill OTP; let user type it or see helper (TC-030)
    }, 150);
  };

  const handleVerifyOtp = (otpValue: string) => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = verifyMemberOtp(mobile, otpValue);
      setLoading(false);

      if (!res.ok) {
        if (res.error.code === 'NOT_FOUND') {
          setError('No account found for this mobile number. Please register below.');
        } else {
          setError(res.error.message);
        }
        return;
      }

      navigate(from, { replace: true });
    }, 150);
  };

  const handleQuickPersona = (key: string) => {
    const target = switchPersona(key);
    navigate(target, { replace: true });
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col justify-between">
      <DemoBar />

      <div className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="max-w-md w-full bg-sand-card p-5 sm:p-8 border border-sand-subtle shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <Wordmark size="md" />
            </Link>
            <h1 className="font-serif text-2xl text-charcoal font-normal mt-2">
              Sign In to Trove Club
            </h1>
            <p className="text-xs text-charcoal-muted">
              Enter your mobile number to access your membership and points.
            </p>
            <div className="flex justify-center pt-1">
              <WaveLine className="w-16 text-terracotta" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
              {error}
            </div>
          )}

          {unregistered && (
            <div className="p-4 bg-shell-50 border border-tide/30 text-charcoal text-xs space-y-3">
              <p className="font-medium text-tide flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                We don't recognise this number.
              </p>
              <p className="text-charcoal-muted">
                Join Trove Club in 30 seconds to start earning Trove Points and exclusive rewards.
              </p>
              <Button
                variant="brand"
                size="sm"
                fullWidth
                onClick={() =>
                  navigate('/join', {
                    state: { mobile: mobile.replace(/\D/g, '').slice(-10) },
                  })
                }
              >
                Join Trove Club with this number
              </Button>
            </div>
          )}

          {step === 'mobile' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <PhoneInput
                label="Mobile Number"
                value={mobile}
                onChange={(val) => {
                  setMobile(val);
                  if (unregistered) setUnregistered(false);
                }}
                placeholder="98201 12345"
                required
                autoFocus
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Checking number...' : 'Continue with OTP'}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-charcoal-muted">
                  New to Trove Label?{' '}
                  <Link to="/join" className="text-tide font-semibold underline">
                    Join Trove Club
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-3 bg-sand border border-sand-subtle text-xs text-charcoal flex items-center justify-between">
                <span>
                  OTP sent to <strong>+91 {mobile.replace(/\D/g, '').slice(-10)}</strong>
                </span>
                <button
                  onClick={() => setStep('mobile')}
                  className="text-tide font-semibold underline text-[11px] flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-charcoal block text-center">
                  Enter 6-Digit OTP
                </span>
                <div className="flex justify-center">
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerifyOtp}
                    autoFocus
                  />
                </div>
                <div className="p-2 bg-tide/5 border border-tide/20 text-center text-xs text-tide flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Demo simulation OTP: <strong>{simulatedOtp || DEMO_OTP}</strong>
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleVerifyOtp(otp)}
                fullWidth
                disabled={otp.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </Button>
            </div>
          )}

          {/* Quick Demo Sign In Shortcuts */}
          <div className="pt-4 border-t border-sand-subtle">
            <p className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted text-center mb-3">
              Fast Demo Sign-In
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {DEMO_PERSONAS.filter((p) => p.type === 'member').slice(0, 4).map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleQuickPersona(p.key)}
                  className="p-2 text-left bg-sand hover:bg-sand-subtle/50 border border-sand-subtle transition-colors truncate"
                >
                  <span className="font-serif font-semibold text-charcoal block truncate">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-tide truncate block">
                    {getPersonaLiveBadge(p, data)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="p-4 text-center text-xs text-charcoal-muted">
        <Link to="/counter/login" className="hover:text-tide underline">
          Store Counter &amp; Admin Sign In
        </Link>
      </footer>
    </div>
  );
};
