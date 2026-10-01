'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateCaseStudyNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `MC-${year}-${rand}`
}

export async function createClientProfile(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('full_name') as string
  const mobile = formData.get('mobile') as string

  if (!fullName?.trim() || !mobile?.trim()) {
    return { error: 'Full name and mobile are required' }
  }

  const payload = {
    full_name: fullName.trim(),
    mobile: mobile.trim(),
    email: (formData.get('email') as string) || null,
    date_of_birth: (formData.get('date_of_birth') as string) || null,
    gender: (formData.get('gender') as string) || null,
    address: (formData.get('address') as string) || null,
    blood_group: (formData.get('blood_group') as string) || null,
    educational_qualification: (formData.get('educational_qualification') as string) || null,
    occupation: (formData.get('occupation') as string) || null,
    emergency_contact_name: (formData.get('emergency_contact_name') as string) || null,
    emergency_contact_relationship: (formData.get('emergency_contact_relationship') as string) || null,
    emergency_contact_phone: (formData.get('emergency_contact_phone') as string) || null,
    had_sessions_before: formData.get('had_sessions_before') === 'yes',
    previous_sessions_count: formData.get('previous_sessions_count')
      ? Number(formData.get('previous_sessions_count'))
      : null,
    referral_source: (formData.get('referral_source') as string) || null,
    nsa_level: (formData.get('nsa_level') as string) || null,
    case_study_number: generateCaseStudyNumber(),
    user_id: null,
  }

  const { data, error } = await supabase.from('clients').insert(payload).select('id').single()
  if (error) return { error: error.message }

  revalidatePath('/clients')
  redirect(`/clients/${data.id}`)
}

export async function updateClientProfile(clientId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .update({
      nsa_level: formData.get('nsa_level') as string,
      contraindications: (formData.get('contraindications') as string) || null,
    })
    .eq('id', clientId)

  if (error) return { error: error.message }
  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function createSession(clientId: string, formData: FormData) {
  const supabase = await createClient()

  // Get current max session number for this client
  const { data: existing } = await supabase
    .from('sessions')
    .select('session_number')
    .eq('client_id', clientId)
    .order('session_number', { ascending: false })
    .limit(1)

  const nextNumber = existing && existing.length > 0 ? existing[0].session_number + 1 : 1

  const sessionTime = formData.get('session_time') as string
  const durationMinutes = formData.get('duration_minutes') as string

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      client_id: clientId,
      session_number: nextNumber,
      session_date: (formData.get('session_date') as string) || new Date().toISOString().split('T')[0],
      session_time: sessionTime || null,
      duration_minutes: durationMinutes ? Number(durationMinutes) : 60,
      status: 'scheduled',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/clients/${clientId}`)
  redirect(`/clients/${clientId}/sessions/${data.id}`)
}
