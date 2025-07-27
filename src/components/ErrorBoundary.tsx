'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // エラーログを記録（本番環境では外部サービスに送信）
    if (typeof window !== 'undefined') {
      console.group('🚨 Application Error Details');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Props Keys:', Object.keys(this.props));
      console.error('User Agent:', navigator.userAgent);
      console.error('URL:', window.location.href);
      console.error('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// デフォルトのエラー表示コンポーネント
function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="shrink-0">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              申し訳ございません
            </h3>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            予期しないエラーが発生しました。ページを再読み込みするか、しばらく時間をおいて再度お試しください。
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer">
                開発者向け詳細情報
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-sm overflow-auto">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={resetError}
            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            再試行
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            ページ再読み込み
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            トップページに戻る
          </a>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;