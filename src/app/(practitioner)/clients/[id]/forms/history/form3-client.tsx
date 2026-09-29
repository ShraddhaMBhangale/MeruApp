'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SignaturePadComponent } from '@/components/forms/signature-pad'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const SYMPTOM_CATEGORIES = [
  'Musculoskeletal / Pain',
  'Digestive / GI',
  'Respiratory',
  'Cardiovascular',
  'Neurological',
  'Endocrine / Hormonal',
  'Skin',
  'Immune / Allergies',
  'Reproductive',
  'Urinary',
  'Eyes / Ears / ENT',
  'Mental / Emotional',
  'Sleep',
  'Energy / Fatigue',
]

const VISION_QUESTIONS = [
  'What is your primary reason for starting Meru Chikitsa?',
  'What does wellness mean to you? What does a healthy life look like?',
  'What are the top 3 changes you would like to experience from this programme?',
  'Is there anything else you would like your practitioner to know?',
]

const LIFESTYLE_LABELS: Record<string, string> = {
  physical_activity: 'Physical activity level',
  dietary_preferences: 'Dietary preferences',
  smoking: 'Smoking',
  alcohol: 'Alcohol use',
  sleep_hours: 'Average sleep hours',
  daily_routine: 'Daily routine notes',
}

const WELLNESS_LABELS: Record<string, string> = {
  stress_level: 'Stress level (0–10)',
  stress_sources: 'Sources of stress',
  support_system: 'Support system',
  hobbies: 'Hobbies / recreation',
  therapy_history: 'Prior therapy / counselling history',
}

interface Props {
  client: { id: string; full_name: string; gender: string | null; date_of_birth: string | null }
  existing: any
}

