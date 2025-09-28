import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { ColorSchemeContext, type AppColorScheme } from './theme/colorScheme';
import '@mantine/core/styles.css';

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(_: any) { return { hasError: true } }
  componentDidCatch(error: any, info: any) { console.error('App ErrorBoundary:', error, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 space-y-3">
          <h2 className="h2">Something went wrong rendering this page.</h2>
          <p className="text-sm text-neutral-500">Try going back to the dashboard or refreshing.</p>
          <Link to="/dashboard" className="inline-block px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">Go to Dashboard</Link>
        </div>
      )
    }
    return this.props.children as any
  }
}

export default function App() {
  const [colorScheme, setColorScheme] = useState<AppColorScheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('color-scheme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggle = () => {
    const next = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(next);
    localStorage.setItem('color-scheme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
  }, [colorScheme]);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, toggle }}>
      <MantineProvider theme={theme} forceColorScheme={colorScheme}>
        <div className="min-h-dvh flex flex-col" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
          <main className="flex-1">
            <ErrorBoundary>
              <React.Suspense fallback={<div className="p-6">Loading…</div>}>
                <Outlet />
              </React.Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </MantineProvider>
    </ColorSchemeContext.Provider>
  )
}
