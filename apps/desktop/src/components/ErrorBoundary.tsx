'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircleIcon, RefreshCwIcon } from '@/components/ui/hugeicons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in OpenStore:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-app)] text-[var(--text-main)]">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-zinc-200 dark:border-white/10 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
              <AlertCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950 dark:text-white">Something went wrong</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
                {this.state.error?.message || 'An unexpected runtime error occurred.'}
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="btn-primary px-5 py-2 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCwIcon className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
