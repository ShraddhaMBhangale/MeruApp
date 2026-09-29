'use client'

import { useState, useTransition } from 'react'
import { practitionerLogin } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await practitionerLogin(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / brand */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-4 4-4 9s4 9 4 9M8 7.5c0 0 2 2 4 4.5s4 4.5 4 4.5M16 7.5c0 0-2 2-4 4.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Meru Chikitsa</h1>
          <p className="mt-1 text-sm text-slate-500">Practitioner Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="space-y-1.5">
            <Label htmlFor="email" required>Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" required>Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={isPending}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Client?{' '}
          <a href="/portal-login" className="font-medium text-teal-600 hover:text-teal-700">
            Access your portal →
          </a>
        </p>
      </div>
    </div>
  )
}
