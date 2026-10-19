'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'

export function DonationToggle({ clientId, initial }: { clientId: string; initial: boolean }) {
  const [isDonation, setIsDonation] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next = !isDonation
    setIsDonation(next)
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('clients').update({ is_donation_client: next }).eq('id', clientId)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      title={isDonation ? 'Marked as donation client — payments go to Art of Living' : 'Mark as donation client'}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        isDonation
          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      <Heart className={`h-3.5 w-3.5 ${isDonation ? 'fill-rose-500 text-rose-500' : ''}`} />
      {isDonation ? 'Donation client' : 'Mark as donation'}
    </button>
  )
}
