import { z } from 'zod';
import type { PointsTransaction } from '@/domain/types';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';
import { deriveLedger } from '@/domain/ledger';
import { expiryDateFor } from '@/domain/expiry';

export const AdjustPointsInputSchema = z.object({
  customerId: z.string(),
  type: z.enum(['ADJUST_CREDIT', 'ADJUST_DEBIT']),
  points: z.number().int().min(1, 'Points must be a positive integer'),
  category: z.string().min(1, 'Category is required'),
  note: z.string().min(3, 'A note explaining the adjustment is required'),
  staffId: z.string(),
});
export type AdjustPointsInput = z.infer<typeof AdjustPointsInputSchema>;

export function adjustPoints(input: AdjustPointsInput): Result<PointsTransaction> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'points.adjust',
    schema: AdjustPointsInputSchema,
    input,
    handler: (validInput, data) => {
      const customer = data.customers.find((c) => c.id === validInput.customerId);
      if (!customer) {
        return err(createAppError('NOT_FOUND', 'Customer not found'));
      }

      const now = new Date();
      const nowIso = now.toISOString();

      if (validInput.type === 'ADJUST_DEBIT') {
        const derived = deriveLedger(data.transactions, customer.id, now);
        if (derived.balance < validInput.points) {
          return err(
            createAppError(
              'INSUFFICIENT_POINTS',
              `Cannot debit ${validInput.points} points. Member only has ${derived.balance} points.`
            )
          );
        }
      }

      let txnSeq = data.seq.txn;
      const txnId = `txn-${txnSeq++}`;
      const signedPoints = validInput.type === 'ADJUST_CREDIT' ? validInput.points : -validInput.points;

      const expiresAt =
        validInput.type === 'ADJUST_CREDIT'
          ? expiryDateFor(data.config.expiry, now)
          : null;

      const txn: PointsTransaction = {
        id: txnId,
        ref: `TX-${txnSeq.toString().padStart(6, '0')}`,
        customerId: customer.id,
        type: validInput.type,
        points: signedPoints,
        at: nowIso,
        actor: { kind: 'staff', id: validInput.staffId },
        expiresAt: expiresAt ?? null,
        reason: {
          category: validInput.category,
          note: validInput.note,
        },
        description: `Manual adjustment: ${validInput.note}`,
      };

      const notification = {
        id: `notif-adjust-${txnId}`,
        customerId: customer.id,
        title: validInput.type === 'ADJUST_CREDIT' ? 'Points Credited' : 'Points Debited',
        body: `${validInput.points} Trove Points were ${
          validInput.type === 'ADJUST_CREDIT' ? 'credited to' : 'debited from'
        } your account (${validInput.category}: ${validInput.note}).`,
        kind: 'adjusted' as const,
        at: nowIso,
      };

      return ok({
        nextData: {
          ...data,
          seq: {
            ...data.seq,
            txn: txnSeq,
          },
          transactions: [...data.transactions, txn],
          notifications: [...data.notifications, notification],
        },
        value: txn,
      });
    },
    audit: (validInput, txn) => ({
      action: 'POINTS_ADJUST',
      entity: { type: 'customer', id: validInput.customerId },
      summary: `${validInput.type === 'ADJUST_CREDIT' ? 'Credited' : 'Debited'} ${
        validInput.points
      } points for member ${validInput.customerId}: ${validInput.note}`,
      after: txn as unknown as Record<string, unknown>,
    }),
  });
}
