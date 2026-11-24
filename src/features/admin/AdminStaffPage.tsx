import React, { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { useStaffSession } from '@/hooks/useStaffSession';
import { upsertStaff, setStaffActive, resetStaffPin } from '@/services/staff';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/Field';
import { DataTable } from '@/components/data/DataTable';
import type { StaffMember, Role } from '@/domain/types';
import { runCommand } from '@/services/command';
import { ok } from '@/lib/result';
import { Power, Plus, X, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const appData = useAppData();
  const { staff: currentStaff } = useStaffSession();

  // New staff modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<Role>('cashier');
  const [newPin, setNewPin] = useState('1111');

  // Reset PIN modal
  const [resetPinStaff, setResetPinStaff] = useState<StaffMember | null>(null);
  const [pinCode, setPinCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const handleToggleRevealPin = (member: StaffMember) => {
    if (!currentStaff) return;
    const isCurrentlyRevealed = !!revealedPins[member.id];
    if (!isCurrentlyRevealed) {
      runCommand({
        actor: {
          kind: 'staff',
          id: currentStaff.id,
          name: currentStaff.name,
          role: currentStaff.role,
        },
        input: {},
        handler: (_, d) => ok({ nextData: d, value: true }),
        audit: () => ({
          action: 'STAFF_PIN_REVEALED',
          entity: { type: 'staff', id: member.id },
          summary: `${currentStaff.name} (${currentStaff.role}) revealed PIN for ${member.name} (${member.id})`,
        }),
      });
    }
    setRevealedPins((prev) => ({ ...prev, [member.id]: !isCurrentlyRevealed }));
  };

  const handleToggleActive = (member: StaffMember) => {
    if (!currentStaff) return;
    setError(null);
    const res = setStaffActive({
      staffId: member.id,
      active: !member.active,
      adminStaffId: currentStaff.id,
    });
    if (!res.ok) {
      setError(res.error.message);
    }
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff || !resetPinStaff) return;
    if (pinCode.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const res = resetStaffPin({
        staffId: resetPinStaff.id,
        newPin: pinCode,
        adminStaffId: currentStaff.id,
      });
      setLoading(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      setResetPinStaff(null);
      setPinCode('');
    }, 150);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;
    if (!newName.trim() || newPin.length !== 4) {
      setError('Please provide staff name and 4-digit PIN');
      return;
    }

    setLoading(true);
    setError(null);

    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      pin: newPin,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      const res = upsertStaff({
        staff: newStaffMember,
        adminStaffId: currentStaff.id,
      });
      setLoading(false);

      if (!res.ok) {
        setError(res.error.message);
        return;
      }

      setAddModalOpen(false);
      setNewName('');
      setNewPin('1111');
    }, 150);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-subtle pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-tide">
            Staff &amp; Access Controls
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-semibold mt-1">
            Store Staff &amp; Team ({appData.staff.length})
          </h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage cashier station access, store managers, and administrative privileges.
          </p>
        </div>

        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Staff Member
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Staff DataTable with Mobile Card Mode (NX-010) */}
      <DataTable
        data={appData.staff}
        columns={[
          {
            id: 'name',
            header: 'Staff Member',
            cell: (s) => (
              <div>
                <span className="font-serif font-semibold text-charcoal block">{s.name}</span>
                <span className="font-mono text-[10px] text-charcoal-muted">{s.id}</span>
              </div>
            ),
          },
          {
            id: 'role',
            header: 'Assigned Role',
            cell: (s) => (
              <span
                className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border ${
                  s.role === 'admin'
                    ? 'bg-tide text-white border-tide'
                    : s.role === 'manager'
                    ? 'bg-sand text-tide border-sand-subtle'
                    : 'bg-sand text-charcoal border-sand-subtle'
                }`}
              >
                {s.role}
              </span>
            ),
          },
          {
            id: 'pin',
            header: 'Station PIN',
            cell: (s) => (
              <div className="flex items-center gap-2 font-mono text-charcoal">
                <span>{revealedPins[s.id] ? s.pin : '••••'}</span>
                {currentStaff?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleToggleRevealPin(s)}
                    className="text-[10px] text-tide hover:underline font-sans cursor-pointer flex items-center gap-1"
                    title={revealedPins[s.id] ? 'Hide PIN' : 'Reveal PIN (audited)'}
                  >
                    {revealedPins[s.id] ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Reveal
                      </>
                    )}
                  </button>
                )}
              </div>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            cell: (s) => (
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                  s.active
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {s.active ? 'Active' : 'Deactivated'}
              </span>
            ),
          },
          {
            id: 'created',
            header: 'Created',
            cell: (s) => <span className="text-charcoal-muted">{s.createdAt.slice(0, 10)}</span>,
          },
          {
            id: 'actions',
            header: '',
            align: 'right',
            cell: (s) => (
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setResetPinStaff(s);
                    setPinCode(s.pin);
                    setError(null);
                  }}
                  className="text-xs text-tide hover:underline font-semibold"
                >
                  Reset PIN
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(s)}
                  className="text-xs text-charcoal-muted hover:text-charcoal"
                  title={s.active ? 'Deactivate staff account' : 'Activate staff account'}
                >
                  <Power className="w-3.5 h-3.5 inline" />
                </button>
              </div>
            ),
          },
        ]}
        keyExtractor={(item) => item.id}
        emptyMessage="No staff members found."
        cardRender={(s) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-charcoal text-sm">{s.name}</span>
                <span
                  className={`inline-block px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider border ${
                    s.role === 'admin'
                      ? 'bg-tide text-white border-tide'
                      : s.role === 'manager'
                      ? 'bg-sand text-tide border-sand-subtle'
                      : 'bg-sand text-charcoal border-sand-subtle'
                  }`}
                >
                  {s.role}
                </span>
              </div>
              <span
                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 border ${
                  s.active
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {s.active ? 'Active' : 'Deactivated'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-charcoal-muted text-[11px]">PIN:</span>
                <span className="text-charcoal">{revealedPins[s.id] ? s.pin : '••••'}</span>
                {currentStaff?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleToggleRevealPin(s)}
                    className="text-[10px] text-tide underline font-sans ml-1"
                  >
                    {revealedPins[s.id] ? 'Hide' : 'Reveal'}
                  </button>
                )}
              </div>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setResetPinStaff(s);
                    setPinCode(s.pin);
                    setError(null);
                  }}
                  className="text-xs text-tide hover:underline font-semibold"
                >
                  Reset PIN
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(s)}
                  className="text-xs text-charcoal-muted hover:text-charcoal"
                >
                  <Power className="w-3.5 h-3.5 inline" />
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-sand-subtle pb-3">
              <h3 className="font-serif text-lg font-semibold text-charcoal">Add Staff Member</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-charcoal-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Karan Roy"
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
                  required
                />
              </Field>

              <Field label="Staff Role">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm text-charcoal"
                >
                  <option value="cashier">Cashier (Store counter operations)</option>
                  <option value="manager">Manager (Adjustments, voids, customer supervision)</option>
                  <option value="admin">Admin (Full settings, rules, staff management)</option>
                </select>
              </Field>

              <Field label="4-Digit Authorization PIN" required>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm font-mono text-charcoal font-bold"
                  required
                />
              </Field>

              <div className="flex gap-2 pt-2">
                <Button type="submit" fullWidth disabled={loading}>
                  {loading ? 'Adding...' : 'Create Account'}
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset PIN Modal */}
      {resetPinStaff && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-sand-card p-6 border border-sand-subtle shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-semibold text-charcoal">
              Reset PIN for {resetPinStaff.name}
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Set a new 4-digit PIN for station access.
            </p>

            <form onSubmit={handleResetPin} className="space-y-4">
              <Field label="New 4-Digit PIN" required>
                <input
                  type="text"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="4 digits"
                  className="w-full px-3 py-2 bg-sand border border-sand-subtle text-sm font-mono text-charcoal font-bold"
                  required
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit" fullWidth disabled={pinCode.length !== 4 || loading}>
                  {loading ? 'Saving...' : 'Update PIN'}
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setResetPinStaff(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
