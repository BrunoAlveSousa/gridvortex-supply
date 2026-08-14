import * as React from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep this visible in the console too, in case devtools are open.
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-8 my-8 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-700">
            Erro ao renderizar esta página
          </p>
          <p className="mb-3 font-mono text-sm">{this.state.error.message}</p>
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-white/60 p-3 text-xs text-red-800">
            {this.state.error.stack}
          </pre>
          <button
            className="mt-4 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => this.setState({ error: null })}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
