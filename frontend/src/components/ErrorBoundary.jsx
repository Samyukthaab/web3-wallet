import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card text-center">
            <h2 className="text-xl mb-4">⚠️ Something went wrong</h2>
            <p className="mb-4 text-secondary">
              The application encountered an unexpected error. Please refresh the page to continue.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;