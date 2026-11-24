import { z } from 'zod';
import type { Customer, Notification } from '@/domain/types';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';
import { normaliseIndianMobile } from '@/lib/mobile';

export const RegisterMemberInputSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z
    .string()
    .transform((val) => normaliseIndianMobile(val) || val)
    .refine((val) => /^\+91\d{10}$/.test(val), 'Mobile must be a valid 10-digit Indian number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  birthday: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
    })
    .optional(),
  maritalStatus: z.enum(['single', 'married', 'undisclosed']).optional(),
  spouseFirstName: z.string().optional(),
  anniversary: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1950).max(2100).optional(),
    })
    .optional(),
  consentTerms: z.boolean().default(true).refine((val) => val === true, 'You must agree to the Terms & Conditions'),
  consentUpdates: z.boolean().default(true),
});
export type RegisterMemberInput = z.infer<typeof RegisterMemberInputSchema>;

export function registerMember(
  input: RegisterMemberInput,
  options?: { enrolledVia?: 'online' | 'counter'; enrolledByStaffId?: string }
): Result<Customer> {
  const channel = options?.enrolledVia ?? 'online';
  const staffId = options?.enrolledByStaffId;

  return runCommand({
    actor: staffId
      ? { kind: 'staff', id: staffId }
      : { kind: 'member', name: input.name },
    schema: RegisterMemberInputSchema,
    input,
    handler: (validInput, data) => {
      // BR-02: Check unique mobile
      const existing = data.customers.find((c) => c.mobile === validInput.mobile);
      if (existing) {
        return err(
          createAppError('CONFLICT', 'A member with this mobile number already exists', {
            mobile: 'Mobile number already registered',
          })
        );
      }

      const now = new Date();
      const nowIso = now.toISOString();

      const memberSeq = data.seq.member + 1;
      const customerId = `cust-${memberSeq}`;
      const memberNo = `TC${(100000 + memberSeq).toString()}`;

      const newCustomer: Customer = {
        id: customerId,
        memberNo,
        name: validInput.name.trim(),
        mobile: validInput.mobile,
        email: validInput.email?.trim() || undefined,
        birthday: validInput.birthday,
        maritalStatus: validInput.maritalStatus,
        spouseFirstName: validInput.spouseFirstName?.trim() || undefined,
        anniversary: validInput.anniversary,
        occasionDates: {
          birthdaySetAt: validInput.birthday ? nowIso : undefined,
          birthdayEdits: 0,
          anniversarySetAt: validInput.anniversary ? nowIso : undefined,
          anniversaryEdits: 0,
        },
        consent: {
          terms: nowIso,
          updates: validInput.consentUpdates,
        },
        enrolledAt: nowIso,
        enrolledVia: channel,
        enrolledByStaffId: staffId,
      };

      const updatedCustomers = [...data.customers, newCustomer];
      const updatedNotifications: Notification[] = [...data.notifications];

      // TC-006: New members start with 0 points (no automatic +100 welcome bonus)
      updatedNotifications.push({
        id: `notif-welcome-${customerId}`,
        customerId,
        title: 'Welcome to Trove Club!',
        body: 'Your membership is active. Start earning Trove Points with every purchase at our store.',
        kind: 'points_earned',
        at: nowIso,
      });

      const nextData = {
        ...data,
        seq: {
          ...data.seq,
          member: memberSeq,
        },
        customers: updatedCustomers,
        notifications: updatedNotifications,
      };

      return ok({
        nextData,
        value: newCustomer,
      });
    },
    audit: (_validInput, customer) => ({
      action: 'MEMBER_REGISTER',
      entity: { type: 'customer', id: customer.id },
      summary: `Member ${customer.name} (${customer.memberNo}) registered via ${channel}`,
      after: customer as unknown as Record<string, unknown>,
    }),
  });
}

