// src/components/Help.tsx
import React, { useState, useRef, useEffect } from 'react'

export default function Help({
  text, children
}: {
  text: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <span ref={ref} className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-4 h-4 rounded-full border border-slate-500 text-[10px] leading-3 flex items-center justify-center text-slate-300 ml-1 hover:bg-slate-800"
        aria-label="Help"
        title={typeof text === 'string' ? text : undefined}
      >i</button>
      {open && (
        <div className="absolute z-30 mt-2 w-64 p-2 text-xs bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
          {children ?? text}
        </div>
      )}
    </span>
  )
}
