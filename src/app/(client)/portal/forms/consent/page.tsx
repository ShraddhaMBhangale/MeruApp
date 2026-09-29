import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { ConsentFormClient } from './consent-client'

export default async function ClientConsentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal-login')

  const [{ data: client }, ] = await Promise.all([
    supabase.from('clients').select('*').eq('user_id', user.id).single(),
  ])

  if (!client) redirect('/portal')

  const { data: existing } = await supabase
    .from('form2_consent')
    .select('*')
    .eq('client_id', client.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Form 2 — Consent</h1>
      </div>
      <ConsentFormClient client={client} existing={existing} />
    </div>
  )
}
