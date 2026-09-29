import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'
import { UserPlus, Search } from 'lucide-react'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, mobile, email, nsa_level, case_study_number, created_at')
    .order('full_name')

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500 mt-1">{clients?.length ?? 0} total</p>
        </div>
        <Link href="/clients/new">
          <Button>
            <UserPlus className="h-4 w-4" />
            New client
          </Button>
        </Link>
      </div>

      {!clients?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
              <UserPlus className="h-6 w-6 text-teal-600" />
            </div>
            <p className="font-medium text-slate-900">No clients yet</p>
            <p className="mt-1 text-sm text-slate-500">Add your first client to get started</p>
            <Link href="/clients/new" className="mt-4 inline-block">
              <Button size="sm">Add first client</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                {getInitials(c.full_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{c.full_name}</p>
                <p className="text-sm text-slate-500">{c.mobile}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="info">{c.nsa_level}</Badge>
                {c.case_study_number && (
                  <span className="hidden sm:block text-xs text-slate-400">{c.case_study_number}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
