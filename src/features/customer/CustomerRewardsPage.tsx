import React, { useState } from 'react';
import { useMemberSession } from '@/hooks/useMemberSession';
import { useAppData } from '@/hooks/useAppData';
import { selectAvailableRewards, type CatalogRewardItem } from '@/data/selectors/rewards';
import { RewardImage } from '@/components/brand/RewardImage';
import { PointsValue } from '@/components/brand/PointsValue';
import { TierChip } from '@/components/brand/TierChip';
import { Button } from '@/components/ui/button';
import { WaveLine } from '@/components/brand/WaveLine';
import { redeemReward } from '@/services/redemptions';
import type { IssuedVoucher } from '@/domain/types';
import { Gift, Copy, Check, X } from 'lucide-react';

export const CustomerRewardsPage: React.FC = () => {
  const { details } = useMemberSession();
  const appData = useAppData();
  const [filterTab, setFilterTab] = useState<'all' | 'affordable' | 'vouchers'>('all');

  const [selectedRewardItem, setSelectedRewardItem] = useState<CatalogRewardItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [issuedVoucher, setIssuedVoucher] = useState<IssuedVoucher | null>(null);
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const rewards = selectAvailableRewards(appData, details?.customer.id);

  const filteredRewards = rewards.filter((r) => {
    if (filterTab === 'affordable') return r.canAfford && r.isTierEligible && !r.isOutOfStock;
    return true;
  });

  const handleRedeemClick = (item: CatalogRewardItem) => {
    setSelectedRewardItem(item);
    setRedeemError(null);
    setConfirmOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedRewardItem || !details) return;
    setRedeeming(true);
    setRedeemError(null);

    setTimeout(() => {
      const res = redeemReward({
        customerId: details.customer.id,
        rewardId: selectedRewardItem.reward.id,
        channel: 'portal',
        requestId: crypto.randomUUID(),
      });
      setRedeeming(false);

      if (!res.ok) {
        setRedeemError(res.error.message);
        return;
      }

      setConfirmOpen(false);
      setIssuedVoucher(res.value);
    }, 200);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-tide">
          Curated Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
          Rewards Catalogue
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
          Exchange your Trove Points for instant store vouchers, artisanal gifts, and elevated resort experiences.
        </p>
        <div className="flex justify-center pt-2">
          <WaveLine className="w-20 text-terracotta" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-sand border border-sand-subtle p-1 text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filterTab === 'all'
                ? 'bg-sand-card text-tide font-bold shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            All Rewards ({rewards.length})
          </button>
          <button
            onClick={() => setFilterTab('affordable')}
            className={`px-4 py-2 font-medium transition-colors ${
              filterTab === 'affordable'
                ? 'bg-sand-card text-tide font-bold shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Affordable Now ({rewards.filter((r) => r.canAfford && r.isTierEligible).length})
          </button>
          <button
            onClick={() => setFilterTab('vouchers')}
            className={`px-4 py-2 font-medium transition-colors ${
              filterTab === 'vouchers'
                ? 'bg-sand-card text-tide font-bold shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            My Vouchers ({details?.vouchers.length ?? 0})
          </button>
        </div>
      </div>

      {/* Content based on Tab */}
      {filterTab === 'vouchers' ? (
        /* My Vouchers View */
        <div className="max-w-3xl mx-auto space-y-4">
          {details && details.vouchers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.vouchers.map((v) => {
                const isUsed = v.status === 'used';
                const isCancelled = v.status === 'cancelled';
                const isExpired = v.status === 'issued' && new Date(v.expiresAt) < new Date();
                const isActive = v.status === 'issued' && !isExpired;

                return (
                  <div
                    key={v.id}
                    className={`p-5 bg-sand-card border flex flex-col justify-between space-y-4 shadow-2xs ${
                      isActive ? 'border-sand-subtle' : 'opacity-70 border-sand-subtle/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-tide">
                          {v.source === 'occasion' ? 'Milestone Treat' : 'Catalogue Reward'}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isUsed
                              ? 'bg-sand text-charcoal-muted border-sand-subtle'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isActive ? 'Active' : isUsed ? 'Redeemed' : isCancelled ? 'Cancelled' : 'Expired'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-semibold text-charcoal">{v.title}</h3>
                      <p className="text-xs text-charcoal-muted mt-1">{v.valueLabel}</p>
                    </div>

                    <div className="p-3 bg-sand border border-sand-subtle flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block">
                          Voucher Code
                        </span>
                        <span className="font-mono text-sm font-bold text-charcoal tracking-wide">
                          {v.code}
                        </span>
                      </div>
                      {isActive && (
                        <button
                          onClick={() => handleCopyCode(v.code)}
                          className="p-1.5 bg-sand-card border border-sand-subtle hover:border-sand-muted text-charcoal text-xs flex items-center gap-1"
                          title="Copy code"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] text-charcoal-muted flex justify-between">
                      <span>Issued: {new Date(v.issuedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      <span>Expires: {new Date(v.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-sand-card border border-sand-subtle p-6">
              <Gift className="w-8 h-8 text-charcoal-muted mx-auto mb-2" />
              <p className="font-serif text-lg text-charcoal font-semibold">No Vouchers Yet</p>
              <p className="text-xs text-charcoal-muted mt-1 mb-4">
                Redeem your points below for vouchers to use at checkout.
              </p>
              <Button onClick={() => setFilterTab('all')}>Browse Rewards</Button>
            </div>
          )}
        </div>
      ) : (
        /* Rewards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {filteredRewards.map((item) => {
            const reward = item.reward;
            return (
              <div
                key={reward.id}
                className="bg-sand-card border border-sand-subtle shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Reward Image */}
                  <div className="relative aspect-4/3 bg-sand overflow-hidden border-b border-sand-subtle">
                    <RewardImage
                      src={reward.image.src}
                      alt={reward.image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-sand-card/90 backdrop-blur-xs px-2.5 py-1 border border-sand-subtle shadow-xs">
                      <PointsValue points={reward.pointsCost} size="sm" />
                    </div>
                  </div>

                  {/* Reward Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {reward.eligibleTierIds.map((tierId) => {
                        const t = appData.tiers.find((tier) => tier.id === tierId);
                        return t ? <TierChip key={tierId} tier={t} size="sm" /> : null;
                      })}
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-charcoal leading-snug">
                      {reward.name}
                    </h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
                      {reward.shortDescription}
                    </p>
                    <p className="text-xs font-semibold text-tide">{reward.value.label}</p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  {item.isOutOfStock ? (
                    <Button disabled fullWidth variant="secondary">
                      Out of Stock
                    </Button>
                  ) : !item.isTierEligible ? (
                    <Button disabled fullWidth variant="outline">
                      Tier Locked
                    </Button>
                  ) : !item.canAfford ? (
                    <Button
                      fullWidth
                      variant="outline"
                      onClick={() => handleRedeemClick(item)}
                    >
                      Need {item.pointsGap} more pts
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() => handleRedeemClick(item)}
                    >
                      Redeem Reward
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOpen && selectedRewardItem && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-tide block">
                  Confirm Redemption
                </span>
                <h3 className="font-serif text-xl font-semibold text-charcoal mt-1">
                  {selectedRewardItem.reward.name}
                </h3>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                className="p-1 text-charcoal-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {redeemError && (
              <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
                {redeemError}
              </div>
            )}

            <div className="p-4 bg-sand border border-sand-subtle space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Reward Value:</span>
                <span className="font-semibold text-charcoal">{selectedRewardItem.reward.value.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Points Cost:</span>
                <span className="font-serif font-bold text-charcoal">
                  {selectedRewardItem.reward.pointsCost} pts
                </span>
              </div>
              <div className="flex justify-between border-t border-sand-subtle pt-2">
                <span className="text-charcoal-muted">Your Balance After:</span>
                <span className="font-serif font-semibold text-tide">
                  {(details?.balance ?? 0) - selectedRewardItem.reward.pointsCost} pts
                </span>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-muted leading-relaxed">
              Once redeemed, your voucher code is generated immediately and valid for{' '}
              {selectedRewardItem.reward.voucherValidityDays} days.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleConfirmRedeem}
                fullWidth
                disabled={redeeming}
              >
                {redeeming ? 'Redeeming...' : 'Confirm & Generate Voucher'}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Issued Sheet */}
      {issuedVoucher && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-8 border border-sand-subtle shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
              <Gift className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-tide block">
                Voucher Ready
              </span>
              <h2 className="font-serif text-2xl text-charcoal">{issuedVoucher.title}</h2>
              <p className="text-xs text-charcoal-muted">{issuedVoucher.valueLabel}</p>
            </div>

            {/* Voucher Code Box */}
            <div className="p-4 bg-sand border-2 border-dashed border-sand-muted space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-charcoal-muted block">
                Show this code at store counter
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl font-bold text-charcoal tracking-wider">
                  {issuedVoucher.code}
                </span>
                <button
                  onClick={() => handleCopyCode(issuedVoucher.code)}
                  className="p-1.5 bg-sand-card border border-sand-subtle hover:border-sand-muted text-charcoal text-xs flex items-center gap-1"
                  title="Copy code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-charcoal-muted">
              Valid until{' '}
              <strong>
                {new Date(issuedVoucher.expiresAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </strong>
            </p>

            <Button
              onClick={() => {
                setIssuedVoucher(null);
                setFilterTab('vouchers');
              }}
              fullWidth
            >
              View in My Vouchers
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
