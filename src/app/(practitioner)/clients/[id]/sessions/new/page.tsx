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

export default function NewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
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
        <h1 className="text-xl font-bold text-slate-900">Start New Session</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Session Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="session_date" required>Session date</Label>
              <Input id="session_date" name="session_date" type="date" defaultValue={today} required />
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
