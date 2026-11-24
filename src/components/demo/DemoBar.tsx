import React, { useState } from 'react';
import { DemoPanel } from './DemoPanel';
import { useMemberSession } from '@/hooks/useMemberSession';
import { useStaffSession } from '@/hooks/useStaffSession';
import { Sparkles, Users } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const { details: memberDetails } = useMemberSession();
  const { staff } = useStaffSession();

  const activeLabel = staff
    ? `${staff.name} (${staff.role})`
    : memberDetails
    ? `${memberDetails.customer.name} · ${memberDetails.tier.name} (${memberDetails.balance} pts)`
    : 'Guest (Demo Mode)';

  return (
    <>
      <div className="bg-sand-card/95 backdrop-blur-xs border-b border-sand-subtle px-4 py-1.5 text-xs text-charcoal flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-tide text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            Trove Club Demo
          </span>
          <span className="hidden sm:inline text-sand-muted">|</span>
          <span className="hidden sm:inline text-charcoal-muted truncate max-w-xs md:max-w-md">
            Active: <strong className="text-charcoal font-medium">{activeLabel}</strong>
          </span>
        </div>

        <button
          onClick={() => setPanelOpen(true)}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-tide text-white hover:bg-tide/90 transition-colors text-[11px] font-medium tracking-wide shadow-2xs shrink-0"
        >
          <Users className="w-3 h-3" />
          <span className="hidden sm:inline">Switch Persona / Guide</span>
          <span className="sm:hidden">Switch</span>
        </button>
      </div>

      <DemoPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
};
