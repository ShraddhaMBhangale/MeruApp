'use client'

import { useState, useTransition } from 'react'
import { SignaturePadComponent } from '@/components/forms/signature-pad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

const CONSENT_CLAUSES = [
  'I understand that Meru Chikitsa is a non-invasive, awareness-based spinal wellness practice rooted in Network Spinal Analysis (NSA) and Somato Respiratory Integration (SRI).',
  'I understand that Meru Chikitsa is not a medical treatment and does not diagnose, treat, cure, or prevent any disease or medical condition.',
  'I consent to the practitioner applying gentle contacts to my spinal gateways (cervical and sacral regions) as part of the entrainment process.',
  'I acknowledge that I have disclosed all relevant medical history, medications, and conditions to the practitioner.',
  'I understand that I may experience emotional releases, spontaneous movement, increased body awareness, or temporary discomfort during or after a session.',
  'I agree to inform the practitioner immediately if I experience any discomfort, pain, or adverse effects during a session.',
  'I understand that the results of Meru Chikitsa vary between individuals and that no specific outcome can be guaranteed.',
  'I take full responsibility for my health decisions and consent to receiving Meru Chikitsa sessions voluntarily.',
]

interface Props {
  client: { id: string; full_name: string; date_of_birth: string | null }
  existing: any
}

export function Form2ConsentClient({ client, existing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [signature, setSignature] = useState<string | null>(existing?.signature_data ?? null)
  const [guardianName, setGuardianName] = useState(existing?.guardian_name ?? '')
  const [guardianRel, setGuardianRel] = useState(existing?.guardian_relationship ?? '')
  const [researchConsent, setResearchConsent] = useState(existing?.research_consent ?? false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(!!existing?.signed_at)

  const isMinor = client.date_of_birth
    ? new Date().getFullYear() - new Date(client.date_of_birth).getFullYear() < 18
    : false

  async function handleSave() {
    if (!signature) { setError('Please provide a signature before saving.'); return }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        client_id: client.id,
        signature_data: signature,
        guardian_name: guardianName || null,
        guardian_relationship: guardianRel || null,
        research_consent: researchConsent,
        signed_at: new Date().toISOString(),
      }
      const { error: err } = existing
        ? await supabase.from('form2_consent').update(payload).eq('id', existing.id)
        : await supabase.from('form2_consent').insert(payload)
      if (err) { setError(err.message); return }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Signed on {existing?.signed_at ? formatDate(existing.signed_at) : 'just now'}
        </div>
      )}

      {/* Consent clauses */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <p className="text-sm font-semibold text-slate-700">Meru Chikitsa — Informed Consent & Waiver</p>
          <p className="text-sm text-slate-600">
            I, <strong>{client.full_name}</strong>, voluntarily agree to the following:
          </p>
          <ol className="space-y-3">
            {CONSENT_CLAUSES.map((clause, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600">
                <span className="flex-shrink-0 font-semibold text-teal-700">{i + 1}.</span>
                <span>{clause}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Minor section */}
      {isMinor && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 space-y-3">
            <p className="text-sm font-semibold text-amber-800">Guardian / Parent Details (Minor Client)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="guardian_name">Guardian name</Label>
                <Input id="guardian_name" value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guardian_rel">Relationship</Label>
                <Input id="guardian_rel" value={guardianRel} onChange={e => setGuardianRel(e.target.value)} placeholder="e.g. Mother" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research consent */}
      <Card>
        <CardContent className="pt-5 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Research & Case Study Consent</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={researchConsent}
              onChange={e => setResearchConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-teal-600"
            />
            <span className="text-sm text-slate-600">
              I consent to my de-identified data being used for research and case study documentation purposes under the Meru Chikitsa / Sri Sri Tattva programme.
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            {isMinor ? 'Guardian Signature' : 'Client Signature'}
          </p>
          <SignaturePadComponent
            onSave={setSignature}
            existingSignature={existing?.signature_data}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button onClick={handleSave} loading={isPending} size="lg">
        {saved ? 'Update consent record' : 'Save & sign consent'}
      </Button>
    </div>
  )
}
