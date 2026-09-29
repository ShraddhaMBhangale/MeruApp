'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const SYMPTOM_AREAS = ['Head', 'Neck', 'Shoulder', 'Upper back', 'Mid back', 'Lower back', 'Sacrum/Coccyx', 'Hips', 'Knees', 'Feet', 'Arms/Hands', 'Other']
const SEVERITY_CATEGORIES = [
  'Pain', 'Swelling', 'Functional Disability', 'Mood Swings / Anxiety',
  'Stress Level', 'Anger', 'Fear', 'Heaviness in Body',
  'Energy Levels', 'Appetite', 'Sleep', 'State of Mind', 'Memory', 'Confidence',
]

interface Props { client: any; existing: any }

function buildDefault(existing: any) {
  return {
    chief_complaint: existing?.chief_complaint ?? '',
    complaint_onset: existing?.complaint_onset ?? '',
    complaint_areas: existing?.complaint_areas ?? [],
    accidents: existing?.accidents ?? '',
    surgeries: existing?.surgeries ?? '',
    hospitalisations: existing?.hospitalisations ?? '',
    major_illnesses: existing?.major_illnesses ?? '',
    emotional_trauma: existing?.emotional_trauma ?? '',
    birth_complications: existing?.birth_complications ?? '',
    family_history: existing?.family_history ?? '',
    menstrual_history: existing?.menstrual_history ?? '',
    diet: existing?.diet ?? '',
    exercise: existing?.exercise ?? '',
    sleep_hours: existing?.sleep_hours ?? '',
    stress_description: existing?.stress_description ?? '',
    primary_physician: existing?.primary_physician ?? '',
    current_diagnosis: existing?.current_diagnosis ?? '',
    current_medications: existing?.current_medications ?? '',
    prior_therapies: existing?.prior_therapies ?? '',
    symptom_severity: existing?.symptom_severity ?? {},
    vision_for_health: existing?.vision_for_health ?? '',
    desired_changes: existing?.desired_changes ?? '',
    goals: existing?.goals ?? '',
    life_if_well: existing?.life_if_well ?? '',
  }
}

export function ClientHistoryFormClient({ client, existing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(!!existing?.filled_at)
  const [data, setData] = useState(buildDefault(existing))
  const isF = client.gender === 'female'

  function set(field: string, value: any) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function toggleArea(area: string) {
    const areas: string[] = data.complaint_areas
    set('complaint_areas', areas.includes(area) ? areas.filter(a => a !== area) : [...areas, area])
  }

  function setSeverity(cat: string, field: 'score' | 'remarks', value: any) {
    const sev = data.symptom_severity as any
    set('symptom_severity', { ...sev, [cat]: { ...(sev[cat] ?? {}), [field]: value } })
  }

  async function handleSave() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const payload = { ...data, client_id: client.id, filled_at: existing?.filled_at ?? new Date().toISOString() }
      const { error: err } = existing
        ? await supabase.from('form3_case_history').update(payload).eq('id', existing.id)
        : await supabase.from('form3_case_history').insert(payload)
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
          Saved · {existing?.filled_at ? formatDate(existing.filled_at) : 'just now'}
        </div>
      )}

      <Tabs defaultValue="symptoms">
        <div className="overflow-x-auto pb-2">
          <TabsList className="min-w-max">
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="history">Health History</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="treatment">Current Care</TabsTrigger>
            <TabsTrigger value="severity">Severity</TabsTrigger>
            <TabsTrigger value="vision">Vision</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="symptoms">
          <Card>
            <CardHeader><CardTitle>Current Symptoms</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label required>Main concern</Label>
                <Textarea rows={3} value={data.chief_complaint} onChange={e => set('chief_complaint', e.target.value)} placeholder="Describe your main health concern..." />
              </div>
              <div className="space-y-1.5">
                <Label>When did it start?</Label>
                <Input value={data.complaint_onset} onChange={e => set('complaint_onset', e.target.value)} placeholder="e.g. 3 months ago after a fall" />
              </div>
              <div className="space-y-2">
                <Label>Which areas are affected?</Label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        data.complaint_areas.includes(area)
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-teal-300'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Health History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'accidents', label: 'Accidents or injuries' },
                { key: 'surgeries', label: 'Surgeries' },
                { key: 'hospitalisations', label: 'Hospitalisations' },
                { key: 'major_illnesses', label: 'Major illnesses' },
                { key: 'emotional_trauma', label: 'Significant emotional / mental events' },
                { key: 'birth_complications', label: 'Birth complications (yours or your child\'s)' },
                { key: 'family_history', label: 'Family health history' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Textarea rows={2} value={(data as any)[key]} onChange={e => set(key, e.target.value)} placeholder="If none, leave blank" />
                </div>
              ))}
              {isF && (
                <div className="space-y-1.5">
                  <Label>Menstrual / reproductive history</Label>
                  <Textarea rows={2} value={data.menstrual_history} onChange={e => set('menstrual_history', e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle">
          <Card>
            <CardHeader><CardTitle>Lifestyle & Emotional Health</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'diet', label: 'Describe your diet' },
                { key: 'exercise', label: 'Exercise routine' },
                { key: 'sleep_hours', label: 'Hours of sleep per night' },
                { key: 'stress_description', label: 'How would you describe your current stress levels?' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Textarea rows={2} value={(data as any)[key]} onChange={e => set(key, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment">
          <Card>
            <CardHeader><CardTitle>Current Care</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'primary_physician', label: 'Primary physician / doctor' },
                { key: 'current_diagnosis', label: 'Current diagnosis (if any)' },
                { key: 'current_medications', label: 'Medications and supplements' },
                { key: 'prior_therapies', label: 'Previous therapies or treatments' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Textarea rows={2} value={(data as any)[key]} onChange={e => set(key, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="severity">
          <Card>
            <CardHeader>
              <CardTitle>Symptom Severity (Right Now)</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Rate each area 0 (none) to 5 (severe)</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-100">
                      <th className="py-2 pr-3 text-left font-medium">Category</th>
                      <th className="py-2 px-2 text-center font-medium">0–5</th>
                      <th className="py-2 pl-2 text-left font-medium">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {SEVERITY_CATEGORIES.map(cat => {
                      const sev = (data.symptom_severity as any)[cat] ?? { score: 0, remarks: '' }
                      return (
                        <tr key={cat}>
                          <td className="py-2.5 pr-3 text-slate-700 whitespace-nowrap">{cat}</td>
                          <td className="py-2.5 px-2 text-center">
                            <select
                              value={sev.score}
                              onChange={e => setSeverity(cat, 'score', Number(e.target.value))}
                              className="w-12 rounded border border-slate-200 px-1 py-1 text-sm text-center"
                            >
                              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                          <td className="py-2.5 pl-2">
                            <input
                              type="text"
                              placeholder="Notes..."
                              value={sev.remarks}
                              onChange={e => setSeverity(cat, 'remarks', e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision">
          <Card>
            <CardHeader><CardTitle>Your Vision & Expectations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'vision_for_health', label: 'What is your vision for your health?' },
                { key: 'desired_changes', label: 'What changes are you looking for?' },
                { key: 'goals', label: 'What are your health goals?' },
                { key: 'life_if_well', label: 'How would life look if you were fully well?' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Textarea rows={3} value={(data as any)[key]} onChange={e => set(key, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button onClick={handleSave} loading={isPending} size="lg">
        {saved ? 'Update history' : 'Save history'}
      </Button>
    </div>
  )
}
