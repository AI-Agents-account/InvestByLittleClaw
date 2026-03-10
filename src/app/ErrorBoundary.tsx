import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Unhandled render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
            <h1 className="text-xl font-semibold mb-2">Что-то пошло не так</h1>
            <p className="text-sm text-gray-500 mb-4">
              Произошла ошибка при отображении интерфейса. Попробуйте перезагрузить страницу.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
