'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendClientOtp } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'

type Step = 'email' | 'otp'

export default function PortalLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sendPending, startSendTransition] = useTransition()
  const [verifyPending, setVerifyPending] = useState(false)
  const [oauthPending, setOauthPending] = useState<'google' | 'facebook' | null>(null)

  async function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const emailValue = formData.get('email') as string
    setEmail(emailValue)
    startSendTransition(async () => {
      const result = await sendClientOtp(formData)
      if (result?.error) setError(result.error)
      else setStep('otp')
    })
  }

  async function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setVerifyPending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })
      if (error) { setError(error.message); return }
      router.push('/portal')
    } finally {
      setVerifyPending(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    setError(null)
    setOauthPending(provider)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/portal`,
      },
    })
    if (error) {
      setError(error.message)
      setOauthPending(null)
    }
    // Browser auto-redirects to provider on success — loading state stays until navigation
  }

  const Logo = () => (
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
      <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-4 4-4 9s4 9 4 9M8 7.5c0 0 2 2 4 4.5s4 4.5 4 4.5M16 7.5c0 0-2 2-4 4.5" />
      </svg>
    </div>
  )

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Meru Chikitsa — Sign in to continue</p>
        </div>

        {step === 'email' ? (
          <div className="space-y-4">
            {/* OAuth buttons */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-3">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthPending}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                {oauthPending === 'google' ? (
                  <svg className="h-4 w-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('facebook')}
                disabled={!!oauthPending}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#166FE5] transition-colors disabled:opacity-60"
              >
                {oauthPending === 'facebook' ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                )}
                Continue with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs text-slate-400 font-medium">or sign in with email</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSendCode}
              className="space-y-5 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="space-y-1.5">
                <Label htmlFor="email" required>Your email address</Label>
                <Input id="email" name="email" type="email"
                  placeholder="you@example.com" autoComplete="email" required />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" loading={sendPending}>
                Send code
              </Button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerifyCode}
            className="space-y-5 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="text-center space-y-2 pb-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                <Mail className="h-6 w-6 text-teal-600" />
              </div>
              <p className="text-sm text-slate-600">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="otp" required>6-digit code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
                required
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" loading={verifyPending}>
              Verify &amp; Sign in
            </Button>
            <button type="button"
              onClick={() => { setStep('email'); setOtp(''); setError(null) }}
              className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium">
              Use a different email
            </button>
          </form>
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
