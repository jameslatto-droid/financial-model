import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(_: any) { return { hasError: true } }
  componentDidCatch(error: any, info: any) { console.error('App ErrorBoundary:', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 space-y-3">
          <h2 className="h2">Something went wrong rendering this page.</h2>
          <p className="text-sm text-neutral-500">Try going back to the charts or refreshing.</p>
          <Link to="/charts" className="inline-block px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">Go to Charts</Link>
        </div>
      )
    }
    return this.props.children as any
  }
}

export default function App() {
  const { pathname } = useLocation()
  const linkCls = (active: boolean) =>
    `px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 ${active ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="font-semibold">Sanitation Tariff Dashboard</div>
          <nav className="flex gap-2 text-sm">
            <Link to="/dashboard" className={linkCls(pathname.startsWith('/dashboard'))}>Dashboard</Link>
            <Link to="/charts" className={linkCls(pathname === '/' || pathname.startsWith('/charts'))}>Charts</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="p-6">Loading…</div>}>
            <Outlet />
          </React.Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
