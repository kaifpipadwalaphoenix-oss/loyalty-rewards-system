import { z } from 'zod';
import type { StaffMember } from '@/domain/types';
import { StaffMemberSchema } from '@/data/schema';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';

export const UpsertStaffInputSchema = z.object({
  staff: StaffMemberSchema,
  adminStaffId: z.string(),
});
export type UpsertStaffInput = z.infer<typeof UpsertStaffInputSchema>;

export function upsertStaff(input: UpsertStaffInput): Result<StaffMember> {
  return runCommand({
    actor: { kind: 'staff', id: input.adminStaffId },
    permission: 'staff.manage',
    schema: UpsertStaffInputSchema,
    input,
    handler: (validInput, data) => {
      const idx = data.staff.findIndex((s) => s.id === validInput.staff.id);
      const updatedStaff = [...data.staff];

      if (idx >= 0) {
        // If updating an existing staff to non-admin or inactive, check BR-53
        const current = data.staff[idx]!;
        if (
          current.role === 'admin' &&
          (validInput.staff.role !== 'admin' || !validInput.staff.active)
        ) {
          const otherActiveAdmins = data.staff.filter(
            (s) => s.id !== current.id && s.role === 'admin' && s.active
          );
          if (otherActiveAdmins.length === 0) {
            return err(
              createAppError('FORBIDDEN', 'Cannot demote or deactivate the last active administrator account')
            );
          }
        }
        updatedStaff[idx] = validInput.staff;
      } else {
        updatedStaff.push(validInput.staff);
      }

      return ok({
        nextData: {
          ...data,
          staff: updatedStaff,
        },
        value: validInput.staff,
      });
    },
    audit: (_validInput, staff) => ({
      action: 'STAFF_UPSERT',
      entity: { type: 'staff', id: staff.id },
      summary: `Upserted staff member ${staff.name} (${staff.role})`,
      after: staff as unknown as Record<string, unknown>,
    }),
  });
}

export const SetStaffActiveInputSchema = z.object({
  staffId: z.string(),
  active: z.boolean(),
  adminStaffId: z.string(),
});
export type SetStaffActiveInput = z.infer<typeof SetStaffActiveInputSchema>;

export function setStaffActive(input: SetStaffActiveInput): Result<StaffMember> {
  return runCommand({
    actor: { kind: 'staff', id: input.adminStaffId },
    permission: 'staff.manage',
    schema: SetStaffActiveInputSchema,
    input,
    handler: (validInput, data) => {
      const idx = data.staff.findIndex((s) => s.id === validInput.staffId);
      if (idx === -1) {
        return err(createAppError('NOT_FOUND', 'Staff member not found'));
      }

      const staff = data.staff[idx]!;

      // BR-53: Last active admin guard
      if (!validInput.active && staff.role === 'admin') {
        const otherActiveAdmins = data.staff.filter(
          (s) => s.id !== staff.id && s.role === 'admin' && s.active
        );
        if (otherActiveAdmins.length === 0) {
          return err(
            createAppError('FORBIDDEN', 'Cannot deactivate the last active administrator account')
          );
        }
      }

      const updated = { ...staff, active: validInput.active };
      const updatedStaff = [...data.staff];
      updatedStaff[idx] = updated;

      return ok({
        nextData: {
          ...data,
          staff: updatedStaff,
        },
        value: updated,
      });
    },
    audit: (validInput, staff) => ({
      action: 'STAFF_STATUS_CHANGE',
      entity: { type: 'staff', id: staff.id },
      summary: `${validInput.active ? 'Activated' : 'Deactivated'} staff account for ${staff.name}`,
      after: staff as unknown as Record<string, unknown>,
    }),
  });
}

export const ResetPinInputSchema = z.object({
  staffId: z.string(),
  newPin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  adminStaffId: z.string(),
});
export type ResetPinInput = z.infer<typeof ResetPinInputSchema>;

export function resetStaffPin(input: ResetPinInput): Result<StaffMember> {
  return runCommand({
    actor: { kind: 'staff', id: input.adminStaffId },
    permission: 'staff.manage',
    schema: ResetPinInputSchema,
    input,
    handler: (validInput, data) => {
      const idx = data.staff.findIndex((s) => s.id === validInput.staffId);
      if (idx === -1) {
        return err(createAppError('NOT_FOUND', 'Staff member not found'));
      }

      const staff = data.staff[idx]!;
      const updated = { ...staff, pin: validInput.newPin };
      const updatedStaff = [...data.staff];
      updatedStaff[idx] = updated;

      return ok({
        nextData: {
          ...data,
          staff: updatedStaff,
        },
        value: updated,
      });
    },
    audit: (_validInput, staff) => ({
      action: 'STAFF_PIN_RESET',
      entity: { type: 'staff', id: staff.id },
      summary: `Reset PIN for staff member ${staff.name}`,
    }),
  });
}
