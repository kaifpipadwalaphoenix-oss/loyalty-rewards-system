import React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/button';

interface AccessDeniedProps {
  requiredPermission?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredPermission }) => {
  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-sand-card p-8 border border-sand-subtle shadow-sm">
        <div className="mb-6 flex justify-center">
          <Wordmark size="md" />
        </div>
        <p className="text-xs uppercase tracking-widest text-terracotta font-semibold mb-2">
          403 · Access Restricted
        </p>
        <h1 className="font-serif text-2xl text-charcoal mb-4">Staff Permission Required</h1>
        <p className="text-sm text-charcoal-muted mb-4 leading-relaxed">
          Your current staff role does not have authorization to view or manage this section of Trove Club.
        </p>
        {requiredPermission && (
          <p className="text-xs bg-sand py-2 px-3 mb-6 text-charcoal-muted border border-sand-subtle inline-block">
            Required: <code className="font-mono text-charcoal">{requiredPermission}</code>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/counter">
            <Button>Store Counter</Button>
          </Link>
          <Link to="/counter/login">
            <Button variant="secondary">Switch Staff PIN</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
