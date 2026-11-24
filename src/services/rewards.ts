import { z } from 'zod';
import type { Reward } from '@/domain/types';
import { RewardSchema, RewardStatusSchema } from '@/data/schema';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';

export const UpsertRewardInputSchema = z.object({
  reward: RewardSchema,
  staffId: z.string(),
});
export type UpsertRewardInput = z.infer<typeof UpsertRewardInputSchema>;

export function upsertReward(input: UpsertRewardInput): Result<Reward> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'rewards.manage',
    schema: UpsertRewardInputSchema,
    input,
    handler: (validInput, data) => {
      const existingIdx = data.rewards.findIndex((r) => r.id === validInput.reward.id);
      const updatedRewards = [...data.rewards];
      const nowIso = new Date().toISOString();

      const rewardWithTimestamp: Reward = {
        ...validInput.reward,
        updatedAt: nowIso,
      };

      if (existingIdx >= 0) {
        updatedRewards[existingIdx] = rewardWithTimestamp;
      } else {
        updatedRewards.push(rewardWithTimestamp);
      }

      return ok({
        nextData: {
          ...data,
          rewards: updatedRewards,
        },
        value: rewardWithTimestamp,
      });
    },
    audit: (_validInput, reward) => ({
      action: 'REWARD_UPSERT',
      entity: { type: 'reward', id: reward.id },
      summary: `Upserted reward ${reward.name} (${reward.pointsCost} pts)`,
      after: reward as unknown as Record<string, unknown>,
    }),
  });
}

export const SetRewardStatusInputSchema = z.object({
  rewardId: z.string(),
  status: RewardStatusSchema,
  staffId: z.string(),
});
export type SetRewardStatusInput = z.infer<typeof SetRewardStatusInputSchema>;

export function setRewardStatus(input: SetRewardStatusInput): Result<Reward> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'rewards.manage',
    schema: SetRewardStatusInputSchema,
    input,
    handler: (validInput, data) => {
      const idx = data.rewards.findIndex((r) => r.id === validInput.rewardId);
      if (idx === -1) {
        return err(createAppError('NOT_FOUND', 'Reward not found'));
      }

      const reward = data.rewards[idx]!;
      const updatedReward: Reward = {
        ...reward,
        status: validInput.status,
        updatedAt: new Date().toISOString(),
      };

      const updatedRewards = [...data.rewards];
      updatedRewards[idx] = updatedReward;

      return ok({
        nextData: {
          ...data,
          rewards: updatedRewards,
        },
        value: updatedReward,
      });
    },
    audit: (validInput, reward) => ({
      action: 'REWARD_STATUS_CHANGE',
      entity: { type: 'reward', id: reward.id },
      summary: `Changed reward ${reward.name} status to ${validInput.status}`,
      after: reward as unknown as Record<string, unknown>,
    }),
  });
}
