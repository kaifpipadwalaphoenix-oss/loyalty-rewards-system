import React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-sand-card p-8 border border-sand-subtle shadow-sm">
        <div className="mb-6 flex justify-center">
          <Wordmark size="md" />
        </div>
        <p className="text-xs uppercase tracking-widest text-tide font-semibold mb-2">404 · Page Not Found</p>
        <h1 className="font-serif text-3xl text-charcoal mb-4">Drifting Off Shore</h1>
        <p className="text-sm text-charcoal-muted mb-8 leading-relaxed">
          The page or destination you are searching for does not exist in the Trove Club loyalty prototype.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
          <Link to="/club">
            <Button>Member Portal</Button>
          </Link>
          <Link to="/counter">
            <Button variant="outline">Counter</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
