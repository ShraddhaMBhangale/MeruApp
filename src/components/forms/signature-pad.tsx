'use client'

import { useRef, useEffect, useState } from 'react'
import SignaturePad from 'signature_pad'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  existingSignature?: string | null
  className?: string
}

export function SignaturePadComponent({ onSave, existingSignature, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const [saved, setSaved] = useState(!!existingSignature)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d')!.scale(ratio, ratio)

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: '#1e293b',
    })

    if (existingSignature) {
      padRef.current.fromDataURL(existingSignature)
    }

    return () => { padRef.current?.off() }
  }, [existingSignature])

  function clear() {
    padRef.current?.clear()
    setSaved(false)
  }

  function save() {
    if (!padRef.current || padRef.current.isEmpty()) return
    const dataUrl = padRef.current.toDataURL('image/png')
    onSave(dataUrl)
    setSaved(true)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative rounded-lg border-2 border-dashed border-slate-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: 140 }}
        />
        {saved && (
          <div className="absolute top-2 right-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            ✓ Signed
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">Draw your signature above</p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={save}>Save signature</Button>
        <Button type="button" size="sm" variant="outline" onClick={clear}>Clear</Button>
      </div>
    </div>
  )
}
