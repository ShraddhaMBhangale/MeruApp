import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from './calendar-client'

export default async function CalendarPage() {
  const supabase = await createClient()

  // Fetch sessions for ±2 months window — client will filter by month
  const from = new Date()
  from.setMonth(from.getMonth() - 1)
  const to = new Date()
  to.setMonth(to.getMonth() + 3)

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, session_number, session_date, session_time, duration_minutes, status, client_id, clients(id, full_name)')
    .gte('session_date', from.toISOString().split('T')[0])
    .lte('session_date', to.toISOString().split('T')[0])
    .order('session_date')
    .order('session_time', { nullsFirst: true })

  return <CalendarClient sessions={sessions ?? []} />
}
