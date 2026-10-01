import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, calculateAge, getInitials } from '@/lib/utils'
import Link from 'next/link'
import { ChevronLeft, Plus, FileText, CheckCircle2, Clock } from 'lucide-react'
import type { Session } from '@/types/database'

const formLinks = [
  { id: 'form1', label: 'Form 1 — Initial Enquiry', href: (id: string) => `/clients/${id}/forms/enquiry` },
  { id: 'form2', label: 'Form 2 — Informed Consent', href: (id: string) => `/clients/${id}/forms/consent` },
  { id: 'form3', label: 'Form 3 — Case History', href: (id: string) => `/clients/${id}/forms/history` },
  { id: 'form5-0', label: 'Form 5 — Milestone (Session 0)', href: (id: string) => `/clients/${id}/forms/feedback/0` },
  { id: 'form5-8', label: 'Form 5 — Milestone (Session 8)', href: (id: string) => `/clients/${id}/forms/feedback/8` },
  { id: 'form5-16', label: 'Form 5 — Milestone (Session 16)', href: (id: string) => `/clients/${id}/forms/feedback/16` },
  { id: 'form5-24', label: 'Form 5 — Milestone (Session 24)', href: (id: string) => `/clients/${id}/forms/feedback/24` },
]

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: sessions }, { data: enquiry }, { data: consent }, { data: caseHistory }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('sessions').select('*').eq('client_id', id).order('session_number'),
    supabase.from('form1_enquiry').select('id, filled_at').eq('client_id', id).single(),
    supabase.from('form2_consent').select('id, signed_at').eq('client_id', id).single(),
    supabase.from('form3_case_history').select('id, client_declaration_signed_at').eq('client_id', id).single(),
  ])

  if (!client) notFound()

  const completedSessions = sessions?.filter((s: Session) => s.status === 'completed').length ?? 0
  const totalSessions = sessions?.length ?? 0
  const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/clients" className="mt-1 text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-700">
              {getInitials(client.full_name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 truncate">{client.full_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="info">{client.nsa_level}</Badge>
                {client.case_study_number && (
                  <span className="text-xs text-slate-400">{client.case_study_number}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <Link href={`/clients/${id}/sessions/new`}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New session
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session progress */}
          <Card>
            <CardHeader><CardTitle>Session Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{completedSessions} of 24 sessions completed</span>
                  <span className="font-semibold text-teal-700">{Math.round((completedSessions / 24) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-teal-500 transition-all"
                    style={{ width: `${(completedSessions / 24) * 100}%` }}
                  />
                </div>
                <div className="flex gap-6 text-xs text-slate-500">
                  <span>Session 8 {completedSessions >= 8 ? '✓' : '—'}</span>
                  <span>Session 16 {completedSessions >= 16 ? '✓' : '—'}</span>
                  <span>Session 24 {completedSessions >= 24 ? '✓' : '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sessions ({totalSessions})</CardTitle>
              <Link href={`/clients/${id}/sessions/new`}>
                <Button size="sm" variant="outline"><Plus className="h-3 w-3" />Add</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!sessions?.length ? (
                <p className="text-sm text-slate-500 py-4 text-center">No sessions recorded yet</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {sessions.map((s: Session) => (
                    <li key={s.id}>
                      <Link
                        href={`/clients/${id}/sessions/${s.id}`}
                        className="flex items-center gap-3 py-3 hover:bg-slate-50 -mx-1 px-1 rounded transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {s.session_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">Session #{s.session_number}</p>
                          <p className="text-xs text-slate-500">{formatDate(s.session_date)}</p>
                        </div>
                        <Badge variant={s.status === 'completed' ? 'success' : s.status === 'cancelled' ? 'danger' : 'info'}>
                          {s.status}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Personal info */}
          <Card>
            <CardHeader><CardTitle>Personal</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {age && <Row label="Age" value={`${age} years`} />}
              {client.gender && <Row label="Gender" value={client.gender} />}
              {client.blood_group && <Row label="Blood group" value={client.blood_group} />}
              <Row label="Mobile" value={client.mobile} />
              {client.email && <Row label="Email" value={client.email} />}
              {client.occupation && <Row label="Occupation" value={client.occupation} />}
              {client.referral_source && <Row label="Referred by" value={client.referral_source} />}
              <Row label="Member since" value={formatDate(client.created_at)} />
            </CardContent>
          </Card>

          {/* Forms status */}
          <Card>
            <CardHeader><CardTitle>Forms</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {formLinks.map((f) => {
                const filled =
                  f.id === 'form1' ? !!enquiry?.filled_at :
                  f.id === 'form2' ? !!consent?.signed_at :
                  f.id === 'form3' ? !!caseHistory?.client_declaration_signed_at :
                  false
                return (
                  <Link
                    key={f.id}
                    href={f.href(id)}
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-50 transition-colors"
                  >
                    {filled
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      : <Clock className="h-4 w-4 text-slate-300 flex-shrink-0" />
                    }
                    <span className="text-xs text-slate-700 truncate">{f.label}</span>
                  </Link>
                )
              })}
            </CardContent>
          </Card>

          {/* Contraindications */}
          {client.contraindications && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">⚠ Contraindications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{client.contraindications}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right truncate">{value}</span>
    </div>
  )
}
