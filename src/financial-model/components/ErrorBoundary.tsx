import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; message?: string; resetKey: number }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: undefined, resetKey: 0 }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error) }
  }

  componentDidCatch(error: any, info: any) {
    // You can log to an error reporting service here
    // console.error('ErrorBoundary caught', error, info)
  }

  reset = () => {
    this.setState({ hasError: false, message: undefined, resetKey: this.state.resetKey + 1 })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel">
          <div className="mb-2">
            <strong>Component failed to render</strong>
          </div>
          <div className="text-sm text-neutral-600 mb-3">{this.state.message}</div>
          <div className="flex gap-2">
            <button onClick={this.reset} className="px-3 py-1.5 rounded-md border text-sm">
              Retry
            </button>
          </div>
        </div>
      )
    }
    return <React.Fragment>{this.props.children}</React.Fragment>
  }
}
