import { subDays, subMonths, addDays } from 'date-fns';
import type { Customer } from '@/domain/types';

export function createScenarioMembers(now: Date = new Date()): Customer[] {
  // Zoya birthday: now + 5 days
  const zoyaBdayDate = addDays(now, 5);

  // Aditi anniversary: now + 9 days
  const aditiAnnivDate = addDays(now, 9);

  return [
    // Persona A: Meera Iyer (New member, 0 pts, onboarding)
    {
      id: 'cust-meera',
      memberNo: 'TC100001',
      name: 'Meera Iyer',
      mobile: '+919000000001',
      email: 'meera.iyer@example.com',
      occasionDates: {
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: {
        terms: now.toISOString(),
        updates: true,
      },
      enrolledAt: now.toISOString(),
      enrolledVia: 'online',
    },

    // Persona B, C: Tara Menon (Active member nearing Golden Hour, 1,438 pts)
    {
      id: 'cust-tara',
      memberNo: 'TC100002',
      name: 'Tara Menon',
      mobile: '+919000000002',
      email: 'tara.menon@example.com',
      maritalStatus: 'single',
      birthday: { day: 14, month: 8 },
      occasionDates: {
        birthdaySetAt: subMonths(now, 11).toISOString(),
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: {
        terms: subMonths(now, 11).toISOString(),
        updates: true,
      },
      enrolledAt: subMonths(now, 11).toISOString(),
      enrolledVia: 'online',
    },

    // Persona F: Kabir Malhotra (Shore tier, exactly 1,000 pts)
    {
      id: 'cust-kabir',
      memberNo: 'TC100003',
      name: 'Kabir Malhotra',
      mobile: '+919000000003',
      email: 'kabir.m@example.com',
      maritalStatus: 'single',
      birthday: { day: 22, month: 3 },
      occasionDates: {
        birthdaySetAt: subMonths(now, 9).toISOString(),
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: {
        terms: subMonths(now, 9).toISOString(),
        updates: true,
      },
      enrolledAt: subMonths(now, 9).toISOString(),
      enrolledVia: 'counter',
      enrolledByStaffId: 'staff-pooja',
    },

    // Persona D: Zoya Siddiqui (Golden Hour, birthday in 5 days, 250 pts + 15% treat)
    {
      id: 'cust-zoya',
      memberNo: 'TC100004',
      name: 'Zoya Siddiqui',
      mobile: '+919000000004',
      email: 'zoya.s@example.com',
      maritalStatus: 'single',
      birthday: {
        day: zoyaBdayDate.getDate(),
        month: zoyaBdayDate.getMonth() + 1,
      },
      occasionDates: {
        birthdaySetAt: subDays(now, 400).toISOString(),
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: {
        terms: subDays(now, 400).toISOString(),
        updates: true,
      },
      enrolledAt: subDays(now, 400).toISOString(),
      enrolledVia: 'online',
    },

    // Persona E, G: Aditi Rao (Tide tier, married to Rohan, anniversary in 9 days, couple visit eligible)
    {
      id: 'cust-aditi',
      memberNo: 'TC100005',
      name: 'Aditi Rao',
      mobile: '+919000000005',
      email: 'aditi.rao@example.com',
      maritalStatus: 'married',
      spouseFirstName: 'Rohan',
      anniversary: {
        day: aditiAnnivDate.getDate(),
        month: aditiAnnivDate.getMonth() + 1,
        year: 2019,
      },
      occasionDates: {
        anniversarySetAt: subDays(now, 300).toISOString(),
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: {
        terms: subDays(now, 300).toISOString(),
        updates: true,
      },
      enrolledAt: subDays(now, 300).toISOString(),
      enrolledVia: 'online',
    },

    // Persona I: Farhan Qureshi (Shore tier, 450 pts expiring end of this month, 250 next month, 200 expired)
    {
      id: 'cust-farhan',
      memberNo: 'TC100006',
      name: 'Farhan Qureshi',
      mobile: '+919000000006',
      email: 'farhan.q@example.com',
      maritalStatus: 'single',
      birthday: { day: 10, month: 5 },
      occasionDates: {
        birthdaySetAt: subMonths(now, 14).toISOString(),
        birthdayEdits: 0,
        anniversaryEdits: 0,
      },
      consent: {
        terms: subMonths(now, 14).toISOString(),
        updates: true,
      },
      enrolledAt: subMonths(now, 14).toISOString(),
      enrolledVia: 'counter',
      enrolledByStaffId: 'staff-imran',
    },
  ];
}
