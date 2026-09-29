'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const NEGATIVE_PARAMS = [
  { key: 'pain', label: 'Pain' },
  { key: 'swelling', label: 'Swelling' },
  { key: 'functional_disability', label: 'Functional Disability' },
  { key: 'mood_swings_anxiety', label: 'Mood Swings / Anxiety' },
  { key: 'stress_level', label: 'Stress Level' },
  { key: 'anger', label: 'Anger' },
  { key: 'fear', label: 'Fear' },
  { key: 'heaviness_in_body', label: 'Heaviness in Body' },
]

const POSITIVE_PARAMS = [
  { key: 'energy_levels', label: 'Energy Levels' },
  { key: 'appetite', label: 'Appetite' },
  { key: 'sleep', label: 'Sleep' },
  { key: 'freshness_on_waking', label: 'Freshness on Waking Up' },
  { key: 'state_of_mind', label: 'State of Mind' },
  { key: 'clarity_of_thoughts', label: 'Clarity of Thoughts' },
  { key: 'memory', label: 'Memory' },
  { key: 'handling_emotions', label: 'Handling Emotions' },
  { key: 'facing_challenges', label: 'Facing Challenging Situations' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'acceptance', label: 'Acceptance' },
  { key: 'relationship_quality', label: 'Relationship Quality' },
  { key: 'connecting_to_higher_self', label: 'Connecting to Higher Self / Spirituality' },
]

const QUALITATIVE_QUESTIONS = [
  { key: 'conditions_resolved', label: 'Any condition or symptom already resolved?' },
  { key: 'improvements_practitioner_noticed', label: 'Other improvements practitioner has noticed' },
  { key: 'changes_client_noticed', label: 'What changes the client has noticed so far' },
  { key: 'client_learning', label: "Client's learning while moving through this issue" },
]

function makeParamDefaults(params: { key: string }[]) {
  return Object.fromEntries(params.map(p => [p.key, { score: 0, remarks: '' }]))
}

interface Props {
  client: { id: string; full_name: string }
  existing: any
  sessionNum: 0 | 8 | 16 | 24
}

export function Form5FeedbackClient({ client, existing, sessionNum }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(!!existing?.filled_at)
  const [error, setError] = useState<string | null>(null)

  const [negParams, setNegParams] = useState(existing?.negative_params ?? makeParamDefaults(NEGATIVE_PARAMS))
  const [posParams, setPosParams] = useState(existing?.positive_params ?? makeParamDefaults(POSITIVE_PARAMS))
  const [qualitative, setQualitative] = useState(existing?.qualitative_feedback ?? {
    conditions_resolved: '', improvements_practitioner_noticed: '', changes_client_noticed: '', client_learning: '',
  })
  const [testimonial, setTestimonial] = useState(existing?.testimonial_text ?? '')

  function setParamScore(params: any, setParams: any, key: string, field: 'score' | 'remarks', value: any) {
    setParams({ ...params, [key]: { ...params[key], [field]: value } })
  }

  async function handleSave() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        client_id: client.id,
        session_number: sessionNum,
        negative_params: negParams,
        positive_params: posParams,
        qualitative_feedback: sessionNum > 0 ? qualitative : null,
        testimonial_text: sessionNum === 24 ? testimonial : null,
        filled_at: existing?.filled_at ?? new Date().toISOString(),
      }
      const { error: err } = existing
        ? await supabase.from('form5_feedback').update(payload).eq('id', existing.id)
        : await supabase.from('form5_feedback').insert(payload)
      if (err) { setError(err.message); return }
      setSaved(true)
      router.refresh()
    })
  }

  function ParamTable({ params, data, setData, higher }: { params: typeof NEGATIVE_PARAMS; data: any; setData: any; higher: string }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
              <th className="py-2 pr-3 font-medium">Parameter</th>
              <th className="py-2 px-2 font-medium text-center">Score (0–10)<br/><span className="font-normal">{higher}</span></th>
              <th className="py-2 pl-2 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {params.map(({ key, label }) => (
              <tr key={key}>
                <td className="py-2.5 pr-3 text-slate-700 whitespace-nowrap">{label}</td>
                <td className="py-2.5 px-2 text-center">
                  <select
                    value={data[key]?.score ?? 0}
                    onChange={e => setParamScore(data, setData, key, 'score', Number(e.target.value))}
                    className="w-14 rounded border border-slate-200 px-1 py-1 text-center text-sm"
                  >
                    {Array.from({ length: 11 }, (_, i) => i).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5 pl-2">
                  <input
                    type="text"
                    placeholder="Notes..."
                    value={data[key]?.remarks ?? ''}
                    onChange={e => setParamScore(data, setData, key, 'remarks', e.target.value)}
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Saved · {existing?.filled_at ? formatDate(existing.filled_at) : 'just now'}
        </div>
      )}

      <Tabs defaultValue="negative">
        <TabsList className="flex-wrap h-auto gap-y-1">
          <TabsTrigger value="negative">Section A — Negative</TabsTrigger>
          <TabsTrigger value="positive">Section B — Positive</TabsTrigger>
          {sessionNum > 0 && <TabsTrigger value="qualitative">Section C — Qualitative</TabsTrigger>}
          {sessionNum === 24 && <TabsTrigger value="testimonial">Section E — Testimonial</TabsTrigger>}
        </TabsList>

        <TabsContent value="negative">
          <Card>
            <CardHeader>
              <CardTitle>Negative Parameter Scale</CardTitle>
              <p className="text-xs text-slate-500 mt-1">0 = None · 10 = Extreme (higher = worse)</p>
            </CardHeader>
            <CardContent>
              <ParamTable params={NEGATIVE_PARAMS} data={negParams} setData={setNegParams} higher="Higher = Worse" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positive">
          <Card>
            <CardHeader>
              <CardTitle>Positive Parameter Scale</CardTitle>
              <p className="text-xs text-slate-500 mt-1">0 = Very low · 10 = Excellent (higher = better)</p>
            </CardHeader>
            <CardContent>
              <ParamTable params={POSITIVE_PARAMS} data={posParams} setData={setPosParams} higher="Higher = Better" />
            </CardContent>
          </Card>
        </TabsContent>

        {sessionNum > 0 && (
          <TabsContent value="qualitative">
            <Card>
              <CardHeader><CardTitle>Qualitative Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {QUALITATIVE_QUESTIONS.map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">{label}</label>
                    <Textarea
                      rows={3}
                      value={qualitative[key] ?? ''}
                      onChange={e => setQualitative({ ...qualitative, [key]: e.target.value })}
                      placeholder="..."
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {sessionNum === 24 && (
          <TabsContent value="testimonial">
            <Card>
              <CardHeader><CardTitle>Final Testimonial (Session 24)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-500">Client&apos;s written testimonial of their journey</p>
                <Textarea
                  rows={8}
                  value={testimonial}
                  onChange={e => setTestimonial(e.target.value)}
                  placeholder="Client writes their testimonial here..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button onClick={handleSave} loading={isPending} size="lg">
        {saved ? 'Update feedback' : 'Save feedback'}
      </Button>
    </div>
  )
}
