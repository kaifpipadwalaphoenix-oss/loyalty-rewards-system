import React from 'react';
import { TierBadge, type TierBadgeProps, type TierAccent, resolveTierAccent } from './TierBadge';

export type { TierAccent, TierBadgeProps };
export { resolveTierAccent };

export interface TierChipProps extends TierBadgeProps {}

/**
 * TierChip - Backwards-compatible wrapper delegating to TierBadge.
 * Enforces single tier name rendering with tier light gradient dot.
 */
export const TierChip: React.FC<TierChipProps> = (props) => {
  return <TierBadge {...props} />;
};
