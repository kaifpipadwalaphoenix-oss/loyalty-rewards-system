import React, { useRef } from 'react';
import { Search, UserPlus, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemberSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Array<{ id: string; name: string; mobile: string; memberNo: string }>;
  onSelectCustomer: (id: string) => void;
  onOpenEnrol: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const MemberSearch: React.FC<MemberSearchProps> = ({
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectCustomer,
  onOpenEnrol,
  onOpenHistory,
  historyCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If exactly 1 search result, auto-select it immediately
      if (searchResults.length === 1 && searchResults[0]) {
        onSelectCustomer(searchResults[0].id);
      } else if (searchResults.length > 1) {
        // Check if there is an exact match by mobile or member number
        const cleanQuery = searchQuery.trim().replace(/\D/g, '');
        const exactMatch = searchResults.find(
          (r) =>
            r.mobile.replace(/\D/g, '').endsWith(cleanQuery) ||
            r.memberNo.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        if (exactMatch) {
          onSelectCustomer(exactMatch.id);
        } else if (searchResults[0]) {
          onSelectCustomer(searchResults[0].id);
        }
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Customer Search Box */}
      <div className="relative flex-1">
        <div className="flex items-center bg-sand border border-sand-subtle focus-within:border-tide px-3 py-2">
          <Search className="w-4 h-4 text-charcoal-muted mr-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search member by mobile (last 4 digits), name, or ID... (Press Enter to select)"
            className="w-full bg-transparent text-sm text-charcoal focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-charcoal-muted hover:text-charcoal p-1"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-sand-card border border-sand-subtle shadow-lg z-20 max-h-60 overflow-y-auto divide-y divide-sand-subtle">
            {searchResults.map((cust) => (
              <button
                key={cust.id}
                type="button"
                onClick={() => onSelectCustomer(cust.id)}
                className="w-full p-3 text-left hover:bg-sand flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold text-charcoal block">{cust.name}</span>
                  <span className="text-charcoal-muted font-mono">
                    {cust.mobile} · {cust.memberNo}
                  </span>
                </div>
                <span className="text-tide font-semibold">Select &rarr;</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Enrol & Drawer Toggles */}
      <div className="flex items-center gap-2">
        <Button onClick={onOpenEnrol} variant="outline" size="sm" type="button">
          <UserPlus className="w-4 h-4 mr-1" />
          New Member
        </Button>

        <Button
          onClick={onOpenHistory}
          variant="ghost"
          size="sm"
          className="text-charcoal-muted"
          type="button"
        >
          <History className="w-4 h-4 mr-1" />
          History ({historyCount})
        </Button>
      </div>
    </div>
  );
};
