import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/components/home/landing-page'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: clientProfile } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()
    redirect(clientProfile ? '/portal' : '/dashboard')
  }

  return <LandingPage />
}
