import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clientProfile } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (clientProfile) {
    redirect('/portal')
  } else {
    redirect('/dashboard')
  }
}
