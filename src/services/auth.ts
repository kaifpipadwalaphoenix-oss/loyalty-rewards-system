import type { Customer, StaffMember } from '@/domain/types';
import { useAppStore } from '@/data/store';
import {
  setMemberSession,
  clearMemberSession,
  getMemberSession,
  setStaffSession,
  clearStaffSession,
  getStaffSession,
} from '@/data/sessions';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';
import { normaliseIndianMobile } from '@/lib/mobile';

export const DEMO_OTP = '123456';

export interface RequestOtpResult {
  mobile: string;
  demoOtp: string;
  isRegistered: boolean;
  customerId?: string;
}

interface PendingOtp {
  code: string;
  expiresAt: number;
  attempts: number;
}
const pendingOtps = new Map<string, PendingOtp>();

export function generateRandomOtp(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
}

export function requestMemberOtp(mobile: string): RequestOtpResult {
  const normalised = normaliseIndianMobile(mobile) || mobile.replace(/\D/g, '').slice(-10);
  const data = useAppStore.getState().data;
  const customer = data.customers.find((c) => c.mobile === normalised);

  // Generate 6-digit simulated OTP (valid 5 min, max 3 attempts)
  const demoOtp = generateRandomOtp();
  pendingOtps.set(normalised, {
    code: demoOtp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  });

  return {
    mobile: normalised,
    demoOtp,
    isRegistered: !!customer,
    customerId: customer?.id,
  };
}

export function verifyMemberOtp(mobile: string, otp: string): Result<Customer> {
  const normalised = normaliseIndianMobile(mobile) || mobile.replace(/\D/g, '').slice(-10);
  const pending = pendingOtps.get(normalised);
  const expectedCode = pending?.code ?? DEMO_OTP;

  if (pending) {
    if (Date.now() > pending.expiresAt) {
      pendingOtps.delete(normalised);
      return err(createAppError('VALIDATION', 'OTP has expired. Please request a new code.'));
    }
    if (pending.attempts >= 3) {
      pendingOtps.delete(normalised);
      return err(createAppError('VALIDATION', 'Maximum verification attempts exceeded. Please request a new OTP.'));
    }
  }

  // Accept generated OTP or demo OTP (123456)
  if (otp !== expectedCode && otp !== DEMO_OTP) {
    if (pending) pending.attempts++;
    return err(createAppError('VALIDATION', 'Invalid OTP. Enter the 6-digit code shown in the demo helper.'));
  }

  pendingOtps.delete(normalised);

  const data = useAppStore.getState().data;
  const customer = data.customers.find((c) => c.mobile === normalised);
  if (!customer) {
    return err(
      createAppError('NOT_FOUND', 'No account found for this mobile number. Please sign up.')
    );
  }

  setMemberSession({
    customerId: customer.id,
    signedInAt: new Date().toISOString(),
  });

  return ok(customer);
}

export function verifyRegistrationOtp(mobile: string, otp: string): Result<{ mobile: string }> {
  const normalised = normaliseIndianMobile(mobile) || mobile.replace(/\D/g, '').slice(-10);
  const pending = pendingOtps.get(normalised);
  const expectedCode = pending?.code ?? DEMO_OTP;

  if (pending) {
    if (Date.now() > pending.expiresAt) {
      pendingOtps.delete(normalised);
      return err(createAppError('VALIDATION', 'OTP has expired. Please request a new code.'));
    }
    if (pending.attempts >= 3) {
      pendingOtps.delete(normalised);
      return err(createAppError('VALIDATION', 'Maximum verification attempts exceeded. Please request a new OTP.'));
    }
  }

  // Accept generated OTP or demo OTP (123456)
  if (otp !== expectedCode && otp !== DEMO_OTP) {
    if (pending) pending.attempts++;
    return err(createAppError('VALIDATION', 'Invalid OTP. Enter the 6-digit code shown in the demo helper.'));
  }

  pendingOtps.delete(normalised);
  return ok({ mobile: normalised });
}

export function memberSignOut(): void {
  clearMemberSession();
}

export function getCurrentMember(): Customer | null {
  const session = getMemberSession();
  if (!session) return null;
  const data = useAppStore.getState().data;
  return data.customers.find((c) => c.id === session.customerId) ?? null;
}

export function staffSignIn(staffId: string, pin: string): Result<StaffMember> {
  const data = useAppStore.getState().data;
  const staff = data.staff.find((s) => s.id === staffId);

  if (!staff) {
    return err(createAppError('NOT_FOUND', 'Staff member not found'));
  }

  if (!staff.active) {
    return err(createAppError('FORBIDDEN', 'This staff account has been deactivated'));
  }

  if (staff.pin !== pin) {
    return err(createAppError('VALIDATION', 'Incorrect PIN'));
  }

  setStaffSession({
    staffId: staff.id,
    signedInAt: new Date().toISOString(),
  });

  // Log audit entry for login
  runCommand({
    actor: {
      kind: 'staff',
      id: staff.id,
      name: staff.name,
      role: staff.role,
    },
    input: {},
    handler: (_, d) => ok({ nextData: d, value: true }),
    audit: () => ({
      action: 'LOGIN',
      entity: { type: 'staff', id: staff.id },
      summary: `${staff.name} signed into ${staff.role} portal`,
    }),
  });

  return ok(staff);
}

export function staffSignOut(): void {
  const staff = getCurrentStaff();
  if (staff) {
    runCommand({
      actor: {
        kind: 'staff',
        id: staff.id,
        name: staff.name,
        role: staff.role,
      },
      input: {},
      handler: (_, d) => ok({ nextData: d, value: true }),
      audit: () => ({
        action: 'LOGOUT',
        entity: { type: 'staff', id: staff.id },
        summary: `${staff.name} signed out`,
      }),
    });
  }
  clearStaffSession();
}

export function getCurrentStaff(): StaffMember | null {
  const session = getStaffSession();
  if (!session) return null;
  const data = useAppStore.getState().data;
  return data.staff.find((s) => s.id === session.staffId) ?? null;
}
