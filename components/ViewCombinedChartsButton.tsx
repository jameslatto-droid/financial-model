import React from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  className?: string
  label?: string
}

export default function ViewCombinedChartsButton({ className = '', label = 'View Combined Charts →' }: Props) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/charts')}
      className={
        'inline-flex items-center justify-center rounded-md border border-neutral-300/70 dark:border-neutral-700 px-3 py-1.5 text-sm ' +
        'hover:bg-neutral-50 dark:hover:bg-neutral-800 transition ' + className
      }
      aria-label="View Combined Charts"
    >
      {label}
    </button>
  )
}
