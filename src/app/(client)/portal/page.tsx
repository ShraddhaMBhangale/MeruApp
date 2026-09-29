import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, Clock, FileText, ChevronRight } from 'lucide-react'
import { formatDate, calculateAge } from '@/lib/utils'

export default async function PortalHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal-login')

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-slate-600">Your profile has not been created yet.</p>
        <p className="text-sm text-slate-400">Please contact your practitioner.</p>
      </div>
    )
  }

  const [{ data: sessions }, { data: form2 }, { data: form3 }] = await Promise.all([
    supabase.from('sessions').select('*').eq('client_id', client.id).order('session_number'),
    supabase.from('form2_consent').select('id, signed_at').eq('client_id', client.id).single(),
    supabase.from('form3_case_history').select('id, filled_at').eq('client_id', client.id).single(),
  ])

  const completedSessions = sessions?.filter(s => s.status === 'completed').length ?? 0
  const totalSessions = sessions?.length ?? 0
  const progressPct = Math.round((completedSessions / 24) * 100)

  const milestones = [0, 8, 16, 24]
  const feedbackDue = milestones.filter(m => completedSessions >= m)

  const nsaBadgeVariant = client.nsa_level === 'Level 1' ? 'info' : client.nsa_level === 'Level 2' ? 'warning' : 'success'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {client.full_name.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Case Study No. {client.case_study_number}</p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Session Progress</CardTitle>
            <Badge variant={nsaBadgeVariant as any}>{client.nsa_level ?? 'Unassigned'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{completedSessions} of 24 sessions completed</span>
            <span className="font-medium text-teal-600">{progressPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full bg-teal-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            {[0, 8, 16, 24].map(m => (
              <span key={m} className={completedSessions >= m ? 'text-teal-600 font-medium' : ''}>
                {m === 0 ? 'Start' : `S${m}`}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forms */}
      <Card>
        <CardHeader><CardTitle>Your Forms</CardTitle></CardHeader>
        <CardContent className="divide-y divide-slate-100">
          {/* Form 2 — Consent */}
          <Link href="/portal/forms/consent" className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 transition-colors">
            <div className="flex items-center gap-3">
              {form2?.signed_at
                ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                : <Clock className="h-5 w-5 text-amber-400 shrink-0" />}
              <div>
                <p className="text-sm font-medium text-slate-900">Form 2 — Consent</p>
                <p className="text-xs text-slate-500">
                  {form2?.signed_at ? `Signed on ${formatDate(form2.signed_at)}` : 'Pending your signature'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </Link>

          {/* Form 3 — Case History */}
          <Link href="/portal/forms/history" className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 transition-colors">
            <div className="flex items-center gap-3">
              {form3?.filled_at
                ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                : <Clock className="h-5 w-5 text-amber-400 shrink-0" />}
              <div>
                <p className="text-sm font-medium text-slate-900">Form 3 — Case History</p>
                <p className="text-xs text-slate-500">
                  {form3?.filled_at ? `Filled on ${formatDate(form3.filled_at)}` : 'Share your health background'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </Link>

          {/* Form 5 milestones */}
          {feedbackDue.map(m => (
            <Link key={m} href={`/portal/forms/feedback/${m}`} className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Form 5 — Milestone Feedback</p>
                  <p className="text-xs text-slate-500">Session {m} check-in</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Recent sessions */}
      {sessions && sessions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Sessions</CardTitle></CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {sessions.slice(-5).reverse().map(s => (
              <div key={s.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-700">Session #{s.session_number}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatDate(s.session_date)}</span>
                  <Badge variant={s.status === 'completed' ? 'success' : 'warning'}>
                    {s.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Profile summary */}
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Email</dt>
              <dd className="text-slate-700 mt-0.5">{client.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Age</dt>
              <dd className="text-slate-700 mt-0.5">{client.date_of_birth ? `${calculateAge(client.date_of_birth)} yrs` : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Gender</dt>
              <dd className="text-slate-700 mt-0.5 capitalize">{client.gender ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Occupation</dt>
              <dd className="text-slate-700 mt-0.5">{client.occupation ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
