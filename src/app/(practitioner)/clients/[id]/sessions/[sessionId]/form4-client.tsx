'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SliderField } from '@/components/ui/slider'
import { BodyDiagram } from '@/components/forms/body-diagram'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Mic } from 'lucide-react'
import type { BodyDotAnnotation, Session } from '@/types/database'

const SRI_STAGES = Array.from({ length: 12 }, (_, i) => i + 1)
const WAVE_TYPES = ['Respiratory', 'Somatopsychic', 'CPG'] as const
const LEG_PATTERNS = ['Cervical', 'Lumbar', 'Sacral'] as const
const NSA_LEVELS = ['Level 1', 'Level 2', 'Level 3'] as const

type TensionKey = 'flexion_l' | 'flexion_r' | 'extension_l' | 'extension_r' | 'inversion_l' | 'inversion_r' | 'eversion_l' | 'eversion_r'

interface Props {
  session: Session
  client: { id: string; full_name: string; nsa_level: string }
  existing: any
}

export function Form4SessionClient({ session, client, existing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(!!existing?.id)
  const [completed, setCompleted] = useState(session.status === 'completed')
  const [error, setError] = useState<string | null>(null)

  const makeTensionDefaults = () => Object.fromEntries(
    ['flexion_l', 'flexion_r', 'extension_l', 'extension_r', 'inversion_l', 'inversion_r', 'eversion_l', 'eversion_r'].map(k => [k, { before: null, during: null, after: null }])
  )

  const [formData, setFormData] = useState({
    neural_tension: existing?.neural_tension ?? makeTensionDefaults(),
    body_diagram_annotations: (existing?.body_diagram_annotations ?? []) as BodyDotAnnotation[],
    neck_passive_before: existing?.neck_passive_before ?? null,
    neck_passive_after: existing?.neck_passive_after ?? null,
    neck_active_before: existing?.neck_active_before ?? null,
    neck_active_after: existing?.neck_active_after ?? null,
    spine_passive_before: existing?.spine_passive_before ?? null,
    spine_passive_after: existing?.spine_passive_after ?? null,
    spine_active_before: existing?.spine_active_before ?? null,
    spine_active_after: existing?.spine_active_after ?? null,
    leg_check: (existing?.leg_check ?? []) as string[],
    general_assessment: existing?.general_assessment ?? {
      energy: { before: 5, after: 5, remarks: '' },
      lightness: { before: 5, after: 5, remarks: '' },
      state_of_mind: { before: 5, after: 5, remarks: '' },
    },
    nsa_level: existing?.nsa_level ?? client.nsa_level,
    sri_stages: (existing?.sri_stages ?? []) as number[],
    wave_types: (existing?.wave_types ?? []) as string[],
    practitioner_observations: existing?.practitioner_observations ?? '',
    client_sharing_before: existing?.client_sharing_before ?? '',
    client_sharing_after: existing?.client_sharing_after ?? '',
    pre_session_energy: existing?.pre_session_energy ?? 5,
  })

  function setField(key: string, value: any) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function toggleArray<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
  }

  function setNeuralTension(key: TensionKey, phase: 'before' | 'during' | 'after', value: number | null) {
    setFormData(prev => ({
      ...prev,
      neural_tension: {
        ...prev.neural_tension,
        [key]: { ...prev.neural_tension[key], [phase]: value }
      }
    }))
  }

  function setGeneralAssessment(metric: string, field: string, value: any) {
    setFormData(prev => ({
      ...prev,
      general_assessment: {
        ...prev.general_assessment,
        [metric]: { ...prev.general_assessment[metric], [field]: value }
      }
    }))
  }

  async function handleSave(markComplete = false) {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()

      const payload = {
        session_id: session.id,
        client_id: client.id,
        ...formData,
      }

      const { error: formErr } = existing
        ? await supabase.from('form4_sessions').update(payload).eq('id', existing.id)
        : await supabase.from('form4_sessions').insert(payload)

      if (formErr) { setError(formErr.message); return }

      if (markComplete) {
        await supabase.from('sessions').update({ status: 'completed' }).eq('id', session.id)
        setCompleted(true)
      }

      setSaved(true)
      router.refresh()
    })
  }

  // Voice-to-text helper
  function startDictation(field: string) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice-to-text not supported in this browser')
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SpeechRecognition()
    rec.lang = 'en-IN'
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setField(field, (formData as any)[field] + (formData as any)[field] ? ' ' + text : text)
    }
    rec.start()
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {completed ? 'Session completed' : 'Saved — session in progress'}
        </div>
      )}

      <Tabs defaultValue="assessment">
        <TabsList className="flex-wrap h-auto gap-y-1">
          <TabsTrigger value="assessment">Neural Tension</TabsTrigger>
          <TabsTrigger value="body">Body Diagram</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
        </TabsList>

        {/* Neural tension */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle>Neural Tension — Heel</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Rate 1 (Softest) → 5 (Hardest)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                      <th className="py-2 pr-3 font-medium">Measure</th>
                      <th className="py-2 px-2 font-medium text-center">Before</th>
                      <th className="py-2 px-2 font-medium text-center">During</th>
                      <th className="py-2 px-2 font-medium text-center">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ['flexion_l', 'Flexion L'],
                      ['flexion_r', 'Flexion R'],
                      ['extension_l', 'Extension L'],
                      ['extension_r', 'Extension R'],
                      ['inversion_l', 'Inversion L'],
                      ['inversion_r', 'Inversion R'],
                      ['eversion_l', 'Eversion L'],
                      ['eversion_r', 'Eversion R'],
                    ].map(([key, label]) => (
                      <tr key={key}>
                        <td className="py-2 pr-3 text-slate-700 whitespace-nowrap">{label}</td>
                        {(['before', 'during', 'after'] as const).map(phase => (
                          <td key={phase} className="py-2 px-2 text-center">
                            <select
                              value={formData.neural_tension[key as TensionKey]?.[phase] ?? ''}
                              onChange={e => setNeuralTension(key as TensionKey, phase, e.target.value ? Number(e.target.value) : null)}
                              className="w-14 rounded border border-slate-200 px-1 py-1 text-center text-sm"
                            >
                              <option value="">—</option>
                              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leg check */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">Leg check — Pattern</p>
                <div className="flex gap-3">
                  {LEG_PATTERNS.map(p => (
                    <label key={p} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.leg_check.includes(p)}
                        onChange={() => setField('leg_check', toggleArray(formData.leg_check, p))}
                        className="accent-teal-600"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Neck & Spine */}
          <Card className="mt-4">
            <CardHeader><CardTitle>Neck & Spine Assessment</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-100">
                      <th className="py-2 pr-3 text-left font-medium">Area</th>
                      <th className="py-2 px-2 font-medium text-center">Before</th>
                      <th className="py-2 px-2 font-medium text-center">After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ['neck_passive_before', 'neck_passive_after', 'Neck Passive (Bones)'],
                      ['neck_active_before', 'neck_active_after', 'Neck Active (Muscles)'],
                      ['spine_passive_before', 'spine_passive_after', 'Spine Passive (Bones)'],
                      ['spine_active_before', 'spine_active_after', 'Spine Active (Muscles)'],
                    ].map(([bKey, aKey, label]) => (
                      <tr key={bKey}>
                        <td className="py-2 pr-3 text-slate-700 whitespace-nowrap">{label}</td>
                        {[bKey, aKey].map((key, i) => (
                          <td key={key} className="py-2 px-2 text-center">
                            <select
                              value={(formData as any)[key] ?? ''}
                              onChange={e => setField(key, e.target.value ? Number(e.target.value) : null)}
                              className="w-14 rounded border border-slate-200 px-1 py-1 text-center text-sm"
                            >
                              <option value="">—</option>
                              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body diagram */}
        <TabsContent value="body">
          <Card>
            <CardHeader>
              <CardTitle>Body Diagram Annotation</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Tap on the body to mark tension areas. Blue = Before · Orange = During · Green = After</p>
            </CardHeader>
            <CardContent>
              <BodyDiagram
                annotations={formData.body_diagram_annotations}
                onChange={dots => setField('body_diagram_annotations', dots)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* General assessment */}
        <TabsContent value="general">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>General Assessment (0–10)</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {(['energy', 'lightness', 'state_of_mind'] as const).map(metric => {
                  const entry = formData.general_assessment[metric]
                  const label = metric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  return (
                    <div key={metric} className="space-y-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <p className="text-sm font-semibold text-slate-700">{label}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <SliderField label="Before" value={entry.before ?? 5} onChange={v => setGeneralAssessment(metric, 'before', v)} lowLabel="Low" highLabel="High" />
                        <SliderField label="After" value={entry.after ?? 5} onChange={v => setGeneralAssessment(metric, 'after', v)} lowLabel="Low" highLabel="High" />
                      </div>
                      <input
                        type="text"
                        placeholder="Remarks"
                        value={entry.remarks}
                        onChange={e => setGeneralAssessment(metric, 'remarks', e.target.value)}
                        className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>NSA Level & SRI Stages</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">NSA Level applied</p>
                  <div className="flex gap-3">
                    {NSA_LEVELS.map(lvl => (
                      <label key={lvl} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="radio"
                          name="nsa_level"
                          value={lvl}
                          checked={formData.nsa_level === lvl}
                          onChange={() => setField('nsa_level', lvl)}
                          className="accent-teal-600"
                        />
                        {lvl}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">SRI Stages used</p>
                  <div className="flex flex-wrap gap-2">
                    {SRI_STAGES.map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setField('sri_stages', toggleArray(formData.sri_stages, n))}
                        className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                          formData.sri_stages.includes(n)
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Wave type observed</p>
                  <div className="flex gap-3">
                    {WAVE_TYPES.map(wt => (
                      <label key={wt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.wave_types.includes(wt)}
                          onChange={() => setField('wave_types', toggleArray(formData.wave_types, wt))}
                          className="accent-teal-600"
                        />
                        {wt}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Client Sharing — Before Session</CardTitle></CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  value={formData.client_sharing_before}
                  onChange={e => setField('client_sharing_before', e.target.value)}
                  placeholder="What the client shared before the session..."
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Practitioner Observations</CardTitle>
                  <button
                    type="button"
                    onClick={() => startDictation('practitioner_observations')}
                    className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
                  >
                    <Mic className="h-3 w-3" /> Dictate
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={5}
                  value={formData.practitioner_observations}
                  onChange={e => setField('practitioner_observations', e.target.value)}
                  placeholder="Clinical observations during the session..."
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Client Sharing — After Session</CardTitle></CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  value={formData.client_sharing_after}
                  onChange={e => setField('client_sharing_after', e.target.value)}
                  placeholder="What the client shared after the session..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Complete */}
        <TabsContent value="complete">
          <Card>
            <CardHeader><CardTitle>Complete Session</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Marking this session complete will save all form data and update the client&apos;s session count.
              </p>
              {completed ? (
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Session completed</span>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleSave(true)}
                  loading={isPending}
                  size="lg"
                  variant="primary"
                >
                  Mark session complete
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="button" onClick={() => handleSave(false)} loading={isPending}>
          Save progress
        </Button>
      </div>
    </div>
  )
}
