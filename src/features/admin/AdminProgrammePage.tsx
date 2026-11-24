import React, { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { useStaffSession } from '@/hooks/useStaffSession';
import { updateLoyaltyConfig, updateTiers, upsertCampaign } from '@/services/config';
import { TierChip } from '@/components/brand/TierChip';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import type { LoyaltyConfig, Tier, Campaign } from '@/domain/types';
import { qualifyingSpend, resolveTier } from '@/domain/tiers';
import { CheckCircle2, Users } from 'lucide-react';

export const AdminProgrammePage: React.FC = () => {
  const appData = useAppData();
  const { staff } = useStaffSession();

  const [activeTab, setActiveTab] = useState<'earning' | 'tiers' | 'expiry' | 'campaigns' | 'occasions'>('earning');

  // Earning form
  const [spendUnitPaise, setSpendUnitPaise] = useState(appData.config.earning.spendUnitPaise);
  const [pointsPerUnit, setPointsPerUnit] = useState(appData.config.earning.pointsPerUnit);
  const [minPurchasePaise, setMinPurchasePaise] = useState(appData.config.earning.minPurchasePaise);
  const [rounding, setRounding] = useState(appData.config.earning.rounding);
  const [pointValuePaise, setPointValuePaise] = useState(appData.config.earning.pointValuePaise);

  // Tiers form with live impact preview
  const [editableTiers, setEditableTiers] = useState<Tier[]>([...appData.tiers]);

  // Expiry form
  const [expiryMode, setExpiryMode] = useState(appData.config.expiry.mode);
  const [expiryMonths, setExpiryMonths] = useState(appData.config.expiry.months);
  const [expiringSoonDays, setExpiringSoonDays] = useState(appData.config.expiry.expiringSoonDays);

  // Couple rules
  const [coupleBonus, setCoupleBonus] = useState(appData.config.couple.bonusPoints);
  const [coupleCooldown, setCoupleCooldown] = useState(appData.config.couple.cooldownDays);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live Tier Impact Preview calculation
  const now = new Date();
  const currentTierCounts = new Map<string, number>();
  const projectedTierCounts = new Map<string, number>();

  for (const c of appData.customers) {
    const spend = qualifyingSpend(c.id, appData.purchases, now);
    const curr = resolveTier(spend, appData.tiers);
    const proj = resolveTier(spend, editableTiers);
    currentTierCounts.set(curr.id, (currentTierCounts.get(curr.id) ?? 0) + 1);
    projectedTierCounts.set(proj.id, (projectedTierCounts.get(proj.id) ?? 0) + 1);
  }

  const handleSaveEarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setError(null);
    setSavedSuccess(false);

    const updatedConfig: LoyaltyConfig = {
      ...appData.config,
      earning: {
        spendUnitPaise,
        pointsPerUnit,
        minPurchasePaise,
        rounding,
        pointValuePaise,
      },
    };

    const res = updateLoyaltyConfig({ config: updatedConfig, staffId: staff.id });
    if (!res.ok) {
      setError(res.error.message);
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveTiers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setError(null);
    setSavedSuccess(false);

    const res = updateTiers({ tiers: editableTiers, staffId: staff.id });
    if (!res.ok) {
      setError(res.error.message);
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveExpiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setError(null);
    setSavedSuccess(false);

    const updatedConfig: LoyaltyConfig = {
      ...appData.config,
      expiry: {
        mode: expiryMode,
        months: expiryMonths,
        expiringSoonDays,
      },
    };

    const res = updateLoyaltyConfig({ config: updatedConfig, staffId: staff.id });
    if (!res.ok) {
      setError(res.error.message);
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveOccasions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    setError(null);
    setSavedSuccess(false);

    const updatedConfig: LoyaltyConfig = {
      ...appData.config,
      couple: {
        ...appData.config.couple,
        bonusPoints: coupleBonus,
        cooldownDays: coupleCooldown,
      },
    };

    const res = updateLoyaltyConfig({ config: updatedConfig, staffId: staff.id });
    if (!res.ok) {
      setError(res.error.message);
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleCampaign = (campaign: Campaign) => {
    if (!staff) return;
    upsertCampaign({
      campaign: { ...campaign, active: !campaign.active },
      staffId: staff.id,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
      {/* Header */}
      <div className="border-b border-sand-subtle pb-4">
        <span className="text-xs uppercase font-bold tracking-widest text-tide">
          Programme Architecture
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold mt-1">
          Programme Rules &amp; Settings
        </h1>
        <p className="text-xs text-charcoal-muted mt-0.5">
          Configure point accrual ratios, tier qualification bands, expiry, promotions, and milestone rules.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration updated successfully and saved to audit log.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-sand-subtle text-xs font-semibold uppercase tracking-wider overflow-x-auto">
        {(['earning', 'tiers', 'expiry', 'campaigns', 'occasions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 border-b-2 transition-colors shrink-0 capitalize ${
              activeTab === tab
                ? 'border-tide text-tide font-bold bg-sand-card'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            {tab} Rules
          </button>
        ))}
      </div>

      {/* Section 1: Earning Rules */}
      {activeTab === 'earning' && (
        <form onSubmit={handleSaveEarning} className="bg-sand-card p-6 border border-sand-subtle space-y-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal">Point Accrual Formulas</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Spend Unit (₹)" helperText="Amount in rupees that yields base points">
              <input
                type="number"
                min="1"
                value={spendUnitPaise / 100}
                onChange={(e) => setSpendUnitPaise((parseInt(e.target.value) || 1) * 100)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>

            <Field label="Points Earned Per Unit" helperText="Base Trove Points granted per spend unit">
              <input
                type="number"
                min="1"
                value={pointsPerUnit}
                onChange={(e) => setPointsPerUnit(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>

            <Field label="Minimum Spend for Points (₹)" helperText="Purchases below this amount do not accrue points">
              <input
                type="number"
                min="0"
                value={minPurchasePaise / 100}
                onChange={(e) => setMinPurchasePaise((parseInt(e.target.value) || 0) * 100)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>

            <Field label="Rounding Mode" helperText="How fractional spend units are rounded">
              <select
                value={rounding}
                onChange={(e) => setRounding(e.target.value as 'down' | 'nearest')}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              >
                <option value="down">Floor (Conservative / Down)</option>
                <option value="nearest">Round to Nearest Unit</option>
              </select>
            </Field>

            <Field label="Point Valuation (₹ Per Point)" helperText="Commercial value of 1 Trove Point">
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={pointValuePaise / 100}
                onChange={(e) => setPointValuePaise(Math.round(parseFloat(e.target.value || '0.5') * 100))}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>
          </div>

          <Button type="submit">Save Earning Rules</Button>
        </form>
      )}

      {/* Section 2: Membership Tiers & Live Impact Calculator */}
      {activeTab === 'tiers' && (
        <form onSubmit={handleSaveTiers} className="space-y-6">
          <div className="bg-sand-card p-6 border border-sand-subtle space-y-4">
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Tier Thresholds &amp; Multipliers
            </h2>

            <div className="space-y-4">
              {editableTiers.map((tier, idx) => (
                <div key={tier.id} className="p-4 bg-sand border border-sand-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-charcoal">{tier.name}</span>
                      <TierChip tier={tier} size="sm" />
                    </div>
                    <span className="text-xs text-charcoal-muted">Rank {tier.rank}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <Field label="Spend Threshold (₹)">
                      <input
                        type="number"
                        min="0"
                        value={tier.thresholdPaise / 100}
                        disabled={tier.rank === 0}
                        onChange={(e) => {
                          const val = (parseInt(e.target.value) || 0) * 100;
                          const copy = [...editableTiers];
                          copy[idx] = { ...copy[idx]!, thresholdPaise: val };
                          setEditableTiers(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-sand-card border border-sand-subtle text-xs"
                      />
                    </Field>

                    <Field label="Earn Multiplier Bonus (%)">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={tier.earnBonusPct}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const copy = [...editableTiers];
                          copy[idx] = { ...copy[idx]!, earnBonusPct: val };
                          setEditableTiers(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-sand-card border border-sand-subtle text-xs"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit">Save Tier Changes</Button>
          </div>

          {/* Live Impact Calculator Preview Box */}
          <div className="bg-sand-card p-6 border border-sand-subtle space-y-4">
            <div className="flex items-center gap-2 border-b border-sand-subtle pb-3">
              <Users className="w-5 h-5 text-tide" />
              <h3 className="font-serif text-lg font-semibold text-charcoal">
                Live Member Impact Projection
              </h3>
            </div>
            <p className="text-xs text-charcoal-muted">
              Preview how many existing customers would shift tiers based on the proposed spend thresholds:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {editableTiers.map((tier) => {
                const currentCount = currentTierCounts.get(tier.id) ?? 0;
                const projectedCount = projectedTierCounts.get(tier.id) ?? 0;
                const delta = projectedCount - currentCount;

                return (
                  <div key={tier.id} className="p-3 bg-sand border border-sand-subtle text-center space-y-1">
                    <span className="font-semibold text-xs text-charcoal block">{tier.name}</span>
                    <span className="font-serif text-xl font-bold text-tide block">
                      {projectedCount} members
                    </span>
                    <span className="text-[10px] text-charcoal-muted">
                      {delta === 0 ? 'No change' : delta > 0 ? `+${delta} upgrade` : `${delta} shift`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      )}

      {/* Section 3: Point Expiry Rules */}
      {activeTab === 'expiry' && (
        <form onSubmit={handleSaveExpiry} className="bg-sand-card p-6 border border-sand-subtle space-y-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal">Point Expiration Policies</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Expiry Policy Mode">
              <select
                value={expiryMode}
                onChange={(e) => setExpiryMode(e.target.value as 'none' | 'fixed_months')}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              >
                <option value="fixed_months">Fixed Months (Standard Retail)</option>
                <option value="none">No Expiry (Points Never Expire)</option>
              </select>
            </Field>

            <Field label="Points Validity (Months)" helperText="Points expire at end of month N months after earn">
              <input
                type="number"
                min="1"
                max="60"
                value={expiryMonths}
                disabled={expiryMode === 'none'}
                onChange={(e) => setExpiryMonths(parseInt(e.target.value) || 12)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>

            <Field label="Expiring Soon Warning Window (Days)" helperText="Days before expiry when member sees amber urgency alert">
              <input
                type="number"
                min="1"
                max="90"
                value={expiringSoonDays}
                onChange={(e) => setExpiringSoonDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>
          </div>

          <Button type="submit">Save Expiry Settings</Button>
        </form>
      )}

      {/* Section 4: Campaigns & Multipliers */}
      {activeTab === 'campaigns' && (
        <div className="bg-sand-card p-6 border border-sand-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-subtle pb-3">
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Promotions &amp; Bonus Multipliers
            </h2>
          </div>

          <div className="divide-y divide-sand-subtle">
            {appData.campaigns.map((camp) => (
              <div key={camp.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-charcoal">{camp.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                        camp.active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-sand text-charcoal-muted border-sand-subtle'
                      }`}
                    >
                      {camp.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-charcoal-muted">{camp.customerDescription}</p>
                  <p className="text-[10px] text-charcoal-muted">
                    {camp.startsAt.slice(0, 10)} to {camp.endsAt.slice(0, 10)} · Type: {camp.type}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={camp.active ? 'outline' : 'secondary'}
                  onClick={() => handleToggleCampaign(camp)}
                >
                  {camp.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Occasions & Couple Rules */}
      {activeTab === 'occasions' && (
        <form onSubmit={handleSaveOccasions} className="bg-sand-card p-6 border border-sand-subtle space-y-6">
          <h2 className="font-serif text-lg font-semibold text-charcoal">Couple &amp; Milestone Rules</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="In-Store Couple Visit Bonus Points" helperText="Points granted when couple visits store together">
              <input
                type="number"
                min="0"
                value={coupleBonus}
                onChange={(e) => setCoupleBonus(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>

            <Field label="Couple Visit Cooldown (Days)" helperText="Minimum days before couple visit bonus can be awarded again">
              <input
                type="number"
                min="1"
                max="365"
                value={coupleCooldown}
                onChange={(e) => setCoupleCooldown(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              />
            </Field>
          </div>

          <Button type="submit">Save Milestone Settings</Button>
        </form>
      )}
    </div>
  );
};
