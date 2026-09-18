import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props: Props;
  state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Synapse402 Uncaught UI Error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (err: any) {
      console.warn('[ErrorBoundary] Failed to clear local storage:', err?.message || err);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090c] text-[#f5f5f2] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#0e1117] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Application Recovery</h3>
                <p className="text-xs text-zinc-400 font-mono">Synapse402 Fault Isolation</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              An unexpected interface exception was safely intercepted. You can reload the page or reset the sandbox state.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/60 border border-white/[.08] text-[11px] font-mono text-rose-300 max-h-24 overflow-y-auto">
                {this.state.error.message || 'Unknown render error'}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 rounded-xl bg-[#d7ff4f] hover:bg-[#e2ff73] text-[#11130d] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>
              <button
                onClick={this.handleResetAndReload}
                className="px-4 py-2.5 rounded-xl bg-white/[.04] hover:bg-white/[.08] text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition"
              >
                Reset State
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
