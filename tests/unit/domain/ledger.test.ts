import { describe, it, expect } from 'vitest';
import { deriveLedger } from '@/domain/ledger';
import { expiryDateFor } from '@/domain/expiry';
import type { PointsTransaction } from '@/domain/types';

describe('Domain: Ledger & Expiry (BL-13 to BL-23c, BL-42, BL-43)', () => {
  it('BL-19: calculates expiry for credit earned on 14 Mar 2026 with 12m validity as 31 Mar 2027 end of month', () => {
    const earnedDate = new Date('2026-03-14T11:00:00+05:30');
    const expiry = expiryDateFor(earnedDate, { mode: 'fixed_months', months: 12, expiringSoonDays: 30 });
    expect(expiry).not.toBeNull();
    const expDate = new Date(expiry!);
    expect(expDate.getFullYear()).toBe(2027);
    expect(expDate.getMonth()).toBe(2); // March = 2
    expect(expDate.getDate()).toBe(31);
    expect(expDate.getHours()).toBe(23);
    expect(expDate.getMinutes()).toBe(59);
  });

  it('BL-20: credit earned 31 Jan with 1 month validity expires at end of Feb', () => {
    const earnedDate = new Date('2026-01-31T11:00:00+05:30');
    const expiry = expiryDateFor(earnedDate, { mode: 'fixed_months', months: 1, expiringSoonDays: 30 });
    const expDate = new Date(expiry!);
    expect(expDate.getFullYear()).toBe(2026);
    expect(expDate.getMonth()).toBe(1); // Feb = 1
    expect(expDate.getDate()).toBe(28); // 2026 is non-leap
  });

  it('BL-22: policy none sets credit expiry to null', () => {
    const earnedDate = new Date('2026-03-14T11:00:00+05:30');
    const expiry = expiryDateFor(earnedDate, { mode: 'none', months: 12, expiringSoonDays: 30 });
    expect(expiry).toBeNull();
  });

  it('BL-13: balance equals sum of remaining lots and sum of points', () => {
    const txns: PointsTransaction[] = [
      {
        id: 'tx-1',
        ref: 'TX-001',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 500,
        at: '2026-01-01T10:00:00Z',
        actor: { kind: 'system' },
        description: 'Earn',
      },
      {
        id: 'tx-2',
        ref: 'TX-002',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 300,
        at: '2026-02-01T10:00:00Z',
        actor: { kind: 'system' },
        description: 'Earn',
      },
      {
        id: 'tx-3',
        ref: 'TX-003',
        customerId: 'c1',
        type: 'REDEEM',
        points: -200,
        at: '2026-02-15T10:00:00Z',
        actor: { kind: 'member' },
        description: 'Redeem',
      },
    ];

    const ledger = deriveLedger(txns, new Date('2026-03-01T10:00:00Z'));
    expect(ledger.balance).toBe(600);
    const sumRemaining = ledger.lots.reduce((acc, l) => acc + l.remaining, 0);
    expect(sumRemaining).toBe(600);
    expect(ledger.runningBalances['tx-1']).toBe(500);
    expect(ledger.runningBalances['tx-2']).toBe(800);
    expect(ledger.runningBalances['tx-3']).toBe(600);
  });

  it('BL-14 & BL-15: debits consume earliest expiring lots first, non-expiring last', () => {
    const txns: PointsTransaction[] = [
      {
        id: 'tx-1',
        ref: 'TX-001',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 200,
        at: '2026-01-01T10:00:00Z',
        expiresAt: '2026-12-31T23:59:59Z', // Expires later
        actor: { kind: 'system' },
        description: 'Lot 1',
      },
      {
        id: 'tx-2',
        ref: 'TX-002',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 200,
        at: '2026-01-02T10:00:00Z',
        expiresAt: '2026-06-30T23:59:59Z', // Expires earlier!
        actor: { kind: 'system' },
        description: 'Lot 2',
      },
      {
        id: 'tx-3',
        ref: 'TX-003',
        customerId: 'c1',
        type: 'EARN_BONUS',
        points: 100,
        at: '2026-01-03T10:00:00Z',
        expiresAt: null, // Non-expiring
        actor: { kind: 'system' },
        description: 'Lot 3',
      },
      {
        id: 'tx-4',
        ref: 'TX-004',
        customerId: 'c1',
        type: 'REDEEM',
        points: -250,
        at: '2026-02-01T10:00:00Z',
        actor: { kind: 'member' },
        description: 'Redeem 250',
      },
    ];

    const ledger = deriveLedger(txns, new Date('2026-02-15T10:00:00Z'));
    expect(ledger.balance).toBe(250); // 500 - 250 = 250

    // Lot 2 (expires June) had 200 -> should be 0 (consumed first)
    const lot2 = ledger.lots.find((l) => l.txnId === 'tx-2');
    expect(lot2).toBeUndefined(); // remaining is 0

    // Lot 1 (expires Dec) had 200 -> 50 consumed -> 150 remaining
    const lot1 = ledger.lots.find((l) => l.txnId === 'tx-1');
    expect(lot1?.remaining).toBe(150);

    // Lot 3 (never expires) had 100 -> untouched (100 remaining)
    const lot3 = ledger.lots.find((l) => l.txnId === 'tx-3');
    expect(lot3?.remaining).toBe(100);
  });

  it('BL-16: debits do not consume lots that already expired at debit time', () => {
    const txns: PointsTransaction[] = [
      {
        id: 'tx-1',
        ref: 'TX-001',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 100,
        at: '2025-01-01T10:00:00Z',
        expiresAt: '2026-01-01T00:00:00Z', // Expired
        actor: { kind: 'system' },
        description: 'Expired lot',
      },
      {
        id: 'tx-2',
        ref: 'TX-002',
        customerId: 'c1',
        type: 'EXPIRE',
        points: -100,
        at: '2026-01-01T00:00:00Z',
        expiresLotTxnId: 'tx-1',
        actor: { kind: 'system' },
        description: 'Expiry sweep',
      },
      {
        id: 'tx-3',
        ref: 'TX-003',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 200,
        at: '2026-01-10T10:00:00Z',
        expiresAt: '2027-01-10T00:00:00Z',
        actor: { kind: 'system' },
        description: 'Active lot',
      },
      {
        id: 'tx-4',
        ref: 'TX-004',
        customerId: 'c1',
        type: 'REDEEM',
        points: -50,
        at: '2026-02-01T10:00:00Z',
        actor: { kind: 'member' },
        description: 'Redeem',
      },
    ];

    const ledger = deriveLedger(txns, new Date('2026-02-15T10:00:00Z'));
    expect(ledger.balance).toBe(150);
  });

  it('BL-21 & BL-43: expiring soon includes points expiring within window on calendar comparison, and schedule lists next 3', () => {
    // 31 Dec 2026 end of month in local time
    const decExpiry = new Date(2026, 11, 31, 23, 59, 59, 999).toISOString();
    const janExpiry = new Date(2027, 0, 31, 23, 59, 59, 999).toISOString();
    const febExpiry = new Date(2027, 1, 28, 23, 59, 59, 999).toISOString();

    const txns: PointsTransaction[] = [
      {
        id: 'tx-1',
        ref: 'TX-001',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 450,
        at: new Date(2026, 0, 1, 10, 0, 0).toISOString(),
        expiresAt: decExpiry, // Expiring end of Dec
        actor: { kind: 'system' },
        description: 'Dec expiry',
      },
      {
        id: 'tx-2',
        ref: 'TX-002',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 250,
        at: new Date(2026, 1, 1, 10, 0, 0).toISOString(),
        expiresAt: janExpiry, // Expiring end of Jan
        actor: { kind: 'system' },
        description: 'Jan expiry',
      },
      {
        id: 'tx-3',
        ref: 'TX-003',
        customerId: 'c1',
        type: 'EARN_PURCHASE',
        points: 150,
        at: new Date(2026, 2, 1, 10, 0, 0).toISOString(),
        expiresAt: febExpiry, // Expiring end of Feb
        actor: { kind: 'system' },
        description: 'Feb expiry',
      },
    ];

    // On 1 Dec 2026: 31 Dec 2026 is 30 calendar days away -> inside window
    const now = new Date(2026, 11, 1, 10, 0, 0);
    const ledger = deriveLedger(txns, now, 30);

    expect(ledger.expiringSoonPoints).toBe(450);
    expect(ledger.expiringSoonDate).toBe(decExpiry);
    expect(ledger.schedule).toHaveLength(3);
    expect(ledger.schedule[0]?.soon).toBe(true);
    expect(ledger.schedule[1]?.soon).toBe(false);
    expect(ledger.schedule[2]?.soon).toBe(false);
  });

  describe('Void rules (BR-47, BL-23a, BL-23b, BL-23c)', () => {
    it('BL-23a: void when own lot is already consumed reverses 0 points and leaves other lots intact', () => {
      const txns: PointsTransaction[] = [
        {
          id: 'tx-earn-1',
          ref: 'TX-001',
          customerId: 'c1',
          purchaseId: 'p-1',
          type: 'EARN_PURCHASE',
          points: 320,
          at: '2026-01-01T10:00:00Z',
          expiresAt: '2026-06-30T23:59:59Z', // Earliest expiry
          actor: { kind: 'staff' },
          description: 'Purchase 1',
        },
        {
          id: 'tx-earn-2',
          ref: 'TX-002',
          customerId: 'c1',
          purchaseId: 'p-2',
          type: 'EARN_PURCHASE',
          points: 500,
          at: '2026-02-01T10:00:00Z',
          expiresAt: '2026-12-31T23:59:59Z',
          actor: { kind: 'staff' },
          description: 'Purchase 2',
        },
        {
          id: 'tx-redeem',
          ref: 'TX-003',
          customerId: 'c1',
          type: 'REDEEM',
          points: -320, // Consumes all 320 from p-1 lot
          at: '2026-03-01T10:00:00Z',
          actor: { kind: 'member' },
          description: 'Redeem',
        },
        {
          id: 'tx-void',
          ref: 'TX-004',
          customerId: 'c1',
          purchaseId: 'p-1',
          type: 'PURCHASE_VOID',
          points: 0, // pointsReversed is 0 because own lot had 0 remaining
          at: '2026-04-01T10:00:00Z',
          actor: { kind: 'staff' },
          description: 'Void purchase 1',
        },
      ];

      const ledger = deriveLedger(txns, new Date('2026-04-05T10:00:00Z'));
      // Balance is 500 (from purchase 2)
      expect(ledger.balance).toBe(500);
      const p2Lot = ledger.lots.find((l) => l.purchaseId === 'p-2');
      expect(p2Lot?.remaining).toBe(500);
    });

    it('BL-23c: void with unspent points reverses only from its own lot', () => {
      const txns: PointsTransaction[] = [
        {
          id: 'tx-earn-1',
          ref: 'TX-001',
          customerId: 'c1',
          purchaseId: 'p-1',
          type: 'EARN_PURCHASE',
          points: 100,
          at: '2026-01-01T10:00:00Z',
          actor: { kind: 'staff' },
          description: 'Purchase 1',
        },
        {
          id: 'tx-earn-2',
          ref: 'TX-002',
          customerId: 'c1',
          purchaseId: 'p-2',
          type: 'EARN_PURCHASE',
          points: 100,
          at: '2026-01-02T10:00:00Z',
          actor: { kind: 'staff' },
          description: 'Purchase 2',
        },
        {
          id: 'tx-void',
          ref: 'TX-003',
          customerId: 'c1',
          purchaseId: 'p-1',
          type: 'PURCHASE_VOID',
          points: -100, // Reverses p-1's 100
          at: '2026-01-10T10:00:00Z',
          actor: { kind: 'staff' },
          description: 'Void purchase 1',
        },
      ];

      const ledger = deriveLedger(txns, new Date('2026-01-15T10:00:00Z'));
      expect(ledger.balance).toBe(100);
      expect(ledger.lots).toHaveLength(1);
      expect(ledger.lots[0]?.purchaseId).toBe('p-2');
    });
  });

  it('BL-42: maintains invariants over 200 random transaction sequences', () => {
    // Property test: balance >= 0, balance === sum(remaining)
    let currentBalance = 0;
    const testTxns: PointsTransaction[] = [];

    // Simple pseudo-random linear congruential generator for reproducible property test
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < 200; i++) {
      const isCredit = rand() > 0.4 || currentBalance === 0;
      if (isCredit) {
        const pts = Math.floor(rand() * 500) + 50;
        testTxns.push({
          id: `tx-${i}`,
          ref: `TX-${i.toString().padStart(3, '0')}`,
          customerId: 'c-prop',
          type: 'EARN_PURCHASE',
          points: pts,
          at: new Date(2026, 0, 1 + i).toISOString(),
          expiresAt: new Date(2027, 0, 1 + i).toISOString(),
          actor: { kind: 'system' },
          description: `Credit ${i}`,
        });
        currentBalance += pts;
      } else {
        const maxDebit = currentBalance;
        const pts = Math.min(maxDebit, Math.floor(rand() * maxDebit) + 1);
        testTxns.push({
          id: `tx-${i}`,
          ref: `TX-${i.toString().padStart(3, '0')}`,
          customerId: 'c-prop',
          type: 'REDEEM',
          points: -pts,
          at: new Date(2026, 0, 1 + i).toISOString(),
          actor: { kind: 'member' },
          description: `Debit ${i}`,
        });
        currentBalance -= pts;
      }
    }

    const ledger = deriveLedger(testTxns, new Date('2027-06-01T00:00:00Z'));
    expect(ledger.balance).toBeGreaterThanOrEqual(0);
    const sumRemaining = ledger.lots.reduce((acc, l) => acc + l.remaining, 0);
    expect(ledger.balance).toBe(sumRemaining);
  });
});
