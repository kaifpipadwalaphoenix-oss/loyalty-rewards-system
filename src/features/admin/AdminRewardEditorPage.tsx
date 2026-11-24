import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppData } from '@/hooks/useAppData';
import { useStaffSession } from '@/hooks/useStaffSession';
import { upsertReward } from '@/services/rewards';
import { RewardImage } from '@/components/brand/RewardImage';
import { PointsValue } from '@/components/brand/PointsValue';
import { TierChip } from '@/components/brand/TierChip';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import type { Reward, RewardType, RewardStatus } from '@/domain/types';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { INTERIM_IMAGES } from '@/assets/brand/images';

export const AdminRewardEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appData = useAppData();
  const { staff } = useStaffSession();

  const isEditing = id && id !== 'new';
  const existingReward = isEditing ? appData.rewards.find((r) => r.id === id) : null;

  const [name, setName] = useState(existingReward?.name ?? '');
  const [type, setType] = useState<RewardType>(existingReward?.type ?? 'fixed_discount');
  const [shortDescription, setShortDescription] = useState(existingReward?.shortDescription ?? '');
  const [description, setDescription] = useState(existingReward?.description ?? '');
  const [howToUse, setHowToUse] = useState(existingReward?.howToUse ?? 'Present voucher code at counter checkout.');
  const [terms, setTerms] = useState(existingReward?.terms ?? 'Valid for 30 days from issuance.');
  const [valueLabel, setValueLabel] = useState(existingReward?.value.label ?? '₹250 off');
  const [pointsCost, setPointsCost] = useState(existingReward?.pointsCost ?? 500);
  const [eligibleTierIds, setEligibleTierIds] = useState<string[]>(
    existingReward?.eligibleTierIds ?? appData.tiers.map((t) => t.id)
  );
  const [stockLimit, setStockLimit] = useState<number | undefined>(existingReward?.stockLimit);
  const [voucherValidityDays, setVoucherValidityDays] = useState(existingReward?.voucherValidityDays ?? 30);
  const [imageSrc, setImageSrc] = useState(
    existingReward?.image.src ?? INTERIM_IMAGES[0]?.src ?? '/images/interim/reward-discount-250.svg'
  );
  const [imageAlt, setImageAlt] = useState(existingReward?.image.alt ?? 'Trove reward item');
  const [status, setStatus] = useState<RewardStatus>(existingReward?.status ?? 'active');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTierToggle = (tierId: string) => {
    if (eligibleTierIds.includes(tierId)) {
      setEligibleTierIds(eligibleTierIds.filter((t) => t !== tierId));
    } else {
      setEligibleTierIds([...eligibleTierIds, tierId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;
    if (!name.trim()) {
      setError('Reward name is required');
      return;
    }
    if (pointsCost <= 0) {
      setError('Points cost must be greater than 0');
      return;
    }
    if (eligibleTierIds.length === 0) {
      setError('Select at least one eligible tier');
      return;
    }

    setSaving(true);
    setError(null);

    const nowIso = new Date().toISOString();
    const rewardId = existingReward?.id ?? `rew-${Date.now()}`;

    const rewardToSave: Reward = {
      id: rewardId,
      name: name.trim(),
      type,
      shortDescription: shortDescription.trim() || name.trim(),
      description: description.trim() || shortDescription.trim() || name.trim(),
      howToUse: howToUse.trim(),
      terms: terms.trim(),
      value: {
        label: valueLabel.trim(),
      },
      image: {
        src: imageSrc,
        alt: imageAlt.trim() || name.trim(),
      },
      pointsCost,
      eligibleTierIds,
      stockLimit: stockLimit ? stockLimit : undefined,
      voucherValidityDays,
      status,
      createdAt: existingReward?.createdAt ?? nowIso,
      updatedAt: nowIso,
    };

    setTimeout(() => {
      const res = upsertReward({
        reward: rewardToSave,
        staffId: staff.id,
      });
      setSaving(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      navigate('/admin/rewards');
    }, 150);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back link */}
      <div>
        <Link
          to="/admin/rewards"
          className="text-xs text-charcoal-muted hover:text-charcoal flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Rewards Catalogue</span>
        </Link>
      </div>

      <div className="border-b border-sand-subtle pb-4">
        <span className="text-xs uppercase font-bold tracking-widest text-tide">
          Reward Editor
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold mt-1">
          {isEditing ? `Edit "${name}"` : 'Create New Reward'}
        </h1>
      </div>

      {error && (
        <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6 bg-sand-card p-6 border border-sand-subtle shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Reward Name" required>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ₹500 Resort Boutique Voucher"
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
                required
              />
            </Field>

            <Field label="Reward Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RewardType)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
              >
                <option value="fixed_discount">Fixed Rupee Discount</option>
                <option value="percent_discount">Percentage Discount</option>
                <option value="voucher">Store Voucher</option>
                <option value="gift">Physical Atelier Gift</option>
                <option value="experience">Atelier Experience</option>
                <option value="promotional">Promotional Event</option>
              </select>
            </Field>

            <Field label="Points Cost (Trove Points)" required>
              <input
                type="number"
                min="1"
                value={pointsCost}
                onChange={(e) => setPointsCost(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal font-serif font-bold"
                required
              />
            </Field>

            <Field label="Value Label" helperText="Shown on voucher card (e.g. '₹500 off')" required>
              <input
                type="text"
                value={valueLabel}
                onChange={(e) => setValueLabel(e.target.value)}
                placeholder="e.g. ₹500 off"
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
                required
              />
            </Field>
          </div>

          <Field label="Short Tagline (Catalog snippet)">
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Redeem towards any linen dress or swimsuit in store."
              className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
            />
          </Field>

          <Field label="Full Description">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of this reward..."
              className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="How to Use">
              <input
                type="text"
                value={howToUse}
                onChange={(e) => setHowToUse(e.target.value)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal"
              />
            </Field>

            <Field label="Terms & Conditions">
              <input
                type="text"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal"
              />
            </Field>
          </div>

          {/* Tier Eligibility Checkboxes */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-charcoal block">Eligible Membership Tiers</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {appData.tiers.map((t) => {
                const checked = eligibleTierIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTierToggle(t.id)}
                    className={`p-2.5 text-xs font-medium border text-center transition-colors flex items-center justify-between ${
                      checked
                        ? 'border-tide bg-tide/5 text-tide font-bold'
                        : 'border-sand-subtle bg-sand text-charcoal-muted'
                    }`}
                  >
                    <span>{t.name}</span>
                    <TierChip tier={t} size="sm" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock and Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Stock Limit (Optional)" helperText="Leave empty for unlimited stock">
              <input
                type="number"
                min="1"
                value={stockLimit ?? ''}
                onChange={(e) => setStockLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal"
              />
            </Field>

            <Field label="Voucher Validity (Days)">
              <input
                type="number"
                min="1"
                max="365"
                value={voucherValidityDays}
                onChange={(e) => setVoucherValidityDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal"
              />
            </Field>

            <Field label="Catalog Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RewardStatus)}
                className="w-full px-3 py-2 bg-sand border border-sand-subtle text-xs text-charcoal"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          {/* Interim Image Selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-charcoal block">Reward Imagery</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {INTERIM_IMAGES.map((img) => (
                <button
                  key={img.key}
                  type="button"
                  onClick={() => {
                    setImageSrc(img.src);
                    setImageAlt(img.alt);
                  }}
                  className={`aspect-square border p-1 bg-sand transition-all ${
                    imageSrc === img.src ? 'border-tide ring-2 ring-tide/30' : 'border-sand-subtle hover:border-sand-muted'
                  }`}
                >
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-sand-subtle">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? 'Saving...' : 'Save Reward'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => navigate('/admin/rewards')}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Right 1 Col: Live Customer Card Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-charcoal-muted">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>Customer View Preview</span>
          </div>

          <div className="bg-sand-card border border-sand-subtle shadow-md overflow-hidden max-w-sm mx-auto">
            <div className="relative aspect-4/3 bg-sand overflow-hidden border-b border-sand-subtle">
              <RewardImage src={imageSrc} alt={imageAlt} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-sand-card/90 backdrop-blur-xs px-2.5 py-1 border border-sand-subtle shadow-xs">
                <PointsValue points={pointsCost} size="sm" />
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-1 flex-wrap">
                {eligibleTierIds.map((tierId) => {
                  const t = appData.tiers.find((tier) => tier.id === tierId);
                  return t ? <TierChip key={tierId} tier={t} size="sm" /> : null;
                })}
              </div>

              <h3 className="font-serif text-lg font-semibold text-charcoal leading-snug">
                {name || 'Reward Title Preview'}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
                {shortDescription || 'Short description preview will appear here in the catalogue.'}
              </p>
              <p className="text-xs font-semibold text-tide">{valueLabel}</p>

              <Button fullWidth size="sm" disabled>
                Redeem Reward
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
