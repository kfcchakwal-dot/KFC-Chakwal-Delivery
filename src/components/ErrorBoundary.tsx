import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Graceful error logging without printing sensitive customer data
    console.error('App error caught by ErrorBoundary:', error.message);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e0e11] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#e4002b] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-950/60 mb-6">
            KFC
          </div>

          <div className="max-w-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We experienced a temporary glitch loading this section. Please try again.
            </p>

            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-4 w-full bg-[#e4002b] hover:bg-[#c30025] active:scale-95 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry / Reload App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
