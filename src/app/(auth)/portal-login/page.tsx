'use client'

import { useState, useTransition } from 'react'
import { sendClientOtp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'

export default function PortalLoginPage() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    setEmail(formData.get('email') as string)
    startTransition(async () => {
      const result = await sendClientOtp(formData)
      if (result?.error) setError(result.error)
      else setSent(true)
    })
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-4 4-4 9s4 9 4 9M8 7.5c0 0 2 2 4 4.5s4 4.5 4 4.5M16 7.5c0 0-2 2-4 4.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Meru Chikitsa — Sign in with your email</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="space-y-1.5">
              <Label htmlFor="email" required>Your email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={isPending}>
              Send magic link
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <Mail className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
            <p className="text-sm text-slate-500">
              We sent a sign-in link to <strong>{email}</strong>. Click it to access your portal.
            </p>
            <button
              onClick={() => { setSent(false); setError(null) }}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Use a different email
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500">
          Practitioner?{' '}
          <a href="/login" className="font-medium text-teal-600 hover:text-teal-700">
            Practitioner login →
          </a>
        </p>
      </div>
    </div>
  )
}
