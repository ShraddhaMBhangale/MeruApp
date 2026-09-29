import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: clients }, { data: recentSessions }, { count: totalSessions }] = await Promise.all([
    supabase.from('clients').select('id, full_name, mobile, nsa_level, case_study_number, created_at').order('created_at', { ascending: false }),
    supabase.from('sessions').select('id, session_number, session_date, status, clients(full_name)').order('session_date', { ascending: false }).limit(5),
    supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  const today = new Date().toISOString().split('T')[0]
  const todaySessions = recentSessions?.filter(s => s.session_date === today) ?? []

  const stats = [
    { label: 'Total Clients', value: clients?.length ?? 0, icon: Users, color: 'text-teal-600' },
    { label: 'Sessions Completed', value: totalSessions ?? 0, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: "Today's Sessions", value: todaySessions.length, icon: ClipboardList, color: 'text-blue-600' },
    { label: 'Forms Pending', value: 0, icon: AlertCircle, color: 'text-amber-600' },
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
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {todaySessions.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No sessions scheduled today</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {todaySessions.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.clients?.full_name}</p>
                      <p className="text-xs text-slate-500">Session #{s.session_number}</p>
                    </div>
                    <Badge variant={s.status === 'completed' ? 'success' : 'info'}>
                      {s.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Clients</CardTitle>
            <Link href="/clients/new" className="text-xs font-medium text-teal-600 hover:text-teal-700">
              + Add client
            </Link>
          </CardHeader>
          <CardContent>
            {!clients?.length ? (
              <p className="text-sm text-slate-500 py-4 text-center">No clients yet</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {clients.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/clients/${c.id}`}
                      className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-1 px-1 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.full_name}</p>
                        <p className="text-xs text-slate-500">{c.mobile}</p>
                      </div>
                      <Badge variant="info">{c.nsa_level}</Badge>
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
