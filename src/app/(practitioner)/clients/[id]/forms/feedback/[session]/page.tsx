import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Form5FeedbackClient } from './form5-client'

export default async function FeedbackFormPage({
  params,
}: {
  params: Promise<{ id: string; session: string }>
}) {
  const { id, session } = await params
  const sessionNum = Number(session)
  if (![0, 8, 16, 24].includes(sessionNum)) notFound()

  const supabase = await createClient()
  const [{ data: client }, { data: existing }] = await Promise.all([
    supabase.from('clients').select('id, full_name').eq('id', id).single(),
    supabase
      .from('form5_feedback')
      .select('*')
      .eq('client_id', id)
      .eq('session_number', sessionNum)
      .single(),
  ])

  if (!client) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/clients/${id}`} className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Form 5 — Milestone Feedback (Session {sessionNum})
          </h1>
          <p className="text-sm text-slate-500">{client.full_name}</p>
        </div>
      </div>
      <Form5FeedbackClient client={client} existing={existing} sessionNum={sessionNum as 0 | 8 | 16 | 24} />
    </div>
  )
}
