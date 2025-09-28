import React, { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Charts from './pages/Charts'
import AppLayout from './shell/AppLayout'

const Dashboard = lazy(() => import('./pages/Dashboard'))

// Studio pages (from the source app)
const StudioDashboard = lazy(() => import('./studio/FinanceDashboard'))
const Assumptions = lazy(() => import('./studio/pages/Assumptions'))
const WillingnessToPay = lazy(() => import('./studio/pages/WillingnessToPay'))
const AnnualSnapshot = lazy(() => import('./studio/pages/AnnualSnapshot'))
const InvestmentOverview = lazy(() => import('./studio/pages/InvestmentOverview'))
const OperatingEconomics = lazy(() => import('./studio/pages/OperatingEconomics'))
const FinancingCoverage = lazy(() => import('./studio/pages/FinancingCoverage'))
const ReturnsAndRisk = lazy(() => import('./studio/pages/ReturnsAndRisk'))
const LifecycleStory = lazy(() => import('./studio/pages/LifecycleStory'))
const ChartCatalog = lazy(() => import('./studio/pages/ChartCatalog'))
const TableCatalog = lazy(() => import('./studio/pages/TableCatalog'))
const CalculationsCatalog = lazy(() => import('./studio/pages/CalculationsCatalog'))
const InputsCatalog = lazy(() => import('./studio/pages/InputsCatalog'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Main dashboard routes using FinanceDashboard
      {
        path: '',
        element: <StudioDashboard />,
        children: [
          {
            path: '',
            element: <AppLayout />,
            children: [
              { index: true, element: <Assumptions /> },
              { path: 'assumptions', element: <Assumptions /> },
              { path: 'willingness-to-pay', element: <WillingnessToPay /> },
              { path: 'annual-snapshot', element: <AnnualSnapshot /> },
              { path: 'investment-overview', element: <InvestmentOverview /> },
              { path: 'operating-economics', element: <OperatingEconomics /> },
              { path: 'financing-coverage', element: <FinancingCoverage /> },
              { path: 'returns-and-risk', element: <ReturnsAndRisk /> },
              { path: 'lifecycle-story', element: <LifecycleStory /> },
              { path: 'chart-catalog', element: <ChartCatalog /> },
              { path: 'table-catalog', element: <TableCatalog /> },
              { path: 'calculations-catalog', element: <CalculationsCatalog /> },
              { path: 'inputs-catalog', element: <InputsCatalog /> },
            ],
          },
        ],
      },
      {
        path: 'dashboard',
        element: <StudioDashboard />,
        children: [
          {
            path: '',
            element: <AppLayout />,
            children: [
              { index: true, element: <Assumptions /> },
            ],
          },
        ],
      },
      // Legacy dashboard route for backward compatibility
      {
        path: 'legacy-dashboard',
        element: <Dashboard />
      },
      // Studio routes (kept for backward compatibility)
      {
        path: 'studio',
        element: <StudioDashboard />,
        children: [
          {
            path: '',
            element: <AppLayout />,
            children: [
              { index: true, element: <Assumptions /> },
              { path: 'assumptions', element: <Assumptions /> },
              { path: 'willingness-to-pay', element: <WillingnessToPay /> },
              { path: 'annual-snapshot', element: <AnnualSnapshot /> },
              { path: 'investment-overview', element: <InvestmentOverview /> },
              { path: 'operating-economics', element: <OperatingEconomics /> },
              { path: 'financing-coverage', element: <FinancingCoverage /> },
              { path: 'returns-and-risk', element: <ReturnsAndRisk /> },
              { path: 'lifecycle-story', element: <LifecycleStory /> },
              { path: 'chart-catalog', element: <ChartCatalog /> },
              { path: 'table-catalog', element: <TableCatalog /> },
              { path: 'calculations-catalog', element: <CalculationsCatalog /> },
              { path: 'inputs-catalog', element: <InputsCatalog /> },
            ],
          },
        ],
      },
      // Legacy dashboard route for backward compatibility
      {
        path: 'legacy-dashboard',
        element: (
          <div className="min-h-dvh flex flex-col">
            <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-200/60 dark:border-neutral-800">
              <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="font-semibold">Sanitation Tariff Dashboard (Legacy)</div>
                <nav className="flex gap-2 text-sm">
                  <a href="/" className="px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">New Dashboard</a>
                  <a href="/charts" className="px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">Charts</a>
                </nav>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
              <Dashboard />
            </main>
          </div>
        )
      },
      { 
        path: 'charts', 
        element: (
          <div className="min-h-dvh flex flex-col">
            <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-200/60 dark:border-neutral-800">
              <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="font-semibold">Sanitation Tariff Dashboard</div>
                <nav className="flex gap-2 text-sm">
                  <a href="/dashboard" className="px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">Dashboard</a>
                  <a href="/charts" className="px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 bg-neutral-100 dark:bg-neutral-800">Charts</a>
                  <a href="/studio" className="px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800">Studio</a>
                </nav>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
              <Charts />
            </main>
          </div>
        )
      },
      
      // Studio routes (kept for backward compatibility)
      {
        path: 'studio',
        element: <StudioDashboard />,
        children: [
          {
            path: '',
            element: <AppLayout />,
            children: [
              { index: true, element: <Assumptions /> },
              { path: 'assumptions', element: <Assumptions /> },
              { path: 'willingness-to-pay', element: <WillingnessToPay /> },
              { path: 'annual-snapshot', element: <AnnualSnapshot /> },
              { path: 'investment-overview', element: <InvestmentOverview /> },
              { path: 'operating-economics', element: <OperatingEconomics /> },
              { path: 'financing-coverage', element: <FinancingCoverage /> },
              { path: 'returns-and-risk', element: <ReturnsAndRisk /> },
              { path: 'lifecycle-story', element: <LifecycleStory /> },
              { path: 'chart-catalog', element: <ChartCatalog /> },
              { path: 'table-catalog', element: <TableCatalog /> },
              { path: 'calculations-catalog', element: <CalculationsCatalog /> },
              { path: 'inputs-catalog', element: <InputsCatalog /> },
            ],
          },
        ],
      },
    ],
  },
])
