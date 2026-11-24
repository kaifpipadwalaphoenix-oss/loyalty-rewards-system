import type { PointsTransaction } from './types';
import { isCalendarDateWithinDays } from './dates';

export interface PointsLot {
  txnId: string;
  purchaseId?: string;
  amount: number;
  remaining: number;
  at: string;
  expiresAt: string | null;
}

export interface ExpiryScheduleEntry {
  date: string; // ISO date string of expiry
  points: number;
  soon: boolean;
}

export interface DerivedLedger {
  balance: number;
  lots: PointsLot[];
  expiringSoonPoints: number;
  expiringSoonDate: string | null;
  schedule: ExpiryScheduleEntry[];
  runningBalances: Record<string, number>;
}

/**
 * Derives the balance, lots, FIFO allocations, and expiry schedule for a customer's transactions.
 * Pure function. Single source of truth is the immutable transactions list.
 */
export function deriveLedger(
  transactions: PointsTransaction[],
  arg2?: string | Date,
  arg3?: Date | number,
  arg4?: number
): DerivedLedger {
  let customerId: string | undefined;
  let now = new Date();
  let expiringSoonDays = 30;

  if (typeof arg2 === 'string') {
    customerId = arg2;
    if (arg3 instanceof Date) now = arg3;
    if (typeof arg4 === 'number') expiringSoonDays = arg4;
  } else if (arg2 instanceof Date) {
    now = arg2;
    if (typeof arg3 === 'number') expiringSoonDays = arg3;
  }

  const customerTransactions = customerId
    ? transactions.filter((t) => t.customerId === customerId)
    : transactions;

  // Sort transactions chronologically by (at, ref)
  const sorted = [...customerTransactions].sort((a, b) => {
    if (a.at !== b.at) return a.at.localeCompare(b.at);
    return (a.ref || a.id).localeCompare(b.ref || b.id);
  });

  const lots: PointsLot[] = [];
  const runningBalances: Record<string, number> = {};
  let currentBalance = 0;

  for (const txn of sorted) {
    if (txn.points > 0) {
      // Credit: creates a lot
      const lot: PointsLot = {
        txnId: txn.id,
        purchaseId: txn.purchaseId,
        amount: txn.points,
        remaining: txn.points,
        at: txn.at,
        expiresAt: txn.expiresAt ?? null,
      };
      lots.push(lot);
      currentBalance += txn.points;
    } else if (txn.type === 'EXPIRE') {
      // Direct expiration of a specific lot
      const lot = lots.find((l) => l.txnId === txn.expiresLotTxnId);
      if (lot) {
        const toDeduct = Math.min(lot.remaining, Math.abs(txn.points));
        lot.remaining -= toDeduct;
      }
      currentBalance += txn.points; // txn.points is negative
    } else if (txn.type === 'PURCHASE_VOID') {
      // BR-47: Voids consume ONLY their own purchase's lot
      const ownLot = lots.find(
        (l) => (txn.purchaseId && l.purchaseId === txn.purchaseId) || l.txnId === txn.purchaseId
      );
      if (ownLot) {
        const toDeduct = Math.min(ownLot.remaining, Math.abs(txn.points));
        ownLot.remaining -= toDeduct;
      }
      currentBalance += txn.points; // txn.points is negative
    } else {
      // Generic Debit (REDEEM, ADJUST_DEBIT): FIFO by earliest expiry
      let debitRemaining = Math.abs(txn.points);
      const txnTime = txn.at;

      // Available lots: lots not yet expired at this debit's transaction time
      const eligibleLots = lots
        .filter((l) => l.remaining > 0 && (!l.expiresAt || l.expiresAt > txnTime))
        .sort((a, b) => {
          // Earliest expiry first; null (non-expiring) last
          if (a.expiresAt && b.expiresAt) {
            return a.expiresAt.localeCompare(b.expiresAt);
          }
          if (a.expiresAt && !b.expiresAt) return -1;
          if (!a.expiresAt && b.expiresAt) return 1;
          return a.at.localeCompare(b.at);
        });

      for (const lot of eligibleLots) {
        if (debitRemaining <= 0) break;
        const consume = Math.min(lot.remaining, debitRemaining);
        lot.remaining -= consume;
        debitRemaining -= consume;
      }

      currentBalance += txn.points; // txn.points is negative
    }

    runningBalances[txn.id] = currentBalance;
  }

  // Active lots with remaining points
  const activeLots = lots.filter((l) => l.remaining > 0);

  // Group remaining lots by distinct expiry dates
  const expiryMap = new Map<string, number>();
  for (const lot of activeLots) {
    if (lot.expiresAt) {
      const existing = expiryMap.get(lot.expiresAt) || 0;
      expiryMap.set(lot.expiresAt, existing + lot.remaining);
    }
  }

  // Build sorted schedule of future expiries
  const scheduleEntries: ExpiryScheduleEntry[] = Array.from(expiryMap.entries())
    .map(([dateStr, pts]) => {
      const expDate = new Date(dateStr);
      const isSoon = isCalendarDateWithinDays(expDate, now, expiringSoonDays);
      return {
        date: dateStr,
        points: pts,
        soon: isSoon,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Points expiring soon (within window)
  let expiringSoonPoints = 0;
  let expiringSoonDate: string | null = null;

  for (const entry of scheduleEntries) {
    if (entry.soon) {
      expiringSoonPoints += entry.points;
      if (!expiringSoonDate) {
        expiringSoonDate = entry.date;
      }
    }
  }

  // Take the next 3 expiry dates for the schedule (BR-19)
  const schedule = scheduleEntries.slice(0, 3);

  return {
    balance: currentBalance,
    lots: activeLots,
    expiringSoonPoints,
    expiringSoonDate,
    schedule,
    runningBalances,
  };
}

/**
 * Returns remaining unspent and unexpired points for a specific earn lot at a given time.
 * Pure function built on deriveLedger.
 */
export function remainingForLot(
  transactions: PointsTransaction[],
  customerId: string,
  earnTxnId: string,
  at: Date = new Date()
): number {
  const ledger = deriveLedger(transactions, customerId, at);
  const lot = ledger.lots.find((l) => l.txnId === earnTxnId);
  if (!lot) return 0;
  if (lot.expiresAt && lot.expiresAt <= at.toISOString()) return 0;
  return Math.max(0, lot.remaining);
}

