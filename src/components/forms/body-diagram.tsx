'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { BodyDotAnnotation } from '@/types/database'

type Phase = 'before' | 'during' | 'after'

const PHASE_COLORS: Record<Phase, string> = {
  before: '#3b82f6',   // blue
  during: '#f97316',   // orange
  after: '#22c55e',    // green
}

interface BodyDiagramProps {
  annotations: BodyDotAnnotation[]
  onChange: (annotations: BodyDotAnnotation[]) => void
  readOnly?: boolean
}

export function BodyDiagram({ annotations, onChange, readOnly }: BodyDiagramProps) {
  const [activePhase, setActivePhase] = useState<Phase>('before')

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (readOnly) return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    onChange([...annotations, { x, y, phase: activePhase }])
  }

  function removeLast() {
    onChange(annotations.slice(0, -1))
  }

  function clearAll() {
    onChange([])
  }

  return (
    <div className="space-y-3">
      {/* Phase selector */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          {(['before', 'during', 'after'] as Phase[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePhase(p)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold border-2 transition-all',
                activePhase === p ? 'border-current opacity-100' : 'opacity-50 border-transparent'
              )}
              style={{ color: PHASE_COLORS[p], borderColor: activePhase === p ? PHASE_COLORS[p] : 'transparent', backgroundColor: `${PHASE_COLORS[p]}18` }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            <button type="button" onClick={removeLast} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">Undo</button>
            <button type="button" onClick={clearAll} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">Clear</button>
          </div>
        </div>
      )}

      {/* SVG body */}
      <div className="relative mx-auto" style={{ maxWidth: 220 }}>
        <svg
          viewBox="0 0 100 260"
          onClick={handleClick}
          className={cn('w-full rounded-xl border border-slate-200 bg-slate-50', !readOnly && 'cursor-crosshair')}
        >
          {/* Posterior body outline */}
          {/* Head */}
          <ellipse cx="50" cy="18" rx="12" ry="14" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Neck */}
          <rect x="45" y="31" width="10" height="10" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Shoulders */}
          <rect x="20" y="40" width="60" height="6" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Torso */}
          <rect x="30" y="45" width="40" height="70" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Arms */}
          <rect x="14" y="44" width="16" height="58" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="70" y="44" width="16" height="58" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Hips */}
          <rect x="28" y="113" width="44" height="16" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Legs */}
          <rect x="30" y="128" width="18" height="75" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="52" y="128" width="18" height="75" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Feet */}
          <rect x="28" y="201" width="22" height="12" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="50" y="201" width="22" height="12" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Spine line */}
          <line x1="50" y1="41" x2="50" y2="113" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2,2" />

          {/* Spine labels */}
          <text x="55" y="52" fontSize="3.5" fill="#64748b">C</text>
          <text x="55" y="70" fontSize="3.5" fill="#64748b">T</text>
          <text x="55" y="95" fontSize="3.5" fill="#64748b">L</text>
          <text x="55" y="112" fontSize="3.5" fill="#64748b">S</text>

          {/* Annotation dots */}
          {annotations.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y * 2.6}  // scale y to viewBox
              r="3"
              fill={PHASE_COLORS[dot.phase]}
              fillOpacity="0.85"
              stroke="white"
              strokeWidth="0.8"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(['before', 'during', 'after'] as Phase[]).map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PHASE_COLORS[p] }} />
            <span className="text-slate-600 capitalize">{p} ({annotations.filter(a => a.phase === p).length})</span>
          </div>
        ))}
      </div>
    </div>
  )
}
