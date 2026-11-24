import React from 'react';
import { Link } from 'react-router-dom';
import type { Customer, OccasionGrant, OccasionRule, IssuedVoucher } from '@/domain/types';
import { differenceInCalendarDays, subDays } from 'date-fns';
import { Cake, Heart, Sparkles, ArrowRight, Gift } from 'lucide-react';

interface OccasionCardProps {
  customer: Customer;
  rules: OccasionRule[];
  grants: OccasionGrant[];
  vouchers: IssuedVoucher[];
}

export const OccasionCard: React.FC<OccasionCardProps> = ({
  customer,
  rules,
  grants,
  vouchers,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. Check for ready birthday grant
  const birthdayGrant = grants.find(
    (g) => g.customerId === customer.id && g.occasion === 'birthday'
  );
  const anniversaryGrant = grants.find(
    (g) => g.customerId === customer.id && g.occasion === 'anniversary'
  );

  // Check vouchers linked to occasions
  const occasionVouchers = vouchers.filter(
    (v) => v.customerId === customer.id && v.source === 'occasion' && v.status === 'issued'
  );

  const activeBirthdayRules = rules.filter((r) => r.active && r.occasion === 'birthday');
  const activeAnniversaryRules = rules.filter((r) => r.active && r.occasion === 'anniversary');

  // Calculate upcoming birthday
  let birthdayCountdown: { days: number; birthdayDate: Date; unlockDate: Date } | null = null;
  if (customer.birthday) {
    let nextBday = new Date(currentYear, customer.birthday.month - 1, customer.birthday.day);
    if (nextBday < now && differenceInCalendarDays(now, nextBday) > 30) {
      nextBday = new Date(currentYear + 1, customer.birthday.month - 1, customer.birthday.day);
    }
    const unlockDaysBefore = activeBirthdayRules[0]?.unlockDaysBefore ?? 7;
    const unlockDate = subDays(nextBday, unlockDaysBefore);
    const daysUntilUnlock = differenceInCalendarDays(unlockDate, now);
    if (daysUntilUnlock >= 0 && daysUntilUnlock <= 30) {
      birthdayCountdown = { days: daysUntilUnlock, birthdayDate: nextBday, unlockDate };
    }
  }

  let anniversaryCountdown: { days: number; anniversaryDate: Date; unlockDate: Date } | null = null;
  if (customer.maritalStatus === 'married' && customer.anniversary) {
    let nextAnniv = new Date(currentYear, customer.anniversary.month - 1, customer.anniversary.day);
    if (nextAnniv < now && differenceInCalendarDays(now, nextAnniv) > 30) {
      nextAnniv = new Date(currentYear + 1, customer.anniversary.month - 1, customer.anniversary.day);
    }
    const unlockDaysBefore = activeAnniversaryRules[0]?.unlockDaysBefore ?? 7;
    const unlockDate = subDays(nextAnniv, unlockDaysBefore);
    const daysUntilUnlock = differenceInCalendarDays(unlockDate, now);
    if (daysUntilUnlock >= 0 && daysUntilUnlock <= 30) {
      anniversaryCountdown = { days: daysUntilUnlock, anniversaryDate: nextAnniv, unlockDate };
    }
  }

  // Case 1: Birthday Ready (e.g. Zoya)
  if (birthdayGrant && activeBirthdayRules.length > 0) {
    return (
      <div className="p-6 bg-linear-to-r from-peach-300/30 via-shell-50 to-blush-100/50 border border-coral-600/30 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-coral-600">
            <Cake className="w-5 h-5 text-terracotta" />
            <span className="text-xs uppercase font-bold tracking-widest">Birthday Celebration</span>
          </div>
          <span className="text-[10px] font-semibold bg-terracotta text-white px-2 py-0.5 uppercase tracking-wider">
            Treat Ready
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl text-charcoal">Your Birthday Treat is Ready</h2>
          <p className="text-xs text-charcoal-muted leading-relaxed max-w-lg">
            We're celebrating you! Your birthday bonus has been credited, and your celebration voucher is ready to show at the Trove store counter.
          </p>
        </div>

        {occasionVouchers.length > 0 && (
          <div className="p-3 bg-white border border-sand-subtle flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-tide" />
              <div>
                <span className="font-semibold text-charcoal block">{occasionVouchers[0]?.title}</span>
                <span className="text-[10px] text-charcoal-muted">{occasionVouchers[0]?.valueLabel}</span>
              </div>
            </div>
            <Link to="/club/rewards">
              <button className="text-xs text-tide font-semibold hover:underline flex items-center gap-1">
                <span>View Voucher</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Case 2: Anniversary Ready
  if (anniversaryGrant && activeAnniversaryRules.length > 0) {
    return (
      <div className="p-6 bg-linear-to-r from-peach-300/30 via-shell-50 to-blush-100/50 border border-coral-600/30 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-coral-600">
            <Heart className="w-5 h-5 text-terracotta" />
            <span className="text-xs uppercase font-bold tracking-widest">Anniversary Celebration</span>
          </div>
          <span className="text-[10px] font-semibold bg-terracotta text-white px-2 py-0.5 uppercase tracking-wider">
            Treat Ready
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl text-charcoal">Happy Anniversary!</h2>
          <p className="text-xs text-charcoal-muted leading-relaxed max-w-lg">
            Wishing you and your partner a wonderful celebration. Your anniversary treat is ready to show at the Trove store counter.
          </p>
        </div>

        {occasionVouchers.length > 0 && (
          <div className="p-3 bg-white border border-sand-subtle flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Gift className="w-4 h-4 text-tide" />
              <div>
                <span className="font-semibold text-charcoal block">{occasionVouchers[0]?.title}</span>
                <span className="text-[10px] text-charcoal-muted">{occasionVouchers[0]?.valueLabel}</span>
              </div>
            </div>
            <Link to="/club/rewards">
              <button className="text-xs text-tide font-semibold hover:underline flex items-center gap-1">
                <span>View Voucher</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Case 3: Upcoming Anniversary Countdown (e.g. Aditi)
  if (anniversaryCountdown && activeAnniversaryRules.length > 0) {
    const formattedUnlock = anniversaryCountdown.unlockDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    const formattedAnniv = anniversaryCountdown.anniversaryDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });

    return (
      <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-tide">
            <Heart className="w-4 h-4 text-terracotta" />
            <span className="text-xs uppercase font-bold tracking-widest">Upcoming Celebration</span>
          </div>
          <span className="text-[11px] font-serif font-bold text-tide bg-tide/10 px-2 py-0.5">
            {anniversaryCountdown.days === 0
              ? 'Unlocks today'
              : `Unlocks in ${anniversaryCountdown.days} ${anniversaryCountdown.days === 1 ? 'day' : 'days'}`}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-xl text-charcoal">
            Your Anniversary Treat Unlocks on {formattedUnlock}
          </h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Unlocks on {formattedUnlock} · Anniversary {formattedAnniv}. As a Trove Club regular, your exclusive celebration voucher will unlock automatically.
          </p>
        </div>
      </div>
    );
  }

  // Case 4: Upcoming Birthday Countdown
  if (birthdayCountdown && activeBirthdayRules.length > 0) {
    return (
      <div className="p-6 bg-sand-card border border-sand-subtle shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-tide">
            <Cake className="w-4 h-4 text-terracotta" />
            <span className="text-xs uppercase font-bold tracking-widest">Upcoming Birthday</span>
          </div>
          <span className="text-[11px] font-serif font-bold text-tide bg-tide/10 px-2 py-0.5">
            {birthdayCountdown.days === 0
              ? 'Today!'
              : `In ${birthdayCountdown.days} days`}
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-xl text-charcoal">
            Your Birthday Treat Unlocks on{' '}
            {birthdayCountdown.unlockDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Unlocks on{' '}
            {birthdayCountdown.unlockDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}{' '}
            · Birthday{' '}
            {birthdayCountdown.birthdayDate.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
            . Get ready for celebratory Trove Points and a special treat for your special day.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
