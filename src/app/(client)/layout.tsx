import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal-login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-full bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/portal" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-4 4-4 9s4 9 4 9M8 7.5c0 0 2 2 4 4.5s4 4.5 4 4.5" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-slate-900">Meru Chikitsa</span>
          </Link>
          <div className="flex items-center gap-3">
            {client && <span className="text-sm text-slate-600 hidden sm:block">{client.full_name}</span>}
            <form action={signOut}>
              <button type="submit" className="text-xs text-slate-400 hover:text-slate-600">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  )
}
