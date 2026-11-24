import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberSession } from '@/hooks/useMemberSession';
import { WaveLine } from '@/components/brand/WaveLine';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { DayMonthPicker } from '@/components/ui/DayMonthPicker';
import { updateMemberProfile } from '@/services/members';
import { memberSignOut } from '@/services/auth';
import { Lock, Heart, CheckCircle2, LogOut } from 'lucide-react';

export const CustomerProfilePage: React.FC = () => {
  const { details } = useMemberSession();
  const navigate = useNavigate();

  const customer = details?.customer;

  const [name, setName] = useState(customer?.name ?? '');
  const [email, setEmail] = useState(customer?.email ?? '');
  const [birthday, setBirthday] = useState<{ day?: number; month?: number }>({
    day: customer?.birthday?.day,
    month: customer?.birthday?.month,
  });
  const [maritalStatus, setMaritalStatus] = useState<'single' | 'married' | 'undisclosed'>(
    customer?.maritalStatus ?? 'undisclosed'
  );
  const [spouseFirstName, setSpouseFirstName] = useState(customer?.spouseFirstName ?? '');
  const [anniversary, setAnniversary] = useState<{ day?: number; month?: number }>({
    day: customer?.anniversary?.day,
    month: customer?.anniversary?.month,
  });
  const [consentUpdates, setConsentUpdates] = useState(customer?.consent.updates ?? true);

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!details || !customer) return null;

  const isBirthdayLocked =
    !!customer.birthday && (customer.occasionDates.birthdayEdits ?? 0) >= 1;
  const isAnniversaryLocked =
    !!customer.anniversary && (customer.occasionDates.anniversaryEdits ?? 0) >= 1;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);
    setLoading(true);

    setTimeout(() => {
      const res = updateMemberProfile({
        customerId: customer.id,
        name: name.trim(),
        email: email.trim() || undefined,
        birthday: !isBirthdayLocked && birthday.day && birthday.month ? { day: birthday.day, month: birthday.month } : undefined,
        maritalStatus,
        spouseFirstName: maritalStatus === 'married' ? spouseFirstName.trim() || undefined : undefined,
        anniversary:
          maritalStatus === 'married' && !isAnniversaryLocked && anniversary.day && anniversary.month
            ? { day: anniversary.day, month: anniversary.month }
            : undefined,
        consentUpdates,
      });

      setLoading(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 200);
  };

  const handleSignOut = () => {
    memberSignOut();
    navigate('/login');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-tide">
          Account Settings
        </span>
        <h1 className="font-serif text-3xl text-charcoal">
          Member Profile
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
          Manage your personal details, celebration milestone dates, and communication preferences.
        </p>
        <div className="flex justify-center pt-2">
          <WaveLine className="w-20 text-terracotta" />
        </div>
      </div>

      <div className="bg-sand-card p-6 sm:p-8 border border-sand-subtle shadow-2xs space-y-6">
        {/* Account Key Info Box */}
        <div className="p-4 bg-sand border border-sand-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
              Member ID
            </span>
            <span className="font-mono text-sm font-bold text-charcoal">{customer.memberNo}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
              Registered Mobile
            </span>
            <span className="font-mono text-sm font-bold text-charcoal">{customer.mobile}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block">
              Tier Level
            </span>
            <span className="font-serif text-sm font-semibold text-tide">{details.tier.name}</span>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully updated.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Name */}
          <Field label="Full Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal"
              required
            />
          </Field>

          {/* Email */}
          <Field label="Email Address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal"
            />
          </Field>

          {/* Birthday */}
          <div className="space-y-1">
            {isBirthdayLocked ? (
              <div className="p-3.5 bg-sand border border-sand-subtle space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal">Date of Birth</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
                <p className="font-serif text-sm font-medium text-charcoal">
                  {new Date(2024, (customer.birthday?.month ?? 1) - 1, customer.birthday?.day ?? 1).toLocaleDateString(
                    'en-IN',
                    { month: 'long', day: 'numeric' }
                  )}
                </p>
                <p className="text-[10px] text-charcoal-muted">
                  Milestone date on file. Visit store counter to request administrative correction.
                </p>
              </div>
            ) : (
              <DayMonthPicker
                label="Date of Birth"
                value={birthday}
                onChange={(val) => setBirthday({ day: val.day, month: val.month })}
                helperText="Can be edited once after setting."
              />
            )}
          </div>

          {/* Marital Status */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-charcoal block">Relationship Status</span>
            <div className="grid grid-cols-3 gap-2">
              {(['single', 'married', 'undisclosed'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setMaritalStatus(status)}
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

          {/* Conditional Spouse and Anniversary fields if Married */}
          {maritalStatus === 'married' && (
            <div className="p-4 bg-sand border border-sand-subtle space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-tide">
                <Heart className="w-4 h-4 text-terracotta" />
                <span>Anniversary &amp; Couple Celebrations</span>
              </div>

              <Field label="Spouse First Name">
                <input
                  type="text"
                  value={spouseFirstName}
                  onChange={(e) => setSpouseFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  className="w-full px-3 py-2 bg-sand-card border border-sand-subtle focus:border-tide focus:outline-hidden text-sm text-charcoal"
                />
              </Field>

              {isAnniversaryLocked ? (
                <div className="p-3 bg-sand-card border border-sand-subtle space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal">Anniversary Date</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  </div>
                  <p className="font-serif text-sm font-medium text-charcoal">
                    {new Date(
                      2024,
                      (customer.anniversary?.month ?? 1) - 1,
                      customer.anniversary?.day ?? 1
                    ).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-charcoal-muted">
                    Anniversary on file. Visit store counter for updates.
                  </p>
                </div>
              ) : (
                <DayMonthPicker
                  label="Wedding Anniversary Date"
                  value={anniversary}
                  onChange={(val) => setAnniversary({ day: val.day, month: val.month })}
                  helperText="Can be edited once after setting."
                />
              )}
            </div>
          )}

          {/* Consent */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              id="consentProfile"
              type="checkbox"
              checked={consentUpdates}
              onChange={(e) => setConsentUpdates(e.target.checked)}
              className="mt-0.5 accent-tide cursor-pointer"
            />
            <label htmlFor="consentProfile" className="text-xs text-charcoal-muted cursor-pointer leading-relaxed">
              Keep me updated about new resortwear drops, tier benefits, and milestone gifts via WhatsApp &amp; SMS.
            </label>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </Button>
        </form>

        <div className="pt-6 border-t border-sand-subtle flex justify-between items-center">
          <span className="text-xs text-charcoal-muted">Ready to leave?</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
