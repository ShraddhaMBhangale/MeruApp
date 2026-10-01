'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BodyDiagram } from '@/components/forms/body-diagram'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Mic } from 'lucide-react'
import type { BodyDotAnnotation, Session } from '@/types/database'

// ── Inline Stepper (1–5 scale) ────────────────────────────────────────────────
function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 text-teal-700 font-bold flex items-center justify-center hover:bg-slate-100 leading-none">
        −
      </button>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm border-2 ${
        value > 0 ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        {value > 0 ? value : '–'}
      </div>
      <button type="button" onClick={() => onChange(Math.min(5, value + 1))}
        className="w-6 h-6 rounded-full border border-slate-200 bg-slate-50 text-teal-700 font-bold flex items-center justify-center hover:bg-slate-100 leading-none">
        +
      </button>
    </div>
  )
}

// ── Inline Slider (0–10 scale) ────────────────────────────────────────────────
function Slider({ value, onChange, color = 'teal' }: { value: number; onChange: (v: number) => void; color?: string }) {
  const accent = color === 'blue' ? '#2563EB' : color === 'green' ? '#16A34A' : '#0d9488'
  return (
    <div className="flex items-center gap-2">
      <input type="range" min={0} max={10} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: accent }} />
      <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm border-2 ${
        value > 0 ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        {value}
      </div>
    </div>
  )
}

const NSA_LEVELS = ['Level 1', 'Level 2', 'Level 3'] as const
const SRI_STAGES = Array.from({ length: 12 }, (_, i) => i + 1)
const WAVE_TYPES = ['Respiratory', 'Somatopsychic', 'CPG'] as const
const LEG_PATTERNS = ['Cervical', 'Lumbar', 'Sacral'] as const

const REORG_LEVELS = ['discover', 'transform', 'awaken'] as const
const REORG_SUBS   = ['A', 'B', 'C'] as const
const CONTACT_TYPES = ['simple', 'sustained', 'rolles'] as const
const CONTACT_LOCS  = ['direct', 'indirect', 'coccyx', 'occiput'] as const

interface Props {
  session: Session
  client: { id: string; full_name: string; nsa_level: string | null }
  existing: any
}

