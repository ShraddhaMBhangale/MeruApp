'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendClientOtp, sendPhoneOtp } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone } from 'lucide-react'

type Tab = 'email' | 'phone'
type PhoneStep = 'number' | 'otp'

export default function PortalLoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('email')

  // ── Email flow ─────────────────────────────────────────────────────────────
  const [emailSent, setEmailSent]   = useState(false)
  const [email, setEmail]           = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailPending, startEmailTransition] = useTransition()

  async function handleEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailError(null)
    const formData = new FormData(e.currentTarget)
    setEmail(formData.get('email') as string)
    startEmailTransition(async () => {
      const result = await sendClientOtp(formData)
      if (result?.error) setEmailError(result.error)
      else setEmailSent(true)
    })
  }

  // ── Phone flow ─────────────────────────────────────────────────────────────
  const [phoneStep, setPhoneStep]   = useState<PhoneStep>('number')
  const [phone, setPhone]           = useState('')
  const [otp, setOtp]               = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [phonePending, startPhoneTransition] = useTransition()
  const [verifyPending, setVerifyPending]    = useState(false)

  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPhoneError(null)
    // Normalise: ensure E.164 format (+91XXXXXXXXXX for India)
    const raw = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value.trim()
    const normalised = raw.startsWith('+') ? raw : `+91${raw.replace(/^0/, '')}`
    setPhone(normalised)
    startPhoneTransition(async () => {
      const fd = new FormData()
      fd.append('phone', normalised)
      const result = await sendPhoneOtp(fd)
      if (result?.error) setPhoneError(result.error)
      else setPhoneStep('otp')
    })
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPhoneError(null)
    setVerifyPending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      })
      if (error) { setPhoneError(error.message); return }
      router.push('/portal')
    } finally {
      setVerifyPending(false)
    }
  }

  // ── Logo ───────────────────────────────────────────────────────────────────
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

        {/* ── Tab switcher ── */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(['email', 'phone'] as Tab[]).map(t => (
            <button key={t} type="button"
              onClick={() => { setTab(t); setEmailError(null); setPhoneError(null) }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
              {t === 'email' ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              {t === 'email' ? 'Email link' : 'Phone OTP'}
            </button>
          ))}
        </div>

        {/* ══════ EMAIL TAB ══════ */}
        {tab === 'email' && (
          !emailSent ? (
            <form onSubmit={handleEmailSubmit}
              className="space-y-5 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="space-y-1.5">
                <Label htmlFor="email" required>Your email address</Label>
                <Input id="email" name="email" type="email"
                  placeholder="you@example.com" autoComplete="email" required />
              </div>
              {emailError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {emailError}
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" loading={emailPending}>
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
              <button onClick={() => { setEmailSent(false); setEmailError(null) }}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Use a different email
              </button>
            </div>
          )
        )}

        {/* ══════ PHONE TAB ══════ */}
        {tab === 'phone' && (
          phoneStep === 'number' ? (
            <form onSubmit={handleSendOtp}
              className="space-y-5 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="space-y-1.5">
                <Label htmlFor="phone" required>Mobile number</Label>
                <div className="flex gap-2">
                  <span className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
                    +91
                  </span>
                  <Input id="phone" name="phone" type="tel"
                    placeholder="9876543210" autoComplete="tel"
                    inputMode="numeric" maxLength={10} required />
                </div>
                <p className="text-xs text-slate-400">India numbers only. Enter without country code.</p>
              </div>
              {phoneError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {phoneError}
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" loading={phonePending}>
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}
              className="space-y-5 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="text-center space-y-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                  <Phone className="h-6 w-6 text-teal-600" />
                </div>
                <p className="text-sm text-slate-600 pt-2">
                  OTP sent to <strong>{phone}</strong>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="otp" required>Enter 6-digit OTP</Label>
                <Input id="otp" name="otp" type="text"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456" inputMode="numeric"
                  maxLength={6} autoComplete="one-time-code" required />
              </div>
              {phoneError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {phoneError}
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" loading={verifyPending}>
                Verify &amp; Sign in
              </Button>
              <button type="button"
                onClick={() => { setPhoneStep('number'); setOtp(''); setPhoneError(null) }}
                className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium">
                Use a different number
              </button>
            </form>
          )
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
