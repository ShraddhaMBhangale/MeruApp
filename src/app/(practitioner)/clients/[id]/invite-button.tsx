'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { sendPortalInvite } from '@/app/actions/clients'
import { Send, CheckCircle2 } from 'lucide-react'

export function InviteButton({ clientId, hasEmail, alreadyLinked }: {
  clientId: string
  hasEmail: boolean
  alreadyLinked: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (alreadyLinked) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Portal access active
      </div>
    )
  }

  if (!hasEmail) {
    return <p className="text-xs text-slate-400">Add email to enable portal invite</p>
  }

  function handleInvite() {
    setError(null)
    startTransition(async () => {
      const result = await sendPortalInvite(clientId)
      if (result?.error) setError(result.error)
      else setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Invite sent — client will receive a sign-in code
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Button size="sm" variant="outline" onClick={handleInvite} loading={isPending}>
        <Send className="h-3.5 w-3.5" />
        Send portal invite
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