export function Form4SessionClient({ session, client, existing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(!!existing?.id)
  const [completed, setCompleted] = useState(session.status === 'completed')
  const [error, setError] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Neural tension: flex_l / flex_r / inv_l / inv_r × before/during/after ──
  const initNeural = () => ({
    flex_l: { before: 0, during: 0, after: 0 },
    flex_r: { before: 0, during: 0, after: 0 },
    inv_l:  { before: 0, during: 0, after: 0 },
    inv_r:  { before: 0, during: 0, after: 0 },
  })

  // ── Reorganisational levels: discover/transform/awaken × A/B/C ──────────────
  const initReorg = () => ({
    discover:  { A: false, B: false, C: false },
    transform: { A: false, B: false, C: false },
    awaken:    { A: false, B: false, C: false },
  })

  // ── Contact types: simple/sustained/rolles × direct/indirect/coccyx/occiput ─
  const initContactTypes = () => Object.fromEntries(
    CONTACT_TYPES.flatMap(t => CONTACT_LOCS.map(l => [`${t}_${l}`, false]))
  ) as Record<string, boolean>

  const [formData, setFormData] = useState({
    // Neural tension
    neural_tension: existing?.neural_tension ?? initNeural(),
    // Passive bone
    neck_passive_before:  existing?.neck_passive_before  ?? 0,
    neck_passive_after:   existing?.neck_passive_after   ?? 0,
    spine_passive_before: existing?.spine_passive_before ?? 0,
    spine_passive_after:  existing?.spine_passive_after  ?? 0,
    // Body diagram
    body_diagram_annotations: (existing?.body_diagram_annotations ?? []) as BodyDotAnnotation[],
    // General assessment 0–10
    general_assessment: existing?.general_assessment ?? {
      energy:        { before: 0, after: 0, remarks: '' },
      lightness:     { before: 0, after: 0, remarks: '' },
      state_of_mind: { before: 0, after: 0, remarks: '' },
    },
    // Client sharing
    client_sharing_before: existing?.client_sharing_before ?? '',
    client_sharing_after:  existing?.client_sharing_after  ?? '',
    // Entrainment
    occiput_internal:        existing?.occiput_internal        ?? '',
    occiput_external:        existing?.occiput_external        ?? '',
    leg_check:               (existing?.leg_check ?? []) as string[],
    reorganisational_levels: existing?.reorganisational_levels ?? initReorg(),
    time_taken_minutes:      existing?.time_taken_minutes      ?? '',
    contacts_used:           existing?.contacts_used           ?? '',
    contact_types:           existing?.contact_types           ?? initContactTypes(),
    add_ons:                 existing?.add_ons                 ?? '',
    sri_used:                existing?.sri_used                ?? null as boolean | null,
    // NSA / SRI
    nsa_level:    existing?.nsa_level    ?? client.nsa_level ?? '',
    sri_stages:   (existing?.sri_stages  ?? []) as number[],
    wave_types:   (existing?.wave_types  ?? []) as string[],
    // Practitioner notes
    practitioner_observations: existing?.practitioner_observations ?? '',
  })

  function setField(key: string, value: any) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function toggleArray<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
  }

  function setNeural(key: string, phase: string, value: number) {
    setFormData(prev => ({
      ...prev,
      neural_tension: {
        ...prev.neural_tension,
        [key]: { ...prev.neural_tension[key], [phase]: value }
      }
    }))
  }

  function setGenAss(metric: string, field: string, value: any) {
    setFormData(prev => ({
      ...prev,
      general_assessment: {
        ...prev.general_assessment,
        [metric]: { ...prev.general_assessment[metric], [field]: value }
      }
    }))
  }

  function setReorg(level: string, sub: string, value: boolean) {
    setFormData(prev => ({
      ...prev,
      reorganisational_levels: {
        ...prev.reorganisational_levels,
        [level]: { ...prev.reorganisational_levels[level], [sub]: value }
      }
    }))
  }

  function toggleContactType(key: string) {
    setFormData(prev => ({
      ...prev,
      contact_types: { ...prev.contact_types, [key]: !prev.contact_types[key] }
    }))
  }

  // ── Voice dictation ────────────────────────────────────────────────────────
  function startDictation(field: string) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice-to-text not supported in this browser')
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      const cur = (formData as any)[field]
      setField(field, cur ? cur + ' ' + text : text)
    }
    rec.start()
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave(markComplete = false) {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        session_id: session.id,
        client_id:  client.id,
        ...formData,
        time_taken_minutes: formData.time_taken_minutes ? Number(formData.time_taken_minutes) : null,
      }
      const { error: err } = existing
        ? await supabase.from('form4_sessions').update(payload).eq('id', existing.id)
        : await supabase.from('form4_sessions').insert(payload)
      if (err) { setError(err.message); return }

      if (markComplete) {
        await supabase.from('sessions').update({ status: 'completed' }).eq('id', session.id)
        setCompleted(true)
      }
      setSaved(true)
      setSaveMsg(markComplete ? 'Session completed' : 'Saved')
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => setSaveMsg(null), 3000)
      router.refresh()
    })
  }

  // ── Shared cell/header styles ────────────────────────────────────────────
  const th = 'px-2 py-2 text-[11px] font-bold text-center border border-slate-200 bg-teal-700 text-white'
  const thSub = 'px-2 py-1 text-[10px] font-bold text-center border border-slate-200'
  const td = 'border border-slate-200 p-1 text-center align-middle'
  const tdLabel = 'border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap bg-slate-50'

  return (
    <div className="space-y-6">
      {/* Save banner */}
      {saveMsg && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {saveMsg}
        </div>
      )}

      <Tabs defaultValue="assessment">
        <TabsList className="flex-wrap h-auto gap-y-1">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="body">Body Diagram</TabsTrigger>
          <TabsTrigger value="general">General / Notes</TabsTrigger>
          <TabsTrigger value="entrainment">Entrainment Obs.</TabsTrigger>
          <TabsTrigger value="complete">Complete</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: ASSESSMENT ═══ */}
        <TabsContent value="assessment" className="space-y-4 mt-3">
          <Card>
            <CardHeader>
              <CardTitle>Assessment & Accountability</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Rate 1 (Softest) → 5 (Hardest)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className={`${th} bg-slate-100 text-slate-500`}></th>
                      <th colSpan={3} className={th}>Neural Tension — Flexion &amp; Extension</th>
                      <th colSpan={3} className={`${th} bg-teal-800`}>Neural Tension — Inversion &amp; Eversion</th>
                    </tr>
                    <tr>
                      <th className={`${th} bg-slate-100 text-slate-500`}></th>
                      <th className={`${thSub} bg-blue-900 text-blue-200`}>L — Before</th>
                      <th className={`${thSub} bg-orange-900 text-orange-200`}>L — During</th>
                      <th className={`${thSub} bg-green-900 text-green-200`}>L — After</th>
                      <th className={`${thSub} bg-blue-900 text-blue-200`}>R — Before</th>
                      <th className={`${thSub} bg-orange-900 text-orange-200`}>R — During</th>
                      <th className={`${thSub} bg-green-900 text-green-200`}>R — After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Flex & Ext', 'flex_l', 'flex_r'],
                      ['Inv & Ev',   'inv_l',  'inv_r'],
                    ].map(([label, lKey, rKey]) => (
                      <tr key={label}>
                        <td className={tdLabel}>{label}</td>
                        {(['before', 'during', 'after'] as const).map(ph => (
                          <td key={`${lKey}-${ph}`} className={td}>
                            <Stepper value={formData.neural_tension[lKey]?.[ph] ?? 0}
                              onChange={v => setNeural(lKey, ph, v)} />
                          </td>
                        ))}
                        {(['before', 'during', 'after'] as const).map(ph => (
                          <td key={`${rKey}-${ph}`} className={td}>
                            <Stepper value={formData.neural_tension[rKey]?.[ph] ?? 0}
                              onChange={v => setNeural(rKey, ph, v)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Passive bone */}
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Passive (Bone)</p>
                <div className="overflow-x-auto">
                  <table className="border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className={`${th} bg-slate-100 text-slate-500`}></th>
                        <th className={`${thSub} bg-blue-900 text-blue-200`}>Before</th>
                        <th className={`${thSub} bg-green-900 text-green-200`}>After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['neck_passive_before',  'neck_passive_after',  'Neck'],
                        ['spine_passive_before', 'spine_passive_after', 'Spine'],
                      ].map(([bKey, aKey, label]) => (
                        <tr key={label}>
                          <td className={tdLabel}>{label}</td>
                          <td className={td}>
                            <Stepper value={(formData as any)[bKey] ?? 0}
                              onChange={v => setField(bKey, v)} />
                          </td>
                          <td className={td}>
                            <Stepper value={(formData as any)[aKey] ?? 0}
                              onChange={v => setField(aKey, v)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NSA / SRI */}
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">NSA Level Applied</p>
                  <div className="flex gap-4">
                    {NSA_LEVELS.map(lvl => (
                      <label key={lvl} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="radio" name="nsa_level" value={lvl}
                          checked={formData.nsa_level === lvl}
                          onChange={() => setField('nsa_level', lvl)}
                          className="accent-teal-600" />
                        {lvl}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">SRI Stages Used</p>
                  <div className="flex flex-wrap gap-2">
                    {SRI_STAGES.map(n => (
                      <button key={n} type="button"
                        onClick={() => setField('sri_stages', toggleArray(formData.sri_stages, n))}
                        className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                          formData.sri_stages.includes(n)
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Wave Type Observed</p>
                  <div className="flex gap-4">
                    {WAVE_TYPES.map(wt => (
                      <label key={wt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input type="checkbox"
                          checked={formData.wave_types.includes(wt)}
                          onChange={() => setField('wave_types', toggleArray(formData.wave_types, wt))}
                          className="accent-teal-600" />
                        {wt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 2: BODY DIAGRAM ═══ */}
        <TabsContent value="body" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle>Body Diagram — Posterior View</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Tap areas to mark tension. Blue = Before · Orange = During · Green = After</p>
            </CardHeader>
            <CardContent>
              <BodyDiagram
                annotations={formData.body_diagram_annotations}
                onChange={dots => setField('body_diagram_annotations', dots)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 3: GENERAL / NOTES ═══ */}
        <TabsContent value="general" className="space-y-4 mt-3">
          <Card>
            <CardHeader>
              <CardTitle>General Assessment (0–10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className={`${th} bg-slate-100 text-slate-500`} style={{ width: 130 }}>Parameter</th>
                      <th className={`${thSub} bg-blue-900 text-blue-200`}>Before Session</th>
                      <th className={`${thSub} bg-green-900 text-green-200`}>After Session</th>
                      <th className={`${th} bg-amber-900 text-amber-200`}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ['energy',        'Energy Levels'],
                      ['lightness',     'Lightness in Body'],
                      ['state_of_mind', 'State of Mind'],
                    ] as const).map(([key, label]) => (
                      <tr key={key}>
                        <td className={tdLabel}>{label}</td>
                        <td className={`${td} min-w-[140px]`}>
                          <Slider value={formData.general_assessment[key]?.before ?? 0} color="blue"
                            onChange={v => setGenAss(key, 'before', v)} />
                        </td>
                        <td className={`${td} min-w-[140px]`}>
                          <Slider value={formData.general_assessment[key]?.after ?? 0} color="green"
                            onChange={v => setGenAss(key, 'after', v)} />
                        </td>
                        <td className={td}>
                          <input value={formData.general_assessment[key]?.remarks ?? ''} placeholder="…"
                            onChange={e => setGenAss(key, 'remarks', e.target.value)}
                            className="w-full rounded border border-slate-200 px-2 py-1 text-xs" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Client Sharing — Before Session</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={4} value={formData.client_sharing_before}
                onChange={e => setField('client_sharing_before', e.target.value)}
                placeholder="What the client shared before the session…" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Client Sharing — After Session</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={4} value={formData.client_sharing_after}
                onChange={e => setField('client_sharing_after', e.target.value)}
                placeholder="What the client shared after the session…" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 4: ENTRAINMENT OBSERVATIONS ═══ */}
        <TabsContent value="entrainment" className="space-y-4 mt-3">
          {/* Occiput + Leg Check + Reorganisational Levels + Time */}
          <Card>
            <CardHeader><CardTitle>Entrainment Observations</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th colSpan={2} className={th}>Occiput</th>
                      <th className={th}>Leg Check</th>
                      <th colSpan={3} className={`${th} bg-teal-800`}>Reorganisational Levels Achieved</th>
                      <th className={th}>Time (min)</th>
                    </tr>
                    <tr>
                      <th className={`${thSub} bg-teal-900 text-teal-200`}>Internal</th>
                      <th className={`${thSub} bg-teal-900 text-teal-200`}>External</th>
                      <th className={`${thSub} bg-teal-900 text-teal-200`}></th>
                      <th className={`${thSub} bg-green-900 text-green-200`}>Discover</th>
                      <th className={`${thSub} bg-green-900 text-green-200`}>Transform</th>
                      <th className={`${thSub} bg-green-900 text-green-200`}>Awaken</th>
                      <th className={`${thSub} bg-teal-900 text-teal-200`}></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={td}>
                        <input value={formData.occiput_internal}
                          onChange={e => setField('occiput_internal', e.target.value)}
                          className="w-16 rounded border border-slate-200 px-1 py-1 text-xs text-center" />
                      </td>
                      <td className={td}>
                        <input value={formData.occiput_external}
                          onChange={e => setField('occiput_external', e.target.value)}
                          className="w-16 rounded border border-slate-200 px-1 py-1 text-xs text-center" />
                      </td>
                      <td className={`${td} align-top pt-2`}>
                        <div className="flex flex-col gap-1">
                          {LEG_PATTERNS.map(p => (
                            <label key={p} className="flex items-center gap-1 text-xs cursor-pointer">
                              <input type="checkbox"
                                checked={formData.leg_check.includes(p)}
                                onChange={() => setField('leg_check', toggleArray(formData.leg_check, p))}
                                className="accent-teal-600" />
                              {p}
                            </label>
                          ))}
                        </div>
                      </td>
                      {REORG_LEVELS.map(lvl => (
                        <td key={lvl} className={`${td} align-top pt-2`}>
                          <div className="flex flex-col gap-1 items-center">
                            {REORG_SUBS.map(sub => (
                              <label key={sub} className="flex items-center gap-1 text-xs cursor-pointer">
                                <input type="checkbox"
                                  checked={formData.reorganisational_levels[lvl]?.[sub] ?? false}
                                  onChange={() => setReorg(lvl, sub, !formData.reorganisational_levels[lvl]?.[sub])}
                                  className="accent-teal-600" />
                                {sub}
                              </label>
                            ))}
                          </div>
                        </td>
                      ))}
                      <td className={td}>
                        <input type="number" min={0} max={120}
                          value={formData.time_taken_minutes}
                          onChange={e => setField('time_taken_minutes', e.target.value)}
                          className="w-14 rounded border border-slate-200 px-1 py-1 text-xs text-center"
                          placeholder="min" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Contacts used */}
          <Card>
            <CardHeader><CardTitle>Contacts Used</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={3} value={formData.contacts_used}
                onChange={e => setField('contacts_used', e.target.value)}
                placeholder="List spinal contacts used in this session…" />
            </CardContent>
          </Card>

          {/* Type of contact grid */}
          <Card>
            <CardHeader><CardTitle>Type of Contact</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className={`${th} bg-slate-100 text-slate-500`} style={{ width: 90 }}>Type</th>
                      {CONTACT_LOCS.map(l => (
                        <th key={l} className={th}>{l.charAt(0).toUpperCase() + l.slice(1)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CONTACT_TYPES.map(type => (
                      <tr key={type}>
                        <td className={tdLabel} style={{ textTransform: 'capitalize' }}>{type}</td>
                        {CONTACT_LOCS.map(loc => {
                          const k = `${type}_${loc}`
                          return (
                            <td key={k} className={td}>
                              <div className="flex justify-center">
                                <input type="checkbox"
                                  checked={!!formData.contact_types[k]}
                                  onChange={() => toggleContactType(k)}
                                  className="accent-teal-600 h-4 w-4" />
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Add-ons Used (most effective)
                </p>
                <Textarea rows={2} value={formData.add_ons}
                  onChange={e => setField('add_ons', e.target.value)}
                  placeholder="Add-ons used, most effective ones noted…" />
              </div>
            </CardContent>
          </Card>

          {/* SRI used */}
          <Card>
            <CardHeader><CardTitle>Was SRI Used?</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {[true, false].map(val => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer text-sm">
                    <div onClick={() => setField('sri_used', val)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                        formData.sri_used === val
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-slate-300 bg-white'
                      }`}>
                      {formData.sri_used === val && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className={formData.sri_used === val ? 'font-semibold' : ''}>{val ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Practitioner observations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Changes Noticed by Practitioner</CardTitle>
                <button type="button" onClick={() => startDictation('practitioner_observations')}
                  className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100">
                  <Mic className="h-3 w-3" /> Dictate
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea rows={6} value={formData.practitioner_observations}
                onChange={e => setField('practitioner_observations', e.target.value)}
                placeholder="Wave quality, tension shifts, emotional releases, breathing changes, body movement…" />
              <p className="mt-2 text-xs text-slate-400 italic">
                Use your keyboard's voice microphone for hands-free notes
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 5: COMPLETE ═══ */}
        <TabsContent value="complete" className="mt-3">
          <Card>
            <CardHeader><CardTitle>Complete Session</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Marking complete saves all data and updates the client&apos;s session count.
              </p>
              {completed ? (
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Session completed</span>
                </div>
              ) : (
                <Button type="button" onClick={() => handleSave(true)} loading={isPending} size="lg">
                  ✓ Mark Session Complete
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button type="button" onClick={() => handleSave(false)} loading={isPending}>
        Save progress
      </Button>
    </div>
  )
}
