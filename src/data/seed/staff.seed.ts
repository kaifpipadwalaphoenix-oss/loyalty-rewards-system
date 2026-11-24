import type { StaffMember } from '@/domain/types';

export const seedStaff: StaffMember[] = [
  {
    id: 'staff-nisha',
    name: 'Nisha Varma',
    role: 'admin',
    pin: '1234',
    active: true,
    createdAt: '2025-01-01T09:00:00.000Z',
    lastSignInAt: '2026-11-24T09:15:00.000Z',
  },
  {
    id: 'staff-arjun',
    name: 'Arjun Shetty',
    role: 'manager',
    pin: '2345',
    active: true,
    createdAt: '2025-01-01T09:00:00.000Z',
    lastSignInAt: '2026-11-24T09:45:00.000Z',
  },
  {
    id: 'staff-pooja',
    name: 'Pooja Nair',
    role: 'cashier',
    pin: '3456',
    active: true,
    createdAt: '2025-01-01T09:00:00.000Z',
    lastSignInAt: '2026-11-24T10:00:00.000Z',
  },
  {
    id: 'staff-imran',
    name: 'Imran Sheikh',
    role: 'cashier',
    pin: '4567',
    active: true,
    createdAt: '2025-02-01T09:00:00.000Z',
    lastSignInAt: '2026-11-23T16:20:00.000Z',
  },
  {
    id: 'staff-leela',
    name: "Leela D'Souza",
    role: 'cashier',
    pin: '5678',
    active: false, // Inactive staff (Tech Arch §9)
    createdAt: '2025-01-01T09:00:00.000Z',
  },
];
