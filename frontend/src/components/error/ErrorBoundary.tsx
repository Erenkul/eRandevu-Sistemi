import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback" role="alert">
          <h2>Bir hata oluştu</h2>
          <p>Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          <button onClick={() => window.location.reload()}>Sayfayı Yenile</button>
        </div>
      );
    }
    return this.props.children;
  }
}
