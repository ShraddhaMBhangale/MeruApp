'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function practitionerLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function sendClientOtp(formData: FormData) {
  const email = formData.get('email') as string

  const supabase = await createClient()
  // No emailRedirectTo — Supabase sends a 6-digit OTP code instead of a magic link
  const { error } = await supabase.auth.signInWithOtp({ email })

  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
