import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("UI Error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="card">
          <h1>Something went wrong</h1>
          <p className="muted">Please refresh the page or try again later.</p>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
