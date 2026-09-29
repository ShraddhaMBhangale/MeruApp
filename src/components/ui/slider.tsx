'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  lowLabel?: string
  highLabel?: string
}

export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  className,
  lowLabel,
  highLabel,
}: SliderFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-teal-700 w-6 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-teal-600"
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  )
}
