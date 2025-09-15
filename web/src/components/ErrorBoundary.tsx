import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="card">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We're sorry, but something unexpected happened. Please try again.
                  </p>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left bg-gray-100 rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                      Error Details (Development)
                    </summary>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={this.handleRetry}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Try Again</span>
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-secondary"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
