import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PackagesClient } from './packages-client'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal-login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name, email')
    .eq('user_id', user.id)
    .single()
  if (!client) redirect('/portal')

  const { data: payments } = await supabase
    .from('payments')
    .select('id, package_type, package_label, amount, status, paid_at, created_at')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Packages &amp; Payments</h1>
      </div>
      <PackagesClient client={client} payments={payments ?? []} />
    </div>
  )
}
