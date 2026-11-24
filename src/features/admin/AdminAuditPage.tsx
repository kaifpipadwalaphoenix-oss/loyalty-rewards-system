import React, { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/data/DataTable';
import type { AuditEntry } from '@/domain/types';
import { Download, Search, Eye, X } from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const appData = useAppData();
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const formatAuditSentence = (entry: AuditEntry): string => {
    let sentence = entry.summary;
    sentence = sentence.replace(/cust-[a-z0-9-]+/g, (id) => {
      const cust = appData.customers.find((c) => c.id === id);
      return cust ? `${cust.name} (${cust.memberNo})` : id;
    });
    sentence = sentence.replace(/staff-[a-z0-9-]+/g, (id) => {
      const s = appData.staff.find((st) => st.id === id);
      return s ? `${s.name} (${s.role})` : id;
    });
    return sentence;
  };

  const auditList = [...appData.audit].sort((a, b) => b.at.localeCompare(a.at));

  const filtered = auditList.filter((entry) => {
    if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      entry.summary.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q) ||
      (entry.actor.name && entry.actor.name.toLowerCase().includes(q))
    );
  });

  const uniqueActions = Array.from(new Set(appData.audit.map((a) => a.action)));

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Action', 'Actor Kind', 'Actor Name', 'Entity Type', 'Entity ID', 'Summary'];
    const rows = filtered.map((e) => [
      e.at,
      e.action,
      e.actor.kind,
      `"${e.actor.name ?? ''}"`,
      e.entity.type,
      e.entity.id,
      `"${formatAuditSentence(e).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trove-club-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<AuditEntry>[] = [
    {
      id: 'timestamp',
      header: 'Timestamp',
      cell: (entry) => (
        <span className="whitespace-nowrap text-charcoal-muted">
          {new Date(entry.at).toLocaleString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: (entry) => (
        <span
          className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border ${
            entry.action.includes('VOID') || entry.action.includes('DENIED')
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : entry.action.includes('PURCHASE') || entry.action.includes('REDEEM')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-sand text-charcoal border-sand-subtle'
          }`}
        >
          {entry.action}
        </span>
      ),
    },
    {
      id: 'actor',
      header: 'Actor',
      cell: (entry) => (
        <div>
          <span className="font-semibold text-charcoal block">
            {entry.actor.name ?? entry.actor.id ?? 'System'}
          </span>
          <span className="text-[10px] text-charcoal-muted capitalize">
            {entry.actor.role ?? entry.actor.kind}
          </span>
        </div>
      ),
    },
    {
      id: 'summary',
      header: 'Summary',
      cell: (entry) => (
        <span className="text-charcoal-muted leading-relaxed max-w-md block">
          {formatAuditSentence(entry)}
        </span>
      ),
    },
    {
      id: 'details',
      header: '',
      align: 'right',
      cell: (entry) =>
        (entry.before || entry.after) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEntry(entry);
            }}
            className="p-1.5 hover:bg-sand text-tide"
            title="Inspect diff"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-subtle pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-tide">
            Compliance &amp; Governance
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold mt-1">
            System Audit Trail ({appData.audit.length})
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Immutable log of all operational, administrative, and cashier events with state diffs.
          </p>
        </div>

        <Button onClick={handleExportCsv} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1.5" />
          Export Audit CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-sand-card p-4 border border-sand-subtle shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit events, actors, or summaries..."
            className="w-full pl-9 pr-3 py-2 bg-sand border border-sand-subtle focus:border-tide focus:outline-hidden text-xs text-charcoal"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-charcoal-muted">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-sand border border-sand-subtle text-xs text-charcoal focus:outline-hidden"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log DataTable with Mobile Card Mode (NX-010) */}
      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => {
          if (item.before || item.after) setSelectedEntry(item);
        }}
        emptyMessage="No audit records match the current filter."
        cardRender={(entry) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border ${
                  entry.action.includes('VOID') || entry.action.includes('DENIED')
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : entry.action.includes('PURCHASE') || entry.action.includes('REDEEM')
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-sand text-charcoal border-sand-subtle'
                }`}
              >
                {entry.action}
              </span>
              <span className="text-[11px] text-charcoal-muted">
                {new Date(entry.at).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-xs text-charcoal leading-relaxed">
              {formatAuditSentence(entry)}
            </p>
            <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-1">
              <span>
                By: <strong className="text-charcoal">{entry.actor.name ?? entry.actor.id ?? 'System'}</strong> ({entry.actor.role ?? entry.actor.kind})
              </span>
              {(entry.before || entry.after) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntry(entry);
                  }}
                  className="text-xs text-tide font-semibold underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Diff
                </button>
              )}
            </div>
          </div>
        )}
      />

      {/* Diff Inspector Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-sand-subtle pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-tide block">
                  {selectedEntry.action} · {selectedEntry.at}
                </span>
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  Audit State Diff
                </h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-1 text-charcoal-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal-muted">{selectedEntry.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto text-xs font-mono">
              <div>
                <span className="font-bold text-charcoal-muted block mb-1">State Before:</span>
                <pre className="p-3 bg-sand border border-sand-subtle overflow-x-auto text-[11px] max-h-80">
                  {selectedEntry.before ? JSON.stringify(selectedEntry.before, null, 2) : 'null (None)'}
                </pre>
              </div>

              <div>
                <span className="font-bold text-charcoal-muted block mb-1">State After:</span>
                <pre className="p-3 bg-sand border border-sand-subtle overflow-x-auto text-[11px] max-h-80 text-emerald-900">
                  {selectedEntry.after ? JSON.stringify(selectedEntry.after, null, 2) : 'null (None)'}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-sand-subtle flex justify-end">
              <Button onClick={() => setSelectedEntry(null)} size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
