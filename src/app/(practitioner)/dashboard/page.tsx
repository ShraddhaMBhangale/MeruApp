import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, ClipboardList, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

function fmt12(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h < 12 ? 'am' : 'pm'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [{ data: clients }, { data: todaySessions }, { data: upcomingSessions }, { count: totalSessions }] = await Promise.all([
    supabase.from('clients').select('id, full_name, mobile, nsa_level, case_study_number, created_at').order('created_at', { ascending: false }),
    supabase.from('sessions').select('id, session_number, session_date, session_time, duration_minutes, status, client_id, clients(full_name)').eq('session_date', today).order('session_time', { nullsFirst: true }),
    supabase.from('sessions').select('id, session_number, session_date, session_time, status, client_id, clients(full_name)').gt('session_date', today).eq('status', 'scheduled').order('session_date').order('session_time', { nullsFirst: true }).limit(5),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  const stats = [
    { label: 'Total Clients', value: clients?.length ?? 0, icon: Users, color: 'text-teal-600' },
    { label: 'Sessions Completed', value: totalSessions ?? 0, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: "Today's Sessions", value: todaySessions?.length ?? 0, icon: ClipboardList, color: 'text-blue-600' },
    { label: 'Upcoming', value: upcomingSessions?.length ?? 0, icon: AlertCircle, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning</h1>
        <p className="text-sm text-slate-500 mt-1">{formatDate(new Date())}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <Link href="/calendar" className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />Calendar
            </Link>
          </CardHeader>
          <CardContent>
            {!todaySessions?.length ? (
              <p className="text-sm text-slate-500 py-4 text-center">No sessions today</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {todaySessions.map((s: any) => (
                  <li key={s.id}>
                    <Link
                      href={`/clients/${s.client_id}/sessions/${s.id}`}
                      className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-1 px-1 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.clients?.full_name}</p>
                        <p className="text-xs text-slate-500">
                          Session #{s.session_number}
                          {s.session_time && ` · ${fmt12(s.session_time)}`}
                          {s.duration_minutes && ` · ${s.duration_minutes} min`}
                        </p>
                      </div>
                      <Badge variant={s.status === 'completed' ? 'success' : 'info'}>
                        {s.status}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming</CardTitle>
            <Link href="/clients/new" className="text-xs font-medium text-teal-600 hover:text-teal-700">
              + Add client
            </Link>
          </CardHeader>
          <CardContent>
            {!upcomingSessions?.length ? (
              <p className="text-sm text-slate-500 py-4 text-center">No upcoming sessions</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcomingSessions.map((s: any) => (
                  <li key={s.id}>
                    <Link
                      href={`/clients/${s.client_id}/sessions/${s.id}`}
                      className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-1 px-1 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.clients?.full_name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(s.session_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {s.session_time && ` · ${fmt12(s.session_time)}`}
                        </p>
                      </div>
                      <Badge variant="info">#{s.session_number}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
