import type { z } from 'zod';
import type { AppData, AuditEntry, Role } from '@/domain/types';
import type { Permission } from '@/domain/permissions';
import { can } from '@/domain/permissions';
import { deriveLedger } from '@/domain/ledger';
import { useAppStore } from '@/data/store';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import type { AppError } from '@/lib/errors';
import { createAppError } from '@/lib/errors';

export interface CommandActor {
  kind: 'staff' | 'member' | 'system';
  id?: string;
  name?: string;
  role?: Role;
}

export interface CommandOptions<TInput, TOutput> {
  actor: CommandActor;
  permission?: Permission;
  requestId?: string;
  input: TInput;
  schema?: z.ZodType<TInput>;
  handler: (input: TInput, data: AppData) => Result<{ nextData: AppData; value: TOutput }>;
  audit?: (
    input: TInput,
    value: TOutput,
    prevData: AppData,
    nextData: AppData
  ) => Omit<AuditEntry, 'id' | 'at' | 'actor'>;
}

/**
 * Universal Command Runner.
 * Enforces permissions, input validation, audit logging, idempotency, non-negative invariant, and state commitment.
 */
export function runCommand<TInput, TOutput>(
  opts: CommandOptions<TInput, TOutput>
): Result<TOutput, AppError> {
  const currentData = useAppStore.getState().data;

  // 1. Strict staff permission check (TC-010, TC-027)
  if (opts.permission) {
    if (opts.actor.kind === 'staff') {
      const staffMember = opts.actor.id
        ? currentData.staff.find((s) => s.id === opts.actor.id)
        : undefined;
      if (!staffMember) {
        return err(createAppError('FORBIDDEN', 'Active staff account required'));
      }
      if (!staffMember.active) {
        return err(createAppError('FORBIDDEN', 'Staff account is inactive'));
      }
      // Stored role only; ignore actor.role to prevent spoofing
      const role = staffMember.role;
      if (!can(role, opts.permission)) {
        // Log PERMISSION_DENIED to audit
        const auditId = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const deniedEntry: AuditEntry = {
          id: auditId,
          at: new Date().toISOString(),
          actor: {
            kind: 'staff',
            id: staffMember.id,
            name: staffMember.name,
            role: staffMember.role,
          },
          action: 'permission_denied',
          entity: {
            type: 'security',
            id: opts.permission,
          },
          summary: `${staffMember.name} (${staffMember.role}) attempted action without required permission (${opts.permission})`,
        };
        try {
          useAppStore.getState().commit((prev) => ({
            ...prev,
            audit: [...prev.audit, deniedEntry],
          }), { skipSweeps: true });
        } catch {
          // Non-fatal if audit write fails
        }

        return err(
          createAppError('FORBIDDEN', `You do not have permission to perform this action (${opts.permission})`)
        );
      }
    } else if (opts.actor.kind !== 'system') {
      return err(createAppError('FORBIDDEN', 'Staff authentication required for this action'));
    }
  }

  // 2. Enforced Idempotency check (TC-008)
  if (opts.requestId && currentData.processedRequests[opts.requestId]) {
    const cached = currentData.processedRequests[opts.requestId]!;
    // Return cached outcome without re-running handler
    return ok(cached.resultRef as unknown as TOutput);
  }

  // 3. Schema validation
  let validatedInput = opts.input;
  if (opts.schema) {
    const parseRes = opts.schema.safeParse(opts.input);
    if (!parseRes.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseRes.error.issues) {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      }
      return err(
        createAppError(
          'VALIDATION',
          'Invalid input provided to command',
          fieldErrors,
          { issues: parseRes.error.issues }
        )
      );
    }
    validatedInput = parseRes.data;
  }

  // 4. Execute handler
  const execResult = opts.handler(validatedInput, currentData);
  if (!execResult.ok) {
    return execResult;
  }

  const { nextData, value } = execResult.value;
  const nowIso = new Date().toISOString();

  // 5. Invariant check: Balance can never go below zero (BR-14, TC-004, TC-028)
  if (nextData.transactions !== currentData.transactions) {
    const affectedCustomerIds = new Set<string>();
    for (const tx of nextData.transactions) {
      if (!currentData.transactions.includes(tx)) {
        affectedCustomerIds.add(tx.customerId);
      }
    }
    for (const custId of affectedCustomerIds) {
      const ledger = deriveLedger(nextData.transactions, custId);
      if (ledger.balance < 0) {
        const customer = nextData.customers.find((c) => c.id === custId);
        const name = customer ? customer.name : custId;
        return err(
          createAppError('CONFLICT', `This change would make ${name}'s balance negative`)
        );
      }
    }
  }

  // 6. Construct Audit Log Entry if audit generator is supplied
  const updatedAudit = [...nextData.audit];
  if (opts.audit) {
    const auditPartial = opts.audit(validatedInput, value, currentData, nextData);
    const auditId = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const fullAuditEntry: AuditEntry = {
      id: auditId,
      at: nowIso,
      actor: {
        kind: opts.actor.kind,
        id: opts.actor.id,
        name: opts.actor.name,
        role: opts.actor.role,
      },
      action: auditPartial.action,
      entity: auditPartial.entity,
      summary: auditPartial.summary,
      reason: auditPartial.reason,
      before: auditPartial.before,
      after: auditPartial.after,
    };
    updatedAudit.push(fullAuditEntry);
  }

  // 7. Record processed request with 24-hour pruning (TC-008)
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const updatedProcessed: Record<string, { at: string; resultRef: string }> = {};
  for (const [reqId, entry] of Object.entries(nextData.processedRequests || {})) {
    if (entry.at >= cutoffTime) {
      updatedProcessed[reqId] = entry;
    }
  }
  if (opts.requestId) {
    updatedProcessed[opts.requestId] = {
      at: nowIso,
      resultRef: typeof value === 'object' && value && 'id' in value ? String((value as { id: unknown }).id) : 'ok',
    };
  }

  const finalData: AppData = {
    ...nextData,
    audit: updatedAudit,
    processedRequests: updatedProcessed,
  };

  // 8. Commit changes to reactive store & storage with honest error handling (TC-009, TC-034)
  try {
    useAppStore.getState().commit(() => finalData);
  } catch {
    return err(
      createAppError(
        'STORAGE_QUOTA',
        'Unable to save data. Local storage quota exceeded or storage is unavailable.'
      )
    );
  }

  return ok(value);
}
