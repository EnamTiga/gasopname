import { Component, type ReactNode } from "react";

interface State { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary:", error.message, error.stack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-red-400 font-mono text-sm">
          <p className="font-bold">Terjadi kesalahan saat menampilkan halaman:</p>
          <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
