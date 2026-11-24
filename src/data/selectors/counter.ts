import type { AppData, Customer, Tier, IssuedVoucher, Purchase } from '@/domain/types';
import { deriveLedger } from '@/domain/ledger';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';
import { checkCoupleVisitEligibility } from '@/domain/couple';

export interface CounterCustomerView {
  customer: Customer;
  tier: Tier;
  balance: number;
  qualifyingSpendPaise: number;
  coupleVisitEligible: boolean;
  coupleVisitIneligibilityReason?: string;
  activeVouchers: IssuedVoucher[];
  recentPurchases: Purchase[];
}

export function searchCounterCustomers(
  data: AppData,
  query: string
): Customer[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Match digits (phone or memberNo)
  const cleanDigits = q.replace(/\D/g, '');

  return data.customers.filter((c) => {
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.memberNo.toLowerCase().includes(q)) return true;
    if (cleanDigits.length >= 4 && c.mobile.includes(cleanDigits)) return true;
    return false;
  }).slice(0, 8);
}

export function selectCounterCustomerDetails(
  data: AppData,
  customerId: string,
  now: Date = new Date()
): CounterCustomerView | null {
  const customer = data.customers.find((c) => c.id === customerId);
  if (!customer) return null;

  const spend = qualifyingSpend(data.purchases, customer.id, now);
  const tier = resolveTier(spend, data.tiers);
  const derived = deriveLedger(data.transactions, customer.id, now);

  const coupleCheck = checkCoupleVisitEligibility(
    customer,
    data.coupleVisits,
    data.config.couple,
    now
  );

  const nowIso = now.toISOString();
  const activeVouchers = data.vouchers.filter(
    (v) => v.customerId === customer.id && v.status === 'issued' && v.expiresAt >= nowIso
  );

  const recentPurchases = data.purchases
    .filter((p) => p.customerId === customer.id)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);

  return {
    customer,
    tier,
    balance: derived.balance,
    qualifyingSpendPaise: spend,
    coupleVisitEligible: coupleCheck.eligible,
    coupleVisitIneligibilityReason: coupleCheck.reason,
    activeVouchers,
    recentPurchases,
  };
}
