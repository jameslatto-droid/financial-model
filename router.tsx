import React, { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Charts from './src/pages/Charts'

const Dashboard = lazy(() => import('./pages/Dashboard'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Make Charts the default (index) route to avoid Dashboard errors on load
      { index: true, element: <Charts /> },
      { path: 'charts', element: <Charts /> },
      { path: 'dashboard', element: <Dashboard /> },
    ],
  },
])
