import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Form1EnquiryClient } from './form1-client'

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: existing }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, full_name, mobile, email, date_of_birth, gender, address, blood_group, occupation, marital_status, referral_source, referred_by_name, had_sessions_before, previous_sessions_count, nsa_level')
      .eq('id', id)
      .single(),
    supabase.from('form1_enquiry').select('*').eq('client_id', id).single(),
  ])

  if (!client) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/clients/${id}`} className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Form 1 — Initial Enquiry</h1>
          <p className="text-sm text-slate-500">{client.full_name} · Pre-intake assessment</p>
        </div>
      </div>
      <Form1EnquiryClient client={client} existing={existing} />
    </div>
  )
}
