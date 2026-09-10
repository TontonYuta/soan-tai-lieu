import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
    (this as any).setState({ errorInfo });
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-[#FF5E5B] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-black m-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 stroke-[3]" />
            <h2 className="text-lg font-black uppercase">Đã Xảy Ra Lỗi Hiển Thị (UI Error)</h2>
          </div>
          <p className="text-xs font-bold font-mono bg-black text-[#FFED66] p-3 border-2 border-black mb-4 overflow-x-auto">
            {this.state.error?.toString() || 'Lỗi không xác định'}
          </p>
          {this.state.error?.stack && (
            <pre className="text-[11px] font-mono bg-zinc-900 text-zinc-200 p-3 border-2 border-black mb-4 overflow-x-auto max-h-48 whitespace-pre-wrap">
              {this.state.error.stack}
            </pre>
          )}
          {this.state.errorInfo?.componentStack && (
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider block mb-1">Component Stack Trace:</span>
              <pre className="text-[10px] font-mono bg-zinc-950 text-[#00CECB] p-3 border-2 border-black overflow-x-auto max-h-40 whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-[#FFED66] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 stroke-[3]" /> Tải Lại Giao Diện
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-zinc-800 cursor-pointer"
            >
              F5 Reload Trang
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
