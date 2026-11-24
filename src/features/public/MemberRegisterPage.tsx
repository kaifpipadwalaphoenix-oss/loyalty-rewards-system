import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { WaveLine } from '@/components/brand/WaveLine';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { OtpInput } from '@/components/ui/OtpInput';
import { DayMonthPicker } from '@/components/ui/DayMonthPicker';
import { DemoBar } from '@/components/demo/DemoBar';
import { registerMember, type RegisterMemberInput } from '@/services/members';
import { requestMemberOtp, verifyRegistrationOtp } from '@/services/auth';
import { setMemberSession } from '@/data/sessions';
import { useAppData } from '@/hooks/useAppData';
import type { Customer } from '@/domain/types';
import { normaliseIndianMobile } from '@/lib/mobile';
import { Sparkles, ArrowRight, Heart, ArrowLeft } from 'lucide-react';

export const MemberRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = useAppData();

  const searchParams = new URLSearchParams(location.search);
  const initialMobile = searchParams.get('mobile') || (location.state as { mobile?: string })?.mobile || '';

  const [step, setStep] = useState<'mobile' | 'otp' | 'about' | 'celebrate'>('mobile');
  const [mobile, setMobile] = useState(initialMobile);
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState<{ day?: number; month?: number }>({});
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'undisclosed'>('undisclosed');
  const [spouseFirstName, setSpouseFirstName] = useState('');
  const [anniversary, setAnniversary] = useState<{ day?: number; month?: number }>({});
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentUpdates, setConsentUpdates] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeCustomer, setWelcomeCustomer] = useState<Customer | null>(null);

  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

  // Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Check if member already exists
    const normalised = normaliseIndianMobile(cleanMobile);
    const existing = data.customers.find((c) => c.mobile === normalised);
    if (existing) {
      setError('This mobile number is already registered. Please sign in to your account.');
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = requestMemberOtp(cleanMobile);
      setLoading(false);
      setSimulatedOtp(res.demoOtp);
      setOtp('');
      setStep('otp');
    }, 150);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (code: string) => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = verifyRegistrationOtp(cleanMobile, code);
      setLoading(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      setStep('about');
    }, 150);
  };

  // Step 3 -> 4: About you
  const handleAboutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!consentTerms) {
      setError('You must agree to the Terms & Conditions to join Trove Club');
      return;
    }

    setError(null);
    setStep('celebrate');
  };

  // Handle marital status change with automatic clearing of spouse info
  const handleMaritalStatusChange = (status: 'single' | 'married' | 'undisclosed') => {
    setMaritalStatus(status);
    if (status !== 'married') {
      setSpouseFirstName('');
      setAnniversary({});
    }
  };

  // Final Registration Submission
  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      setStep('about');
      return;
    }
    if (!consentTerms) {
      setError('You must agree to the Terms & Conditions to join Trove Club');
      setStep('about');
      return;
    }

    const payload: RegisterMemberInput = {
      name: name.trim(),
      mobile: `+91${cleanMobile}`,
      email: email.trim() || undefined,
      birthday: birthday.day && birthday.month ? { day: birthday.day, month: birthday.month } : undefined,
      maritalStatus,
      spouseFirstName: maritalStatus === 'married' && spouseFirstName.trim() ? spouseFirstName.trim() : undefined,
      anniversary:
        maritalStatus === 'married' && anniversary.day && anniversary.month
          ? { day: anniversary.day, month: anniversary.month }
          : undefined,
      consentTerms,
      consentUpdates,
    };

    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = registerMember(payload, { enrolledVia: 'online' });
      setLoading(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      // Automatically sign in
      setMemberSession({
        customerId: res.value.id,
        signedInAt: new Date().toISOString(),
      });

      // Show welcome reveal modal
      setWelcomeCustomer(res.value);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col justify-between">
      <DemoBar />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-sand-card p-8 border border-sand-subtle shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <Wordmark size="md" />
            </Link>
            <h1 className="font-serif text-2xl text-charcoal font-normal mt-2">
              Join Trove Club
            </h1>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              {step === 'mobile' && 'Enter your mobile number to begin your membership.'}
              {step === 'otp' && 'Verify your mobile number with the one-time code.'}
              {step === 'about' && 'Tell us a little about yourself.'}
              {step === 'celebrate' && 'Share your milestones for bespoke annual treats.'}
            </p>
            <div className="flex justify-center pt-1">
              <WaveLine className="w-16 text-terracotta" />
            </div>

            {/* Step Indicator */}
            {!welcomeCustomer && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {(['mobile', 'otp', 'about', 'celebrate'] as const).map((s, idx) => {
                  const stepIndex = ['mobile', 'otp', 'about', 'celebrate'].indexOf(step);
                  const isDone = idx < stepIndex;
                  const isCurrent = idx === stepIndex;
                  return (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all ${
                        isCurrent ? 'w-6 bg-tide' : isDone ? 'w-3 bg-tide/50' : 'w-3 bg-sand-subtle'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
              {error}
            </div>
          )}

          {/* STEP 1: MOBILE */}
          {step === 'mobile' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <PhoneInput
                label="Mobile Number (Primary Account Key)"
                value={mobile}
                onChange={setMobile}
                placeholder="98201 12345"
                required
                autoFocus
                helperText="Your mobile number serves as your single loyalty identifier."
              />

              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Checking number...' : 'Continue with OTP'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-charcoal-muted">
                  Already a member?{' '}
                  <Link to="/login" className="text-tide font-semibold underline">
                    Sign in to your account
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div className="p-4 bg-shell-50 border border-tide/20 space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-tide block">
                  Simulated SMS Code
                </span>
                <p className="text-xs text-charcoal-muted">
                  Demo mode — no SMS is sent. Your code is:
                </p>
                <span className="font-mono text-xl font-bold tracking-wider text-charcoal block py-1">
                  {simulatedOtp}
                </span>
                <span className="text-[10px] text-charcoal-muted block">
                  Code expires in 5 minutes (max 3 attempts)
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-charcoal block text-center">
                  Enter 6-Digit Verification Code
                </span>
                <div className="flex justify-center">
                  <OtpInput
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (error) setError(null);
                    }}
                    onComplete={handleVerifyOtp}
                    hasError={!!error}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-charcoal-muted pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('mobile');
                  }}
                  className="flex items-center gap-1 hover:text-charcoal"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change mobile number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = requestMemberOtp(cleanMobile);
                    setSimulatedOtp(res.demoOtp);
                    setOtp('');
                    setError(null);
                  }}
                  className="text-tide underline hover:text-tide/80"
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ABOUT YOU */}
          {step === 'about' && (
            <form onSubmit={handleAboutSubmit} className="space-y-4">
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal"
                  required
                  autoFocus
                />
              </Field>

              <Field label="Email Address (Optional)">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya@example.com"
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal"
                />
              </Field>

              {/* Consent Terms & Conditions (Required) */}
              <div className="flex items-start gap-2.5 pt-2">
                <input
                  id="consentTerms"
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 accent-tide cursor-pointer"
                  required
                />
                <label htmlFor="consentTerms" className="text-xs text-charcoal leading-relaxed cursor-pointer">
                  I agree to the <span className="font-semibold underline">Trove Club Terms &amp; Conditions</span> and Privacy Policy. <span className="text-terracotta">*</span>
                </label>
              </div>

              {/* Consent WhatsApp / Email updates */}
              <div className="flex items-start gap-2.5">
                <input
                  id="consentUpdates"
                  type="checkbox"
                  checked={consentUpdates}
                  onChange={(e) => setConsentUpdates(e.target.checked)}
                  className="mt-0.5 accent-tide cursor-pointer"
                />
                <label htmlFor="consentUpdates" className="text-xs text-charcoal-muted cursor-pointer leading-relaxed">
                  Receive curated resortwear arrivals, tier milestone notifications, and milestone gifts via WhatsApp &amp; SMS.
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" fullWidth disabled={loading}>
                  Next: Celebrations
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 4: CELEBRATE */}
          {step === 'celebrate' && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="space-y-1">
                <DayMonthPicker
                  label="Date of Birth (Optional)"
                  value={birthday}
                  onChange={(val) => setBirthday({ day: val.day, month: val.month })}
                  helperText="We celebrate your special day with exclusive bonus points and perks."
                />
                <p className="text-[11px] text-charcoal-muted italic">
                  Note: Milestone dates can only be updated once after initial registration.
                </p>
              </div>

              {/* Marital Status */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-charcoal block">
                  Relationship Status (Optional)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['single', 'married', 'undisclosed'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleMaritalStatusChange(status)}
                      className={`py-2 px-3 text-xs font-medium border text-center capitalize transition-colors ${
                        maritalStatus === status
                          ? 'border-tide bg-tide/5 text-tide font-bold'
                          : 'border-sand-subtle bg-sand text-charcoal-muted hover:border-sand-muted'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Spouse & Anniversary if Married */}
              {maritalStatus === 'married' && (
                <div className="p-4 bg-sand border border-sand-subtle space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-tide">
                    <Heart className="w-4 h-4 text-terracotta" />
                    <span>Anniversary &amp; Couple Celebrations</span>
                  </div>

                  <Field
                    label="Spouse First Name (Optional)"
                    helperText="Recorded on your account for couple-visit greetings. No separate mobile number required."
                  >
                    <input
                      type="text"
                      value={spouseFirstName}
                      onChange={(e) => setSpouseFirstName(e.target.value)}
                      placeholder="e.g. Kabir"
                      className="w-full px-3 py-2 bg-sand-card border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal"
                    />
                  </Field>

                  <DayMonthPicker
                    label="Wedding Anniversary Date (Optional)"
                    value={anniversary}
                    onChange={(val) => setAnniversary({ day: val.day, month: val.month })}
                    helperText="Receive an annual celebration gift from the Trove atelier."
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-1/2"
                  onClick={() => handleFinalSubmit()}
                  disabled={loading}
                >
                  Skip &amp; Finish
                </Button>
                <Button type="submit" className="w-full sm:w-1/2" disabled={loading}>
                  {loading ? 'Creating Membership...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}

          {/* Welcome Reveal Modal */}
          {welcomeCustomer && (
            <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-sand-card max-w-md w-full p-8 border border-sand-subtle shadow-2xl space-y-6 text-center">
                <div className="w-12 h-12 bg-tide/10 rounded-full flex items-center justify-center mx-auto text-tide">
                  <Sparkles className="w-6 h-6 text-terracotta" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-tide block">
                    Membership Confirmed
                  </span>
                  <h2 className="font-serif text-3xl text-charcoal">
                    Welcome to Trove Club
                  </h2>
                  <p className="text-xs text-charcoal-muted">
                    Welcome, <span className="font-semibold text-charcoal">{welcomeCustomer.name}</span>. Your digital loyalty membership is now active.
                  </p>
                </div>

                {/* Digital Card Preview */}
                <div className="p-6 bg-shell-50 border border-sand-subtle text-left space-y-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-charcoal-muted block">
                        Member ID
                      </span>
                      <span className="font-mono text-sm font-bold text-charcoal">
                        {welcomeCustomer.id}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-sand text-tide text-[10px] uppercase font-bold tracking-widest border border-sand-subtle">
                      Shore Tier
                    </span>
                  </div>

                  <div className="border-t border-sand-subtle pt-3 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-charcoal-muted block">
                        Initial Balance
                      </span>
                      <span className="font-serif text-2xl font-bold text-tide">
                        0 pts
                      </span>
                    </div>
                    <WaveLine className="w-12 text-terracotta" />
                  </div>
                </div>

                <Button
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/club', { replace: true })}
                >
                  Enter Member Portal
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
