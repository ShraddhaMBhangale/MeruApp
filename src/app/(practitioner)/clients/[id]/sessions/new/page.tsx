'use client'

import { useTransition, useState } from 'react'
import { createSession } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
]

export default function NewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState('60')

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('duration_minutes', duration)
    startTransition(async () => {
      const result = await createSession(id, formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/clients/${id}`} className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Schedule Session</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Session Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="session_date" required>Date</Label>
                <Input id="session_date" name="session_date" type="date" defaultValue={today} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="session_time">Time</Label>
                <Input id="session_time" name="session_time" type="time" defaultValue="10:00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                      duration === d.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <Button type="submit" loading={isPending} className="w-full" size="lg">
              Create session &amp; open Form 4
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
