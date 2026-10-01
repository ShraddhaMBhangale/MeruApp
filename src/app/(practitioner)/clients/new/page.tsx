'use client'

import { useTransition, useState } from 'react'
import { createClientProfile } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(v => ({ value: v, label: v }))

const nsaLevelOptions = [
  { value: '', label: 'Not Yet Assessed' },
  { value: 'Level 1', label: 'Level 1 — Discover' },
  { value: 'Level 2', label: 'Level 2 — Transform' },
  { value: 'Level 3', label: 'Level 3 — Awaken' },
]

export default function NewClientPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [hadSessions, setHadSessions] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createClientProfile(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Client</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create a client profile to begin their journey</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" required>Full name</Label>
                <Input id="full_name" name="full_name" placeholder="e.g. Priya Sharma" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date_of_birth">Date of birth</Label>
                <Input id="date_of_birth" name="date_of_birth" type="date" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select id="gender" name="gender" options={genderOptions} placeholder="Select gender" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="blood_group">Blood group</Label>
                <Select id="blood_group" name="blood_group" options={bloodGroupOptions} placeholder="Select" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="educational_qualification">Education</Label>
                <Input id="educational_qualification" name="educational_qualification" placeholder="e.g. B.Com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" name="occupation" placeholder="e.g. Software Engineer" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" placeholder="Full address" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="mobile" required>Mobile number</Label>
                <Input id="mobile" name="mobile" type="tel" placeholder="+91 98765 43210" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" placeholder="client@example.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency contact */}
        <Card>
          <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact_name">Name</Label>
                <Input id="emergency_contact_name" name="emergency_contact_name" placeholder="Contact name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input id="emergency_contact_relationship" name="emergency_contact_relationship" placeholder="e.g. Spouse" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact_phone">Phone</Label>
                <Input id="emergency_contact_phone" name="emergency_contact_phone" type="tel" placeholder="+91 98765 43210" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical info */}
        <Card>
          <CardHeader><CardTitle>Clinical Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Has the client received Meru Chikitsa sessions before?</Label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="had_sessions_before" value="no" defaultChecked onChange={() => setHadSessions(false)} className="accent-teal-600" />
                  No
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="had_sessions_before" value="yes" onChange={() => setHadSessions(true)} className="accent-teal-600" />
                  Yes
                </label>
              </div>
            </div>
            {hadSessions && (
              <div className="space-y-1.5">
                <Label htmlFor="previous_sessions_count">How many sessions?</Label>
                <Input id="previous_sessions_count" name="previous_sessions_count" type="number" min="1" className="max-w-[120px]" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="referral_source">Referred by</Label>
              <Input id="referral_source" name="referral_source" placeholder="Name or source" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nsa_level">NSA care level at intake</Label>
              <Select id="nsa_level" name="nsa_level" options={nsaLevelOptions} defaultValue="Not Yet Assessed" />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" loading={isPending} size="lg">Create client</Button>
          <Link href="/clients">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
