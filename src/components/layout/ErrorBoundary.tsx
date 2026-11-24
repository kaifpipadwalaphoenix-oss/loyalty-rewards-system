import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/button';
import { NotFound } from './NotFound';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Trove Club application:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-sand-card p-8 shadow-sm border border-sand-subtle">
            <div className="mb-6 flex justify-center">
              <Wordmark size="lg" />
            </div>
            <h1 className="font-serif text-2xl text-charcoal mb-3">Something went wrong</h1>
            <p className="text-sm text-charcoal-muted mb-6 leading-relaxed">
              An unexpected error occurred. You can return to the home page or restart your demo session.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-sand p-3 mb-6 overflow-x-auto text-charcoal-muted max-h-32 border border-sand-subtle whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col gap-3">
              <Button onClick={this.handleReset} fullWidth>
                Return to Trove Club
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const RouteError: React.FC = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : JSON.stringify(error);
  const stack = error instanceof Error ? error.stack : '';

  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-sand-card p-8 shadow-sm border border-sand-subtle">
        <div className="mb-6 flex justify-center">
          <Wordmark size="lg" />
        </div>
        <h1 className="font-serif text-2xl text-charcoal mb-3">Something went wrong</h1>
        <p className="text-sm text-charcoal-muted mb-4 leading-relaxed">
          An unexpected route error occurred.
        </p>
        <pre className="text-xs text-left bg-sand p-3 mb-6 overflow-x-auto text-charcoal-muted max-h-48 border border-sand-subtle whitespace-pre-wrap">
          {message}
          {stack && `\n${stack}`}
        </pre>
        <div className="flex flex-col gap-3">
          <Button onClick={() => (window.location.href = '/')} fullWidth>
            Return to Trove Club
          </Button>
        </div>
      </div>
    </div>
  );
};