export function Form3CaseHistoryClient({ client, existing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(!!existing?.client_declaration_signed_at)
  const [signature, setSignature] = useState<string | null>(existing?.client_signature_data ?? null)

  const [data, setData] = useState({
    current_concerns: existing?.current_concerns ?? '',
    onset_duration: existing?.onset_duration ?? '',
    areas_of_discomfort: (existing?.areas_of_discomfort ?? []).join(', '),
    health_history: existing?.health_history ?? {
      accidents: '', surgeries: '', hospitalisation: '', illness: '',
      emotional_trauma: '', mental_trauma: '', birth_trauma: '',
    },
    family_history: existing?.family_history ?? '',
    menstrual_history: existing?.menstrual_history ?? '',
    lifestyle: existing?.lifestyle ?? {
      physical_activity: '', dietary_preferences: '', smoking: '', alcohol: '',
      sleep_hours: '', daily_routine: '',
    },
    wellness_emotional: existing?.wellness_emotional ?? {
      stress_level: '', stress_sources: '', support_system: '', hobbies: '', therapy_history: '',
    },
    current_treatment: existing?.current_treatment ?? {
      physician: '', diagnosis: '', medications: '', prior_therapies: '',
    },
    symptom_severity_before: existing?.symptom_severity_before ?? Object.fromEntries(
      SYMPTOM_CATEGORIES.map(c => [c, { score: 0, remarks: '' }])
    ),
    vision_expectations: existing?.vision_expectations ?? Object.fromEntries(
      VISION_QUESTIONS.map((q, i) => [`q${i + 1}`, ''])
    ),
  })

  function setField(key: string, value: any) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function setNestedField(parent: string, key: string, value: any) {
    setData(prev => ({ ...prev, [parent]: { ...(prev as any)[parent], [key]: value } }))
  }

  async function handleSave() {
    if (!signature) { setError('Client signature is required'); return }
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        client_id: client.id,
        current_concerns: data.current_concerns,
        onset_duration: data.onset_duration,
        areas_of_discomfort: data.areas_of_discomfort.split(',').map((s: string) => s.trim()).filter(Boolean),
        health_history: data.health_history,
        family_history: data.family_history,
        menstrual_history: client.gender === 'Female' ? data.menstrual_history : null,
        lifestyle: data.lifestyle,
        wellness_emotional: data.wellness_emotional,
        current_treatment: data.current_treatment,
        symptom_severity_before: data.symptom_severity_before,
        vision_expectations: data.vision_expectations,
        client_signature_data: signature,
        client_declaration_signed_at: existing?.client_declaration_signed_at ?? new Date().toISOString(),
      }
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
          Saved · signed {existing?.client_declaration_signed_at ? formatDate(existing.client_declaration_signed_at) : 'just now'}
        </div>
      )}

      <Tabs defaultValue="symptoms">
        <TabsList className="flex-wrap h-auto gap-y-1">
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="health">Health History</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="severity">Severity</TabsTrigger>
          <TabsTrigger value="vision">Vision</TabsTrigger>
          <TabsTrigger value="sign">Sign</TabsTrigger>
        </TabsList>

        {/* Symptoms */}
        <TabsContent value="symptoms">
          <Card>
            <CardHeader><CardTitle>Symptomatic History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current concern / chief complaint</Label>
                <Textarea value={data.current_concerns} onChange={e => setField('current_concerns', e.target.value)} rows={3} placeholder="Describe the main reason for seeking care..." />
              </div>
              <div className="space-y-1.5">
                <Label>Onset & duration</Label>
                <Input value={data.onset_duration} onChange={e => setField('onset_duration', e.target.value)} placeholder="e.g. 6 months ago after a car accident" />
              </div>
              <div className="space-y-1.5">
                <Label>Areas of discomfort (comma-separated)</Label>
                <Input value={data.areas_of_discomfort} onChange={e => setField('areas_of_discomfort', e.target.value)} placeholder="e.g. lower back, neck, left shoulder" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health history */}
        <TabsContent value="health">
          <Card>
            <CardHeader><CardTitle>Health History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.health_history).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Label>
                  <Textarea
                    value={value as string}
                    onChange={e => setNestedField('health_history', key, e.target.value)}
                    rows={2}
                    placeholder={`Details about ${key.replace(/_/g, ' ')}...`}
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label>Family history (hereditary conditions)</Label>
                <Textarea value={data.family_history} onChange={e => setField('family_history', e.target.value)} rows={2} placeholder="Diabetes, heart disease, etc." />
              </div>
              {client.gender === 'Female' && (
                <div className="space-y-1.5">
                  <Label>Menstrual & reproductive history</Label>
                  <Textarea value={data.menstrual_history} onChange={e => setField('menstrual_history', e.target.value)} rows={2} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifestyle */}
        <TabsContent value="lifestyle">
          <Card>
            <CardHeader><CardTitle>Lifestyle & Wellness</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.lifestyle).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{LIFESTYLE_LABELS[key] ?? key}</Label>
                  <Input value={value as string} onChange={e => setNestedField('lifestyle', key, e.target.value)} />
                </div>
              ))}
              <hr className="border-slate-100 my-2" />
              <p className="text-sm font-semibold text-slate-700">Emotional Health</p>
              {Object.entries(data.wellness_emotional).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{WELLNESS_LABELS[key] ?? key}</Label>
                  <Textarea rows={2} value={value as string} onChange={e => setNestedField('wellness_emotional', key, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Current treatment */}
        <TabsContent value="treatment">
          <Card>
            <CardHeader><CardTitle>Current Treatment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.current_treatment).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Label>
                  <Textarea rows={2} value={value as string} onChange={e => setNestedField('current_treatment', key, e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Symptom severity */}
        <TabsContent value="severity">
          <Card>
            <CardHeader>
              <CardTitle>Health Condition Severity — Before</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Rate each category 0 = none, 5 = severe</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SYMPTOM_CATEGORIES.map(cat => {
                  const entry = data.symptom_severity_before[cat] ?? { score: 0, remarks: '' }
                  return (
                    <div key={cat} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                      <div className="w-40 flex-shrink-0">
                        <p className="text-xs font-medium text-slate-700">{cat}</p>
                      </div>
                      <select
                        value={entry.score}
                        onChange={e => setField('symptom_severity_before', {
                          ...data.symptom_severity_before,
                          [cat]: { ...entry, score: Number(e.target.value) }
                        })}
                        className="w-14 rounded border border-slate-200 px-1 py-1 text-sm text-center"
                      >
                        {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Remarks"
                        value={entry.remarks}
                        onChange={e => setField('symptom_severity_before', {
                          ...data.symptom_severity_before,
                          [cat]: { ...entry, remarks: e.target.value }
                        })}
                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vision */}
        <TabsContent value="vision">
          <Card>
            <CardHeader><CardTitle>Vision & Expectations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {VISION_QUESTIONS.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <Label>{q}</Label>
                  <Textarea
                    rows={3}
                    value={data.vision_expectations[`q${i + 1}`] ?? ''}
                    onChange={e => setField('vision_expectations', {
                      ...data.vision_expectations, [`q${i + 1}`]: e.target.value
                    })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signature */}
        <TabsContent value="sign">
          <Card>
            <CardHeader><CardTitle>Client Declaration & Signature</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                I, <strong>{client.full_name}</strong>, confirm that all the information provided above is accurate and complete to the best of my knowledge.
              </p>
              <SignaturePadComponent onSave={setSignature} existingSignature={existing?.client_signature_data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button onClick={handleSave} loading={isPending} size="lg">
        {saved ? 'Update case history' : 'Save case history'}
      </Button>
    </div>
  )
}
