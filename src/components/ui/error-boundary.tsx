import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 text-destructive">
          <AlertTriangle className="h-full w-full" />
        </div>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
            Error details
          </summary>
          <pre className="mt-2 whitespace-pre-wrap bg-muted p-2 rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
        <div className="flex gap-2">
          <Button onClick={resetError} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'} className="flex-1">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Error message component for inline errors
export const ErrorMessage = ({ 
  title = "Error", 
  message, 
  onRetry,
  className 
}: { 
  title?: string; 
  message: string; 
  onRetry?: () => void;
  className?: string;
}) => (
  <div className={`rounded-lg border border-destructive/50 bg-destructive/10 p-4 ${className}`}>
    <div className="flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
      <div className="flex-1">
        <h3 className="font-medium text-destructive">{title}</h3>
        <p className="text-sm text-destructive/80 mt-1">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  </div>
);

// Network error component
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => (
  <ErrorMessage
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

// Not found error component
export const NotFoundError = ({ message = "The requested resource was not found." }: { message?: string }) => (
  <div className="text-center py-12">
    <div className="mx-auto mb-4 h-16 w-16 text-muted-foreground">
      <AlertTriangle className="h-full w-full" />
    </div>
    <h3 className="text-lg font-medium mb-2">Not Found</h3>
    <p className="text-muted-foreground mb-4">{message}</p>
    <Button variant="outline" onClick={() => window.history.back()}>
      Go Back
    </Button>
  </div>
);

export default ErrorBoundary;