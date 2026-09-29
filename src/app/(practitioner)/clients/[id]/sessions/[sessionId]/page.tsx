import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Form4SessionClient } from './form4-client'

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>
}) {
  const { id, sessionId } = await params
  const supabase = await createClient()

  const [{ data: session }, { data: client }, { data: existing }] = await Promise.all([
    supabase.from('sessions').select('*').eq('id', sessionId).single(),
    supabase.from('clients').select('id, full_name, nsa_level').eq('id', id).single(),
    supabase.from('form4_sessions').select('*').eq('session_id', sessionId).single(),
  ])

  if (!session || !client) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/clients/${id}`} className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Form 4 — Session #{session.session_number}
          </h1>
          <p className="text-sm text-slate-500">{client.full_name}</p>
        </div>
      </div>
      <Form4SessionClient session={session} client={client} existing={existing} />
    </div>
  )
}
