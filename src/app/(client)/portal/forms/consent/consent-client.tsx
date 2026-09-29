'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SignaturePadComponent } from '@/components/forms/signature-pad'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { formatDate, calculateAge } from '@/lib/utils'

const CLAUSES = [
  'I understand that Network Spinal Analysis (NSA) / Reorganisational Healing (ROH) is not a treatment for disease but a system of care that focuses on the reorganisation of the nervous system and spine.',
  'I have been informed that care involves contact with the spine and body, and I understand and consent to this contact.',
  'I understand that results from care vary from person to person and that no specific results can be guaranteed.',
  'I will inform the practitioner of any changes to my health, medications, or other treatments I am receiving.',
  'I understand my financial obligations and agree to pay for services as outlined.',
  'I give permission for my case details to be shared with other practitioners for the purpose of professional consultation, and my identity will be protected.',
  'I understand that I am free to withdraw my consent and discontinue care at any time without prejudice.',
  'I have read and understood all of the above and I give my voluntary consent to receive care at Meru Chikitsa.',
]

interface Props {
  client: any
  existing: any
}

export function ConsentFormClient({ client, existing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(existing?.client_signature ?? null)
  const [researchConsent, setResearchConsent] = useState(existing?.research_consent ?? false)
  const isMinor = client.date_of_birth ? calculateAge(client.date_of_birth) < 18 : false
  const [guardianSig, setGuardianSig] = useState<string | null>(existing?.guardian_signature ?? null)

  const alreadySigned = !!existing?.signed_at

  async function handleSubmit() {
    if (!signature) { setError('Please provide your signature.'); return }
    if (isMinor && !guardianSig) { setError('Guardian signature required for minors.'); return }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        client_id: client.id,
        clauses_accepted: CLAUSES,
        research_consent: researchConsent,
        client_signature: signature,
        guardian_signature: guardianSig,
        signed_at: new Date().toISOString(),
      }
      const { error: err } = existing
        ? await supabase.from('form2_consent').update(payload).eq('id', existing.id)
        : await supabase.from('form2_consent').insert(payload)
      if (err) { setError(err.message); return }
      router.refresh()
    })
  }

  if (alreadySigned) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="font-medium text-slate-900">Consent signed</p>
          <p className="text-sm text-slate-500">Signed on {formatDate(existing.signed_at)}</p>
          {existing.client_signature && (
            <img src={existing.client_signature} alt="Your signature" className="mx-auto h-16 object-contain border border-slate-200 rounded" />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informed Consent Agreement</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Please read each clause carefully before signing.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {CLAUSES.map((clause, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                {i + 1}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed">{clause}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={researchConsent}
              onChange={e => setResearchConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600"
            />
            <span className="text-sm text-slate-700">
              I agree to allow anonymised data from my case to be used for research and educational purposes.
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Signature</CardTitle></CardHeader>
        <CardContent>
          <SignaturePadComponent
            onSave={setSignature}
            existingSignature={signature ?? undefined}
          />
        </CardContent>
      </Card>

      {isMinor && (
        <Card>
          <CardHeader>
            <CardTitle>Guardian Signature</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Required as client is under 18</p>
          </CardHeader>
          <CardContent>
            <SignaturePadComponent
              onSave={setGuardianSig}
              existingSignature={guardianSig ?? undefined}
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button onClick={handleSubmit} loading={isPending} size="lg">
        Submit consent
      </Button>
    </div>
  )
}
