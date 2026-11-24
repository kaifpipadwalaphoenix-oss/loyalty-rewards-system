import type { Customer } from '@/domain/types';

export const POPULATION_NAMES = [
  'Ananya Deshmukh',
  'Vikram Sen',
  'Priyanka Kapoor',
  'Rohan Mehta',
  'Sneha Kulkarni',
  'Arvind Swaminathan',
  'Neha Bhatia',
  'Devika Pillai',
  'Kunal Singhania',
  'Ayesha Chawla',
  'Siddharth Joshi',
  'Meenakshi Sundaram',
  'Karan Oberoi',
  'Shalini Nambiar',
  'Gautam Banerjee',
  'Tanvi Aggarwal',
  'Harshavardhan Rane',
  'Ritu Saxena',
];

export function createPopulationMembers(): Customer[] {
  return POPULATION_NAMES.map((name, idx) => {
    const numStr = (idx + 7).toString().padStart(5, '0');
    const memberNo = `TC1${numStr}`;
    const mobileDigits = (idx + 7).toString().padStart(5, '0');
    const mobile = `+9190000${mobileDigits}`;

    const isMarried = idx % 3 === 0;

    return {
      id: `cust-pop-${idx + 1}`,
      memberNo,
      name,
      mobile,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      maritalStatus: isMarried ? 'married' : idx % 2 === 0 ? 'single' : 'undisclosed',
      spouseFirstName: isMarried ? (idx % 2 === 0 ? 'Sameer' : 'Kavita') : undefined,
      birthday: {
        day: (idx * 3 + 4) % 28 + 1,
        month: (idx % 12) + 1,
      },
      anniversary: isMarried
        ? {
            day: (idx * 5 + 7) % 28 + 1,
            month: ((idx + 4) % 12) + 1,
            year: 2018 + (idx % 6),
          }
        : undefined,
      occasionDates: {
        birthdaySetAt: '2025-01-15T09:00:00.000Z',
        birthdayEdits: 0,
        anniversarySetAt: isMarried ? '2025-01-15T09:00:00.000Z' : undefined,
        anniversaryEdits: 0,
      },
      consent: {
        terms: '2025-01-15T09:00:00.000Z',
        updates: true,
      },
      enrolledAt: idx < 3 ? '2026-11-10T10:00:00.000Z' : '2025-06-01T10:00:00.000Z',
      enrolledVia: idx % 2 === 0 ? 'counter' : 'online',
      enrolledByStaffId: idx % 2 === 0 ? (idx % 4 === 0 ? 'staff-pooja' : 'staff-imran') : undefined,
    };
  });
}
