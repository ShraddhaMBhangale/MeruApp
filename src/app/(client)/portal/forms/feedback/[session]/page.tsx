import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Form5FeedbackClient } from '@/app/(practitioner)/clients/[id]/forms/feedback/[session]/form5-client'

export default async function ClientFeedbackPage({
  params,
}: {
  params: Promise<{ session: string }>
}) {
  const { session } = await params
  const sessionNum = Number(session)
  if (![0, 8, 16, 24].includes(sessionNum)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal-login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  if (!client) redirect('/portal')

  const { data: existing } = await supabase
    .from('form5_feedback')
    .select('*')
    .eq('client_id', client.id)
    .eq('session_number', sessionNum)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">
          Form 5 — Milestone Feedback (Session {sessionNum})
        </h1>
      </div>
      <Form5FeedbackClient
        client={client}
        existing={existing}
        sessionNum={sessionNum as 0 | 8 | 16 | 24}
      />
    </div>
  )
}
