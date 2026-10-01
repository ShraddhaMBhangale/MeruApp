'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, User, ClipboardList, Leaf, Target, Check } from 'lucide-react'
import { calculateAge, formatDate } from '@/lib/utils'

const PACKAGES = [
  'Free discovery session',
  '1 session',
  '3 sessions',
  '11 sessions',
  '16 sessions',
  '24 sessions (Case Study)',
  'Custom / Unsure',
]

const REFERRAL_SOURCES = [
  'Friend or family',
  'Existing client',
  'Instagram / Social media',
  'Google search',
  'Workshop / Event',
  'Doctor / Therapist',
  'Other',
]

type Client = {
  id: string
  full_name: string
  mobile: string
  email: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  blood_group: string | null
  occupation: string | null
  marital_status: string | null
  referral_source: string | null
  referred_by_name: string | null
  had_sessions_before: boolean
  previous_sessions_count: number | null
  nsa_level: string | null
}

interface Props {
  client: Client
  existing: any
}

export function Form1EnquiryClient({ client, existing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(!!existing?.filled_at)

  // ── Personal edits (written to clients table) ─────────────────────────────
  const [personal, setPersonal] = useState({
    marital_status: client.marital_status ?? '',
    referral_source: client.referral_source ?? '',
    referred_by_name: client.referred_by_name ?? '',
  })

  // ── Enquiry tab ───────────────────────────────────────────────────────────
  const [enquiry, setEnquiry] = useState({
    presenting_concern: existing?.presenting_concern ?? '',
    concern_duration: existing?.concern_duration ?? '',
    prior_therapies: existing?.prior_therapies ?? '',
    current_medications: existing?.current_medications ?? '',
    known_allergies: existing?.known_allergies ?? '',
  })

  // ── NSA background tab ────────────────────────────────────────────────────
  const [nsa, setNsa] = useState({
    nsa_prior_details: existing?.nsa_prior_details ?? '',
    nsa_knowledge: existing?.nsa_knowledge ?? '',
  })

  // ── Goals tab ─────────────────────────────────────────────────────────────
  const [goals, setGoals] = useState({
    health_goals: existing?.health_goals ?? '',
    package_interest: existing?.package_interest ?? '',
    preferred_contact: (existing?.preferred_contact as string[]) ?? [],
    whatsapp_consent: existing?.whatsapp_consent ?? false,
    practitioner_notes: existing?.practitioner_notes ?? '',
  })

  function toggleContact(method: string) {
    setGoals(prev => ({
      ...prev,
      preferred_contact: prev.preferred_contact.includes(method)
        ? prev.preferred_contact.filter(m => m !== method)
        : [...prev.preferred_contact, method],
    }))
  }

  async function handleSave(markComplete: boolean) {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()

      // Update clients table personal fields
      const { error: clientErr } = await supabase
        .from('clients')
        .update({
          marital_status: personal.marital_status || null,
          referral_source: personal.referral_source || null,
          referred_by_name: personal.referred_by_name || null,
        })
        .eq('id', client.id)

      if (clientErr) { setError(clientErr.message); return }

      const payload = {
        client_id: client.id,
        presenting_concern: enquiry.presenting_concern || null,
        concern_duration: enquiry.concern_duration || null,
        prior_therapies: enquiry.prior_therapies || null,
        current_medications: enquiry.current_medications || null,
        known_allergies: enquiry.known_allergies || null,
        nsa_prior_details: nsa.nsa_prior_details || null,
        nsa_knowledge: nsa.nsa_knowledge || null,
        health_goals: goals.health_goals || null,
        package_interest: goals.package_interest || null,
        preferred_contact: goals.preferred_contact.length > 0 ? goals.preferred_contact : null,
        whatsapp_consent: goals.whatsapp_consent,
        practitioner_notes: goals.practitioner_notes || null,
        enquiry_date: new Date().toISOString().split('T')[0],
        ...(markComplete ? { filled_at: new Date().toISOString() } : {}),
      }

      const { error: formErr } = await supabase
        .from('form1_enquiry')
        .upsert(payload, { onConflict: 'client_id' })

      if (formErr) { setError(formErr.message); return }

      if (markComplete) setSaved(true)
      router.refresh()
    })
  }

  const age = client.date_of_birth ? calculateAge(client.date_of_birth) : null

  if (saved) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <div>
            <p className="text-lg font-semibold text-slate-900">Initial enquiry recorded</p>
            <p className="text-sm text-slate-500 mt-1">
              Completed on {formatDate(existing?.filled_at ?? new Date().toISOString())}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSaved(false)}>Edit form</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="personal" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="personal" className="flex items-center gap-1.5 text-xs">
          <User className="h-3.5 w-3.5" />Personal
        </TabsTrigger>
        <TabsTrigger value="enquiry" className="flex items-center gap-1.5 text-xs">
          <ClipboardList className="h-3.5 w-3.5" />Concern
        </TabsTrigger>
        <TabsTrigger value="nsa" className="flex items-center gap-1.5 text-xs">
          <Leaf className="h-3.5 w-3.5" />NSA Bg.
        </TabsTrigger>
        <TabsTrigger value="goals" className="flex items-center gap-1.5 text-xs">
          <Target className="h-3.5 w-3.5" />Goals
        </TabsTrigger>
        <TabsTrigger value="complete" className="flex items-center gap-1.5 text-xs">
          <Check className="h-3.5 w-3.5" />Complete
        </TabsTrigger>
      </TabsList>

      {/* ── TAB 1: PERSONAL ─────────────────────────────────────────────────── */}
      <TabsContent value="personal">
        <Card>
          <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {/* Read-only profile summary */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 grid gap-3 sm:grid-cols-2 text-sm">
              <InfoRow label="Full name" value={client.full_name} />
              <InfoRow label="Mobile" value={client.mobile} />
              {client.email && <InfoRow label="Email" value={client.email} />}
              {age && <InfoRow label="Age" value={`${age} years`} />}
              {client.date_of_birth && <InfoRow label="Date of birth" value={formatDate(client.date_of_birth)} />}
              {client.gender && <InfoRow label="Gender" value={client.gender} />}
              {client.blood_group && <InfoRow label="Blood group" value={client.blood_group} />}
              {client.occupation && <InfoRow label="Occupation" value={client.occupation} />}
              {client.address && <InfoRow label="Address" value={client.address} />}
            </div>

            <p className="text-xs text-slate-400">
              To update name, mobile or date of birth, use Edit Profile on the client record.
            </p>

            {/* Editable fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="marital_status">Marital status</Label>
                <select
                  id="marital_status"
                  value={personal.marital_status}
                  onChange={e => setPersonal(p => ({ ...p, marital_status: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select…</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="referral_source">How did they hear about us?</Label>
                <select
                  id="referral_source"
                  value={personal.referral_source}
                  onChange={e => setPersonal(p => ({ ...p, referral_source: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select…</option>
                  {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {(personal.referral_source === 'Friend or family' ||
              personal.referral_source === 'Existing client' ||
              personal.referral_source === 'Doctor / Therapist') && (
              <div className="space-y-1.5">
                <Label htmlFor="referred_by_name">Referred by (name)</Label>
                <Input
                  id="referred_by_name"
                  value={personal.referred_by_name}
                  onChange={e => setPersonal(p => ({ ...p, referred_by_name: e.target.value }))}
                  placeholder="Name of person who referred"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── TAB 2: PRESENTING CONCERN ────────────────────────────────────────── */}
      <TabsContent value="enquiry">
        <Card>
          <CardHeader><CardTitle>Presenting Concern</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="presenting_concern">Primary reason for seeking NSA / Meru Chikitsa</Label>
              <Textarea
                id="presenting_concern"
                rows={3}
                value={enquiry.presenting_concern}
                onChange={e => setEnquiry(q => ({ ...q, presenting_concern: e.target.value }))}
                placeholder="What is the main concern or symptom bringing them here?"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="concern_duration">How long has this been a concern?</Label>
              <Input
                id="concern_duration"
                value={enquiry.concern_duration}
                onChange={e => setEnquiry(q => ({ ...q, concern_duration: e.target.value }))}
                placeholder="e.g. 3 years, since childhood, last 6 months…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prior_therapies">Other therapies / treatments tried</Label>
              <Textarea
                id="prior_therapies"
                rows={2}
                value={enquiry.prior_therapies}
                onChange={e => setEnquiry(q => ({ ...q, prior_therapies: e.target.value }))}
                placeholder="Physiotherapy, Ayurveda, medicines, surgery, etc."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="current_medications">Current medications</Label>
                <Textarea
                  id="current_medications"
                  rows={2}
                  value={enquiry.current_medications}
                  onChange={e => setEnquiry(q => ({ ...q, current_medications: e.target.value }))}
                  placeholder="List any ongoing prescriptions or supplements"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="known_allergies">Known allergies</Label>
                <Textarea
                  id="known_allergies"
                  rows={2}
                  value={enquiry.known_allergies}
                  onChange={e => setEnquiry(q => ({ ...q, known_allergies: e.target.value }))}
                  placeholder="Food, environmental, drug allergies…"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── TAB 3: NSA BACKGROUND ────────────────────────────────────────────── */}
      <TabsContent value="nsa">
        <Card>
          <CardHeader><CardTitle>NSA Background</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Had NSA sessions before?</span>
                <span className={`font-semibold ${client.had_sessions_before ? 'text-teal-700' : 'text-slate-500'}`}>
                  {client.had_sessions_before ? `Yes — ${client.previous_sessions_count ?? '?'} sessions` : 'No'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                This is set on the client profile. Use the fields below to record details.
              </p>
            </div>

            {client.had_sessions_before && (
              <div className="space-y-1.5">
                <Label htmlFor="nsa_prior_details">Details of previous NSA experience</Label>
                <Textarea
                  id="nsa_prior_details"
                  rows={3}
                  value={nsa.nsa_prior_details}
                  onChange={e => setNsa(n => ({ ...n, nsa_prior_details: e.target.value }))}
                  placeholder="With whom, when, how many sessions, what level, outcomes…"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="nsa_knowledge">What do they know about NSA / SRI?</Label>
              <Textarea
                id="nsa_knowledge"
                rows={3}
                value={nsa.nsa_knowledge}
                onChange={e => setNsa(n => ({ ...n, nsa_knowledge: e.target.value }))}
                placeholder="Their understanding, expectations, or misconceptions about the work…"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── TAB 4: GOALS & PACKAGE ───────────────────────────────────────────── */}
      <TabsContent value="goals">
        <Card>
          <CardHeader><CardTitle>Goals, Package & Communication</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="health_goals">What does the client hope to achieve?</Label>
              <Textarea
                id="health_goals"
                rows={3}
                value={goals.health_goals}
                onChange={e => setGoals(g => ({ ...g, health_goals: e.target.value }))}
                placeholder="Health goals, life goals, what wellness means to them…"
              />
            </div>

            <div className="space-y-2">
              <Label>Package they are considering</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PACKAGES.map(pkg => (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => setGoals(g => ({ ...g, package_interest: pkg }))}
                    className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-colors ${
                      goals.package_interest === pkg
                        ? 'border-teal-500 bg-teal-50 text-teal-800 font-medium'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred contact method</Label>
              <div className="flex gap-3">
                {['WhatsApp', 'SMS', 'Email', 'Call'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleContact(method)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                      goals.preferred_contact.includes(method)
                        ? 'border-teal-500 bg-teal-50 text-teal-800 font-medium'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={goals.whatsapp_consent}
                onChange={e => setGoals(g => ({ ...g, whatsapp_consent: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-teal-600"
              />
              <span className="text-sm text-slate-700">
                Client consents to receive session reminders and wellness updates via WhatsApp / SMS
              </span>
            </label>

            <div className="space-y-1.5">
              <Label htmlFor="practitioner_notes">Practitioner notes (private)</Label>
              <Textarea
                id="practitioner_notes"
                rows={3}
                value={goals.practitioner_notes}
                onChange={e => setGoals(g => ({ ...g, practitioner_notes: e.target.value }))}
                placeholder="Observations from the enquiry call — tone, readiness, concerns to follow up…"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── TAB 5: COMPLETE ──────────────────────────────────────────────────── */}
      <TabsContent value="complete">
        <Card>
          <CardHeader><CardTitle>Review & Complete</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-sm">
              <SummaryRow label="Primary concern" value={enquiry.presenting_concern} />
              <SummaryRow label="Duration" value={enquiry.concern_duration} />
              <SummaryRow label="Prior therapies" value={enquiry.prior_therapies} />
              <SummaryRow label="Medications" value={enquiry.current_medications} />
              <SummaryRow label="Allergies" value={enquiry.known_allergies} />
              <SummaryRow label="NSA background" value={nsa.nsa_prior_details || nsa.nsa_knowledge} />
              <SummaryRow label="Health goals" value={goals.health_goals} />
              <SummaryRow label="Package interest" value={goals.package_interest} />
              <SummaryRow label="Contact preference" value={goals.preferred_contact.join(', ')} />
              <SummaryRow label="How they heard" value={[personal.referral_source, personal.referred_by_name].filter(Boolean).join(' — ')} />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                loading={isPending}
              >
                Save draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                loading={isPending}
                className="flex-1"
              >
                Mark complete
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-3 px-4 py-2.5">
      <span className="w-36 flex-shrink-0 text-slate-400">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  )
}
