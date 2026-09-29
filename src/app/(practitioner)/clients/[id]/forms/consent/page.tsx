import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Form2ConsentClient } from './form2-client'

export default async function ConsentFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: existing }] = await Promise.all([
    supabase.from('clients').select('id, full_name, date_of_birth').eq('id', id).single(),
    supabase.from('form2_consent').select('*').eq('client_id', id).single(),
  ])

  if (!client) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/clients/${id}`} className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Form 2 — Informed Consent & Waiver</h1>
          <p className="text-sm text-slate-500">{client.full_name}</p>
        </div>
      </div>
      <Form2ConsentClient client={client} existing={existing} />
    </div>
  )
}