export const UpdateProfileInputSchema = z.object({
  customerId: z.string(),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  birthday: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
    })
    .optional(),
  maritalStatus: z.enum(['single', 'married', 'undisclosed']).optional(),
  spouseFirstName: z.string().optional(),
  anniversary: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1950).max(2100).optional(),
    })
    .optional(),
  consentUpdates: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export function updateMemberProfile(input: UpdateProfileInput): Result<Customer> {
  return runCommand({
    actor: { kind: 'member', id: input.customerId },
    schema: UpdateProfileInputSchema,
    input,
    handler: (validInput, data) => {
      const idx = data.customers.findIndex((c) => c.id === validInput.customerId);
      if (idx === -1) {
        return err(createAppError('NOT_FOUND', 'Member not found'));
      }

      const current = data.customers[idx]!;
      const nowIso = new Date().toISOString();

      // BR-15: Birthday can be edited at most occasionSelfEdits times (default 1)
      const allowedEdits = data.config.redemption.occasionSelfEdits;
      let birthday = current.birthday;
      let birthdayEdits = current.occasionDates.birthdayEdits;
      let birthdaySetAt = current.occasionDates.birthdaySetAt;

      if (validInput.birthday) {
        const isChanging =
          !current.birthday ||
          current.birthday.day !== validInput.birthday.day ||
          current.birthday.month !== validInput.birthday.month;
        if (isChanging) {
          if (birthdayEdits >= allowedEdits) {
            return err(
              createAppError(
                'FORBIDDEN',
                `Birthday has already been set and cannot be changed online. Please visit store counter.`
              )
            );
          }
          birthday = validInput.birthday;
          birthdayEdits += 1;
          birthdaySetAt = nowIso;
        }
      }

      // BR-16: Anniversary can be edited at most occasionSelfEdits times
      let anniversary = current.anniversary;
      let anniversaryEdits = current.occasionDates.anniversaryEdits;
      let anniversarySetAt = current.occasionDates.anniversarySetAt;

      if (validInput.anniversary) {
        const isChanging =
          !current.anniversary ||
          current.anniversary.day !== validInput.anniversary.day ||
          current.anniversary.month !== validInput.anniversary.month;
        if (isChanging) {
          if (anniversaryEdits >= allowedEdits) {
            return err(
              createAppError(
                'FORBIDDEN',
                `Anniversary date has already been set and cannot be changed online. Please visit store counter.`
              )
            );
          }
          anniversary = validInput.anniversary;
          anniversaryEdits += 1;
          anniversarySetAt = nowIso;
        }
      }

      const updatedCustomer: Customer = {
        ...current,
        name: validInput.name.trim(),
        email: validInput.email !== undefined ? validInput.email.trim() || undefined : current.email,
        birthday,
        maritalStatus: validInput.maritalStatus ?? current.maritalStatus,
        spouseFirstName:
          validInput.spouseFirstName !== undefined
            ? validInput.spouseFirstName.trim() || undefined
            : current.spouseFirstName,
        anniversary,
        occasionDates: {
          birthdaySetAt,
          birthdayEdits,
          anniversarySetAt,
          anniversaryEdits,
        },
        consent: {
          ...current.consent,
          updates:
            validInput.consentUpdates !== undefined
              ? validInput.consentUpdates
              : current.consent.updates,
        },
      };

      const updatedCustomers = [...data.customers];
      updatedCustomers[idx] = updatedCustomer;

      return ok({
        nextData: { ...data, customers: updatedCustomers },
        value: updatedCustomer,
      });
    },
    audit: (validInput, updated, prev) => {
      const beforeCust = prev.customers.find((c) => c.id === validInput.customerId);
      return {
        action: 'MEMBER_UPDATE',
        entity: { type: 'customer', id: updated.id },
        summary: `Member ${updated.name} updated profile`,
        before: beforeCust as unknown as Record<string, unknown>,
        after: updated as unknown as Record<string, unknown>,
      };
    },
  });
}
