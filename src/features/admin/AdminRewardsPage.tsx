import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '@/hooks/useAppData';
import { useStaffSession } from '@/hooks/useStaffSession';
import { setRewardStatus } from '@/services/rewards';
import { RewardImage } from '@/components/brand/RewardImage';
import { TierChip } from '@/components/brand/TierChip';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/data/DataTable';
import { Plus, Power } from 'lucide-react';
import type { Reward } from '@/domain/types';

export const AdminRewardsPage: React.FC = () => {
  const appData = useAppData();
  const navigate = useNavigate();
  const { staff } = useStaffSession();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');

  const rewards = appData.rewards.filter((r) => {
    if (filterStatus === 'all') return r.status !== 'archived';
    return r.status === filterStatus;
  });

  const handleToggleStatus = (reward: Reward) => {
    if (!staff) return;
    const nextStatus = reward.status === 'active' ? 'inactive' : 'active';
    setRewardStatus({ rewardId: reward.id, status: nextStatus, staffId: staff.id });
  };

  const columns: Column<Reward>[] = [
    {
      id: 'reward',
      header: 'Reward',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 bg-sand border border-sand-subtle overflow-hidden shrink-0">
            <RewardImage
              src={r.image.src}
              alt={r.image.alt}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-serif font-semibold text-charcoal block">{r.name}</span>
            <span className="text-[10px] text-charcoal-muted capitalize">{r.type.replace('_', ' ')}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'cost',
      header: 'Cost',
      cell: (r) => <span className="font-serif font-bold text-tide">{r.pointsCost} pts</span>,
    },
    {
      id: 'value',
      header: 'Value',
      cell: (r) => <span className="font-semibold text-charcoal">{r.value.label}</span>,
    },
    {
      id: 'tiers',
      header: 'Eligible Tiers',
      cell: (r) => (
        <div className="flex gap-1 flex-wrap">
          {r.eligibleTierIds.map((tierId) => {
            const t = appData.tiers.find((tier) => tier.id === tierId);
            return t ? <TierChip key={tierId} tier={t} size="sm" /> : null;
          })}
        </div>
      ),
    },
    {
      id: 'claims',
      header: 'Claims',
      cell: (r) => {
        const claimedCount = appData.vouchers.filter((v) => v.rewardId === r.id).length;
        return <span className="text-charcoal-muted">{claimedCount} claimed</span>;
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => (
        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
            r.status === 'active'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : r.status === 'inactive'
              ? 'bg-sand text-charcoal-muted border-sand-subtle'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: (r) => (
        <div className="space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(r);
            }}
            className="text-xs text-charcoal-muted hover:text-charcoal p-1"
            title={r.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            <Power className="w-3.5 h-3.5 inline" />
          </button>
          <Link
            to={`/admin/rewards/${r.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-tide font-semibold hover:underline"
          >
            Edit
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-subtle pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-tide">
            Catalogue Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold mt-1">
            Rewards Catalogue
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Configure redemptions, atelier gifts, vouchers, and experiential perks.
          </p>
        </div>

        <Link to="/admin/rewards/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Reward
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-sand-subtle text-xs font-semibold uppercase tracking-wider">
        {(['all', 'active', 'inactive', 'archived'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterStatus(tab)}
            className={`py-3 px-4 border-b-2 transition-colors capitalize ${
              filterStatus === tab
                ? 'border-tide text-tide font-bold bg-sand-card'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Rewards DataTable with Mobile Card Mode (NX-010) */}
      <DataTable
        data={rewards}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => navigate(`/admin/rewards/${item.id}`)}
        emptyMessage="No rewards match the current filter."
        cardRender={(r) => (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-sand border border-sand-subtle overflow-hidden shrink-0">
              <RewardImage
                src={r.image.src}
                alt={r.image.alt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-serif font-semibold text-charcoal text-sm truncate">{r.name}</span>
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 border shrink-0 ${
                    r.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : r.status === 'inactive'
                      ? 'bg-sand text-charcoal-muted border-sand-subtle'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-tide">{r.pointsCost} pts</span>
                <span className="text-charcoal-muted text-[11px]">{r.value.label}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-charcoal-muted">
                  {appData.vouchers.filter((v) => v.rewardId === r.id).length} claimed
                </span>
                <Link
                  to={`/admin/rewards/${r.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-tide font-semibold hover:underline"
                >
                  Edit &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};
