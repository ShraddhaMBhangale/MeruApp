'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Sparkles, Heart, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const AOL_DONATION_URL = 'https://www.artofliving.online/donate.php?nca_id=969567'

const PACKAGES = [
  {
    key: 'complimentary',
    label: 'Complimentary',
    sessions: 1,
    price: 0,
    description: 'A free introductory session to experience NSA care',
    features: ['1 NSA session', 'Initial assessment', 'No commitment'],
  },
  {
    key: 'single',
    label: 'Single Session',
    sessions: 1,
    price: 1500,
    description: 'One NSA session for existing clients',
    features: ['1 NSA session', 'Session notes'],
  },
  {
    key: 'starter',
    label: 'Starter Pack',
    sessions: 3,
    price: 4000,
    description: 'Begin your healing journey',
    features: ['3 NSA sessions', 'Case history form', 'Personalised care plan'],
  },
  {
    key: 'discovery',
    label: 'Discovery',
    sessions: 11,
    price: 12000,
    description: 'The recommended starting package',
    features: ['11 NSA sessions', 'Milestone check-in at session 8', 'Progress tracking', 'Priority scheduling'],
    popular: true,
  },
  {
    key: 'transform',
    label: 'Transform',
    sessions: 16,
    price: 16000,
    description: 'Deeper reorganisation and lasting change',
    features: ['16 NSA sessions', 'Milestone check-ins at sessions 8 & 16', 'Progress tracking', 'Priority scheduling'],
  },
  {
    key: 'full_journey',
    label: 'Full Journey',
    sessions: 24,
    price: 22000,
    description: 'Complete 24-session case study programme',
    features: ['24 NSA sessions', 'Full milestone tracking', 'Case study document', 'Priority scheduling'],
  },
]

interface Payment {
  id: string
  package_type: string
  package_label: string | null
  amount: number
  status: string
  paid_at: string | null
  created_at: string
}

interface Props {
  client: { id: string; full_name: string; email: string | null; is_donation_client?: boolean }
  payments: Payment[]
}

declare global {
  interface Window { Razorpay: any }
}

export function PackagesClient({ client, payments }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePurchase(pkg: typeof PACKAGES[0]) {
    setError(null)
    setSuccess(null)
    setLoading(pkg.key)

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType: pkg.key }),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? 'Failed to initiate payment'); return }

      // Complimentary — no payment needed
      if (data.free) {
        setSuccess(`${pkg.label} package activated! Please contact your practitioner to schedule your session.`)
        return
      }

      // Load Razorpay checkout.js if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.head.appendChild(script)
        })
      }

      const rzp = new window.Razorpay({
        key:          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id:     data.orderId,
        amount:       data.amount,
        currency:     data.currency,
        name:         'Rit-Spanda Wellness Studio',
        description:  data.packageLabel,
        prefill: {
          name:  data.clientName,
          email: data.clientEmail,
        },
        theme: { color: '#0d9488' },
        handler: async (response: any) => {
          // Verify server-side
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            setSuccess(`Payment successful! Your ${pkg.label} package is now active.`)
          } else {
            setError('Payment received but verification failed. Please contact us.')
          }
          setLoading(null)
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      })
      rzp.open()
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
      setLoading(null)
    }
  }

  const isDonation = !!client.is_donation_client
  const paidPackages = payments.filter(p => p.status === 'paid')

  return (
    <div className="space-y-8">
      {/* Donation client notice */}
      {isDonation && (
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4">
          <Heart className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 fill-rose-400" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-rose-800">Your session fees support the Art of Living Foundation</p>
            <p className="text-xs text-rose-600">
              A portion of the fees for your sessions is donated to the Art of Living Foundation.
              Please use the donation link below when making payment.
            </p>
            <a
              href={AOL_DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
            >
              <Heart className="h-4 w-4 fill-white" />
              Donate to Art of Living
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Feedback */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Package cards */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Choose a Package</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PACKAGES.map(pkg => (
            <Card
              key={pkg.key}
              className={`relative overflow-hidden transition-shadow hover:shadow-md ${
                pkg.popular ? 'border-teal-400 ring-1 ring-teal-400' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-teal-600 px-2 py-0.5 text-xs font-medium text-white">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{pkg.label}</CardTitle>
                <p className="text-xs text-slate-500">{pkg.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    {pkg.price === 0 ? 'Free' : `₹${pkg.price.toLocaleString('en-IN')}`}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    {pkg.sessions === 1 ? '1 session' : `${pkg.sessions} sessions`}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isDonation && pkg.price > 0 ? (
                  <a
                    href={AOL_DONATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pkg.popular
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'border border-rose-300 text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    Donate to Art of Living
                  </a>
                ) : (
                  <Button
                    className="w-full"
                    size="sm"
                    variant={pkg.popular ? 'primary' : 'outline'}
                    onClick={() => handlePurchase(pkg)}
                    loading={loading === pkg.key}
                    disabled={!!loading}
                  >
                    {pkg.price === 0 ? 'Book free session' : 'Pay & activate'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment history */}
      {paidPackages.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-3">Payment History</h2>
          <Card>
            <CardContent className="divide-y divide-slate-100 pt-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {p.package_label ?? p.package_type}
                    </p>
                    <p className="text-xs text-slate-400">
                      {p.paid_at ? formatDate(p.paid_at) : formatDate(p.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">
                      {p.amount === 0 ? '—' : `₹${(p.amount / 100).toLocaleString('en-IN')}`}
                    </span>
                    <Badge variant={
                      p.status === 'paid' ? 'success'
                      : p.status === 'failed' ? 'danger'
                      : 'warning'
                    }>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
