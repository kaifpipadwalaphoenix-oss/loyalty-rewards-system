import { z } from 'zod';
import type { Campaign, LoyaltyConfig, Tier } from '@/domain/types';
import { LoyaltyConfigSchema, CampaignSchema, TierSchema } from '@/data/schema';
import type { Result } from '@/lib/result';
import { ok, err } from '@/lib/result';
import { createAppError } from '@/lib/errors';
import { runCommand } from './command';

export const UpdateLoyaltyConfigInputSchema = z.object({
  config: LoyaltyConfigSchema,
  staffId: z.string(),
});
export type UpdateLoyaltyConfigInput = z.infer<typeof UpdateLoyaltyConfigInputSchema>;

export function updateLoyaltyConfig(input: UpdateLoyaltyConfigInput): Result<LoyaltyConfig> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'programme.manage',
    schema: UpdateLoyaltyConfigInputSchema,
    input,
    handler: (validInput, data) => {
      const nowIso = new Date().toISOString();
      const updatedConfig: LoyaltyConfig = {
        ...validInput.config,
        updatedAt: nowIso,
        updatedBy: validInput.staffId,
      };

      return ok({
        nextData: {
          ...data,
          config: updatedConfig,
        },
        value: updatedConfig,
      });
    },
    audit: (validInput, updated, prev) => ({
      action: 'CONFIG_UPDATE',
      entity: { type: 'config', id: 'loyalty_config' },
      summary: `Loyalty programme settings updated by ${validInput.staffId}`,
      before: prev.config as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    }),
  });
}

export const UpsertCampaignInputSchema = z.object({
  campaign: CampaignSchema,
  staffId: z.string(),
});
export type UpsertCampaignInput = z.infer<typeof UpsertCampaignInputSchema>;

export function upsertCampaign(input: UpsertCampaignInput): Result<Campaign> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'programme.manage',
    schema: UpsertCampaignInputSchema,
    input,
    handler: (validInput, data) => {
      const existingIdx = data.campaigns.findIndex((c) => c.id === validInput.campaign.id);
      const updatedCampaigns = [...data.campaigns];

      if (existingIdx >= 0) {
        updatedCampaigns[existingIdx] = validInput.campaign;
      } else {
        updatedCampaigns.push(validInput.campaign);
      }

      return ok({
        nextData: {
          ...data,
          campaigns: updatedCampaigns,
        },
        value: validInput.campaign,
      });
    },
    audit: (_validInput, campaign) => ({
      action: 'CAMPAIGN_UPSERT',
      entity: { type: 'campaign', id: campaign.id },
      summary: `Upserted campaign ${campaign.name} (${campaign.type})`,
      after: campaign as unknown as Record<string, unknown>,
    }),
  });
}

export const UpdateTiersInputSchema = z.object({
  tiers: z.array(TierSchema).min(1),
  staffId: z.string(),
});
export type UpdateTiersInput = z.infer<typeof UpdateTiersInputSchema>;

export function updateTiers(input: UpdateTiersInput): Result<Tier[]> {
  return runCommand({
    actor: { kind: 'staff', id: input.staffId },
    permission: 'programme.manage',
    schema: UpdateTiersInputSchema,
    input,
    handler: (validInput, data) => {
      // Validate that thresholds are strictly ascending
      for (let i = 1; i < validInput.tiers.length; i++) {
        const prev = validInput.tiers[i - 1]!;
        const curr = validInput.tiers[i]!;
        if (curr.thresholdPaise <= prev.thresholdPaise) {
          return err(
            createAppError(
              'VALIDATION',
              `Tier "${curr.name}" threshold must be strictly higher than "${prev.name}"`
            )
          );
        }
      }

      return ok({
        nextData: {
          ...data,
          tiers: validInput.tiers,
        },
        value: validInput.tiers,
      });
    },
    audit: (_validInput, tiers, prev) => ({
      action: 'TIERS_UPDATE',
      entity: { type: 'tiers', id: 'membership_tiers' },
      summary: `Updated membership tier rules (${tiers.length} tiers)`,
      before: { tiers: prev.tiers },
      after: { tiers },
    }),
  });
}
