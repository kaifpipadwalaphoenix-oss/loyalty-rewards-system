import { useAppStore } from '@/data/store';
import { setMemberSession, setStaffSession } from '@/data/sessions';
import type { AppData } from '@/domain/types';
import { deriveLedger } from '@/domain/ledger';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';

export interface DemoPersona {
  key: string;
  type: 'member' | 'staff';
  id: string;
  name: string;
  label: string;
  badge: string;
  description: string;
  targetRoute: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    key: 'meera',
    type: 'member',
    id: 'cust-meera',
    name: 'Meera Iyer',
    label: 'Persona A · Meera',
    badge: 'New Member · 0 pts',
    description: 'Fresh enrollee; tests zero-state, first purchase, onboarding tour.',
    targetRoute: '/club',
  },
  {
    key: 'tara',
    type: 'member',
    id: 'cust-tara',
    name: 'Tara Menon',
    label: 'Persona B · Tara',
    badge: 'Tide · 1,438 pts',
    description: 'Active shopper; tests tier upgrade to Golden Hour and reward redemption.',
    targetRoute: '/club',
  },
  {
    key: 'kabir',
    type: 'member',
    id: 'cust-kabir',
    name: 'Kabir Malhotra',
    label: 'Persona C · Kabir',
    badge: 'Shore · 1,000 pts',
    description: 'Canonical test actor: 1,000 pts -> ₹2,000 purchase -> 1,100 pts -> 500 pt redemption -> 600 pts.',
    targetRoute: '/club',
  },
  {
    key: 'zoya',
    type: 'member',
    id: 'cust-zoya',
    name: 'Zoya Siddiqui',
    label: 'Persona D · Zoya',
    badge: 'Golden Hour · 2,650 pts',
    description: 'VIP tier member with birthday 5 days away; tests VIP perks and birthday bonus.',
    targetRoute: '/club',
  },
  {
    key: 'aditi',
    type: 'member',
    id: 'cust-aditi',
    name: 'Aditi Rao',
    label: 'Persona E · Aditi',
    badge: 'Tide · 1,550 pts',
    description: 'Married member with anniversary in 9 days; tests couple visits and anniversary reward.',
    targetRoute: '/club',
  },
  {
    key: 'farhan',
    type: 'member',
    id: 'cust-farhan',
    name: 'Farhan Qureshi',
    label: 'Persona F · Farhan',
    badge: 'Shore · 700 pts (450 expiring)',
    description: 'Inactive member with 450 points expiring end of month; tests expiry urgency alert.',
    targetRoute: '/club',
  },
  {
    key: 'cashier',
    type: 'staff',
    id: 'staff-pooja',
    name: 'Pooja Nair',
    label: 'Staff · Pooja (Cashier)',
    badge: 'Counter Staff',
    description: 'Store counter staff: PIN 3456; searches members, records sales, redeems vouchers.',
    targetRoute: '/counter',
  },
  {
    key: 'manager',
    type: 'staff',
    id: 'staff-arjun',
    name: 'Arjun Shetty',
    label: 'Staff · Arjun (Manager)',
    badge: 'Store Manager',
    description: 'Manager: PIN 2345; handles adjustments, purchase voids, and staff supervision.',
    targetRoute: '/admin',
  },
  {
    key: 'admin',
    type: 'staff',
    id: 'staff-nisha',
    name: 'Nisha Varma',
    label: 'Staff · Nisha (Admin)',
    badge: 'Owner / Admin',
    description: 'Business owner & admin: PIN 1234; full access to rules, tiers, reports, and staff.',
    targetRoute: '/admin',
  },
];

export function getPersonaLiveBadge(persona: DemoPersona, data: AppData): string {
  if (persona.type === 'member') {
    const customer = data.customers.find((c) => c.id === persona.id);
    if (!customer) return persona.badge;
    const spend = qualifyingSpend(customer.id, data.purchases, new Date());
    const tier = resolveTier(spend, data.tiers);
    const ledger = deriveLedger(data.transactions, customer.id);
    const expiring = ledger.expiringSoonPoints > 0 ? ` (${ledger.expiringSoonPoints} expiring)` : '';
    return `${tier.name} · ${ledger.balance.toLocaleString('en-IN')} pts${expiring}`;
  }
  return persona.badge;
}

export function resetDemoData(): void {
  useAppStore.getState().reset();
}

export function switchPersona(personaKey: string): string {
  const persona = DEMO_PERSONAS.find((p) => p.key === personaKey);
  if (!persona) return '/';

  if (persona.type === 'member') {
    setMemberSession({
      customerId: persona.id,
      signedInAt: new Date().toISOString(),
    });
  } else {
    setStaffSession({
      staffId: persona.id,
      signedInAt: new Date().toISOString(),
    });
  }

  return persona.targetRoute;
}
