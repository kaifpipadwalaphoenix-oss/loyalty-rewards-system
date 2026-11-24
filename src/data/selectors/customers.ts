import type { AppData, Customer, Tier } from '@/domain/types';
import { deriveLedger } from '@/domain/ledger';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';

export interface CustomerListItem {
  customer: Customer;
  tier: Tier;
  balance: number;
  qualifyingSpendPaise: number;
  lifetimeSpendPaise: number;
  purchaseCount: number;
  lastPurchaseAt?: string;
}

export function selectCustomerList(
  data: AppData,
  now: Date = new Date()
): CustomerListItem[] {
  return data.customers.map((customer) => {
    const derived = deriveLedger(data.transactions, customer.id, now);
    const qualifying = qualifyingSpend(data.purchases, customer.id, now);
    const tier = resolveTier(qualifying, data.tiers);

    const activePurchases = data.purchases.filter(
      (p) => p.customerId === customer.id && !p.voided
    );

    const lifetimeSpendPaise = activePurchases.reduce(
      (sum, p) => sum + p.amountPaise,
      0
    );

    const sortedPurchases = [...activePurchases].sort((a, b) =>
      b.at.localeCompare(a.at)
    );
    const lastPurchaseAt = sortedPurchases[0]?.at;

    return {
      customer,
      tier,
      balance: derived.balance,
      qualifyingSpendPaise: qualifying,
      lifetimeSpendPaise,
      purchaseCount: activePurchases.length,
      lastPurchaseAt,
    };
  });
}
