import { z } from 'zod';
import type { CoupleVisit, PointsTransaction } from '@/domain/types';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';
import { checkCoupleVisitEligibility } from '@/domain/couple';
import { expiryDateFor } from '@/domain/expiry';

export const RecordCoupleVisitInputSchema = z.object({
  customerId: z.string(),
  staffId: z.string(),
  requestId: z.string().optional(),
});
export type RecordCoupleVisitInput = z.infer<typeof RecordCoupleVisitInputSchema>;

export interface RecordCoupleVisitResult {
  coupleVisit: CoupleVisit;
  transaction: PointsTransaction;
}

export function recordCoupleVisit(
  input: RecordCoupleVisitInput
): Result<RecordCoupleVisitResult> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'counter.use',
    requestId: input.requestId,
    schema: RecordCoupleVisitInputSchema,
    input,
    handler: (validInput, data) => {
      const customer = data.customers.find((c) => c.id === validInput.customerId);
      if (!customer) {
        return err(createAppError('NOT_FOUND', 'Customer not found'));
      }

      const now = new Date();
      const nowIso = now.toISOString();

      const eligibility = checkCoupleVisitEligibility(
        customer,
        data.coupleVisits,
        data.config.couple,
        now
      );

      if (!eligibility.eligible) {
        return err(
          createAppError('NOT_ELIGIBLE', eligibility.reason ?? 'Customer is not eligible for couple visit bonus')
        );
      }

      const visitSeq = data.coupleVisits.length + 1;
      let txnSeq = data.seq.txn;

      const visitId = `visit-${visitSeq}`;
      const txnId = `txn-${txnSeq++}`;
      const bonusPoints = data.config.couple.bonusPoints;
      const expiresAt = expiryDateFor(data.config.expiry, now);

      const coupleVisit: CoupleVisit = {
        id: visitId,
        customerId: customer.id,
        at: nowIso,
        staffId: validInput.staffId,
        bonusPoints,
        txnId,
      };

      const txn: PointsTransaction = {
        id: txnId,
        ref: `TX-${txnSeq.toString().padStart(6, '0')}`,
        customerId: customer.id,
        type: 'EARN_BONUS',
        points: bonusPoints,
        at: nowIso,
        actor: { kind: 'staff', id: validInput.staffId },
        coupleVisitId: visitId,
        expiresAt: expiresAt ?? null,
        description: 'Couple visit bonus',
      };

      const notification = {
        id: `notif-couple-${visitId}`,
        customerId: customer.id,
        title: 'Couple Visit Bonus!',
        body: `You received ${bonusPoints} Trove Points for visiting with your partner!`,
        kind: 'points_earned' as const,
        at: nowIso,
      };

      return ok({
        nextData: {
          ...data,
          seq: {
            ...data.seq,
            txn: txnSeq,
          },
          coupleVisits: [...data.coupleVisits, coupleVisit],
          transactions: [...data.transactions, txn],
          notifications: [...data.notifications, notification],
        },
        value: { coupleVisit, transaction: txn },
      });
    },
    audit: (validInput, result) => ({
      action: 'COUPLE_VISIT_RECORD',
      entity: { type: 'couple_visit', id: result.coupleVisit.id },
      summary: `Recorded couple visit for ${validInput.customerId} (+${result.coupleVisit.bonusPoints} pts)`,
      after: result.coupleVisit as unknown as Record<string, unknown>,
    }),
  });
}
