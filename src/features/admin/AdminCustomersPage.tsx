import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/hooks/useAppData';
import { selectCustomerList, type CustomerListItem } from '@/data/selectors/customers';
import { TierChip } from '@/components/brand/TierChip';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/data/DataTable';
import { formatRupees, formatMobile } from '@/lib/format';
import { Search, Download, ChevronRight } from 'lucide-react';
import { tierProgress } from '@/domain/tiers';

export const AdminCustomersPage: React.FC = () => {
  const appData = useAppData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'expiring' | 'celebrations' | 'near_tier'>('all');
  const [sortField, setSortField] = useState<'balance' | 'spend' | 'name'>('spend');
  const [sortAsc, setSortAsc] = useState(false);

  const customerList = selectCustomerList(appData);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const filtered = customerList
    .filter((item) => {
      if (tierFilter !== 'all' && item.tier.id !== tierFilter) return false;

      // Segment filters (NX-111)
      if (segmentFilter === 'celebrations') {
        const hasBday = item.customer.birthday?.month === currentMonth;
        const hasAnniv = item.customer.anniversary?.month === currentMonth;
        if (!hasBday && !hasAnniv) return false;
      } else if (segmentFilter === 'near_tier') {
        const prog = tierProgress(item.qualifyingSpendPaise, item.tier, appData.tiers);
        if (!prog.nextTier || prog.remainingPaise > 1000000) return false; // within ₹10,000 of next tier
      } else if (segmentFilter === 'expiring') {
        // Points expiring in next 60 days
        const sixtyDaysAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();
        const hasExpiring = appData.transactions.some(
          (t) =>
            t.customerId === item.customer.id &&
            t.points > 0 &&
            t.expiresAt &&
            t.expiresAt >= now.toISOString() &&
            t.expiresAt <= sixtyDaysAhead
        );
        if (!hasExpiring) return false;
      }

      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        item.customer.name.toLowerCase().includes(q) ||
        item.customer.mobile.includes(q) ||
        item.customer.memberNo.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortField === 'balance') diff = a.balance - b.balance;
      else if (sortField === 'spend') diff = a.qualifyingSpendPaise - b.qualifyingSpendPaise;
      else diff = a.customer.name.localeCompare(b.customer.name);
      return sortAsc ? diff : -diff;
    });

  const handleExportCsv = () => {
    const headers = [
      'Member ID',
      'Name',
      'Mobile',
      'Email',
      'Tier',
      'Balance (pts)',
      '12M Spend (INR)',
      'Lifetime Spend (INR)',
      'Purchases Count',
      'Enrolled At',
    ];

    const rows = filtered.map((i) => [
      i.customer.memberNo,
      `"${i.customer.name}"`,
      i.customer.mobile,
      i.customer.email ?? '',
      i.tier.name,
      i.balance,
      (i.qualifyingSpendPaise / 100).toFixed(2),
      (i.lifetimeSpendPaise / 100).toFixed(2),
      i.purchaseCount,
      i.customer.enrolledAt.slice(0, 10),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trove-club-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<CustomerListItem>[] = [
    {
      id: 'member',
      header: 'Member',
      cell: (item) => (
        <div>
          <span className="font-serif font-semibold text-charcoal block">
            {item.customer.name}
          </span>
          <span className="font-mono text-[10px] text-charcoal-muted">
            {item.customer.memberNo}
          </span>
        </div>
      ),
    },
    {
      id: 'mobile',
      header: 'Mobile',
      cell: (item) => (
        <span className="font-mono text-charcoal">{formatMobile(item.customer.mobile)}</span>
      ),
    },
    {
      id: 'tier',
      header: 'Tier',
      cell: (item) => <TierChip tier={item.tier} size="sm" />,
    },
    {
      id: 'balance',
      header: 'Balance',
      sortable: true,
      cell: (item) => (
        <span className="font-serif font-bold text-tide">
          {item.balance.toLocaleString('en-IN')} pts
        </span>
      ),
    },
    {
      id: 'spend',
      header: '12M Spend',
      sortable: true,
      cell: (item) => (
        <span className="font-semibold text-charcoal">
          {formatRupees(item.qualifyingSpendPaise, false)}
        </span>
      ),
    },
    {
      id: 'purchases',
      header: 'Purchases',
      cell: (item) => <span className="text-charcoal-muted">{item.purchaseCount}</span>,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: () => (
        <span className="text-xs text-tide font-semibold hover:underline">
          View &rarr;
        </span>
      ),
    },
  ];

  const handleSort = (columnId: string) => {
    if (columnId === 'balance') {
      if (sortField === 'balance') setSortAsc(!sortAsc);
      else {
        setSortField('balance');
        setSortAsc(false);
      }
    } else if (columnId === 'spend') {
      if (sortField === 'spend') setSortAsc(!sortAsc);
      else {
        setSortField('spend');
        setSortAsc(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-subtle pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-tide">
            Member Directory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold mt-1">
            Customers ({customerList.length})
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Full registry of enrolled Trove Club members with live derived balances.
          </p>
        </div>

        <Button onClick={handleExportCsv} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Segment Chips (NX-111) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-charcoal mr-1">Filter Segment:</span>
        {[
          { id: 'all', label: 'All Members' },
          { id: 'celebrations', label: 'Celebrations This Month' },
          { id: 'near_tier', label: 'Near Next Tier' },
          { id: 'expiring', label: 'Points Expiring Soon' },
        ].map((seg) => (
          <button
            key={seg.id}
            type="button"
            onClick={() => setSegmentFilter(seg.id as typeof segmentFilter)}
            className={`px-3 py-1 text-xs font-medium border transition-colors ${
              segmentFilter === seg.id
                ? 'bg-tide text-white border-tide font-semibold'
                : 'bg-sand-card text-charcoal-muted border-sand-subtle hover:border-sand-focus hover:text-charcoal'
            }`}
          >
            {seg.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-sand-card p-4 border border-sand-subtle shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, or TC ID..."
            className="w-full pl-9 pr-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-xs text-charcoal"
          />
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-charcoal-muted">Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-1.5 bg-sand border border-sand-subtle text-xs text-charcoal focus:outline-hidden"
          >
            <option value="all">All Tiers</option>
            {appData.tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers DataTable with Mobile Card Mode (NX-010) */}
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.customer.id}
        sortBy={sortField}
        sortOrder={sortAsc ? 'asc' : 'desc'}
        onSort={handleSort}
        onRowClick={(item) => navigate(`/admin/customers/${item.customer.id}`)}
        emptyMessage="No customers match the current filter."
        cardRender={(item) => (
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-semibold text-charcoal text-sm truncate">
                  {item.customer.name}
                </span>
                <TierChip tier={item.tier} size="sm" />
              </div>
              <div className="text-[11px] text-charcoal-muted flex items-center gap-2">
                <span className="font-mono">{formatMobile(item.customer.mobile)}</span>
                <span>•</span>
                <span className="font-mono">{item.customer.memberNo}</span>
              </div>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="font-serif font-bold text-tide">
                  {item.balance.toLocaleString('en-IN')} pts
                </span>
                <span className="text-charcoal-muted">
                  12M Spend: <strong className="text-charcoal">{formatRupees(item.qualifyingSpendPaise, false)}</strong>
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-muted shrink-0" />
          </div>
        )}
      />
    </div>
  );
};
