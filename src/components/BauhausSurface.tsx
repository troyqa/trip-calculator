import { Paper } from '@mui/material'
import type { ReactNode } from 'react'

type Accent = 'red' | 'blue' | 'yellow'

const accentClass: Record<Accent, string> = {
  red: 'bg-bauhaus-red',
  blue: 'bg-bauhaus-blue',
  yellow: 'bg-bauhaus-yellow',
}

export function BauhausSurface({
  children,
  accent,
  className = '',
}: {
  children: ReactNode
  accent: Accent
  className?: string
}) {
  return (
    <Paper
      component="section"
      elevation={0}
      className={`relative overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-0.5 ${className}`}
    >
      <span
        className={`pointer-events-none absolute right-4 top-4 size-2 rounded-full border-2 border-bauhaus-ink ${accentClass[accent]}`}
        aria-hidden
      />
      <div className="relative p-4 md:p-6 lg:p-8">{children}</div>
    </Paper>
  )
}
