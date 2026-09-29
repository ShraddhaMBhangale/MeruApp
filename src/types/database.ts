export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type NsaLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Not Yet Assessed'
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show'
export type Gender = 'Male' | 'Female' | 'Other'
export type WaveType = 'Respiratory' | 'Somatopsychic' | 'CPG'
export type MediaCategory = 'intake' | 'milestone' | 'report' | 'testimonial'

export interface Client {
  id: string
  user_id: string | null
  full_name: string
  date_of_birth: string | null
  gender: Gender | null
  mobile: string
  email: string | null
  address: string | null
  blood_group: string | null
  educational_qualification: string | null
  occupation: string | null
  emergency_contact_name: string | null
  emergency_contact_relationship: string | null
  emergency_contact_phone: string | null
  profile_photo_url: string | null
  had_sessions_before: boolean
  previous_sessions_count: number | null
  referral_source: string | null
  nsa_level: NsaLevel
  contraindications: string | null
  case_study_number: string | null
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  client_id: string
  session_number: number
  session_date: string
  status: SessionStatus
  created_at: string
}

export interface Form2Consent {
  id: string
  client_id: string
  signed_at: string | null
  signature_data: string | null
  guardian_name: string | null
  guardian_relationship: string | null
  research_consent: boolean
  pdf_url: string | null
  created_at: string
}

export interface Form3CaseHistory {
  id: string
  client_id: string
  current_concerns: string | null
  onset_duration: string | null
  areas_of_discomfort: string[] | null
  health_history: Json | null
  family_history: string | null
  menstrual_history: string | null
  lifestyle: Json | null
  wellness_emotional: Json | null
  current_treatment: Json | null
  symptom_severity_before: Json | null
  vision_expectations: Json | null
  client_declaration_signed_at: string | null
  client_signature_data: string | null
  symptom_severity_after: Json | null
  changes_narrative: string | null
  final_signed_at: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

export interface NeuralTensionReading {
  before: number | null
  during: number | null
  after: number | null
}

export interface NeuralTension {
  heel_flexion_l: NeuralTensionReading
  heel_flexion_r: NeuralTensionReading
  heel_extension_l: NeuralTensionReading
  heel_extension_r: NeuralTensionReading
  heel_inversion_l: NeuralTensionReading
  heel_inversion_r: NeuralTensionReading
  heel_eversion_l: NeuralTensionReading
  heel_eversion_r: NeuralTensionReading
}

export interface BodyDotAnnotation {
  x: number
  y: number
  phase: 'before' | 'during' | 'after'
  label?: string
}

export interface GeneralAssessmentRow {
  before: number | null
  after: number | null
  remarks: string
}

export interface Form4Session {
  id: string
  session_id: string
  client_id: string
  neural_tension: NeuralTension | null
  body_diagram_annotations: BodyDotAnnotation[] | null
  neck_passive_before: number | null
  neck_passive_after: number | null
  neck_active_before: number | null
  neck_active_after: number | null
  spine_passive_before: number | null
  spine_passive_after: number | null
  spine_active_before: number | null
  spine_active_after: number | null
  leg_check: string[] | null
  general_assessment: {
    energy: GeneralAssessmentRow
    lightness: GeneralAssessmentRow
    state_of_mind: GeneralAssessmentRow
  } | null
  nsa_level: string | null
  sri_stages: number[] | null
  wave_types: WaveType[] | null
  practitioner_observations: string | null
  client_sharing_before: string | null
  client_sharing_after: string | null
  pre_session_energy: number | null
  created_at: string
  updated_at: string
}

export interface MilestoneScore {
  score: number
  remarks: string
}

export interface Form5Feedback {
  id: string
  client_id: string
  session_number: 0 | 8 | 16 | 24
  negative_params: {
    pain: MilestoneScore
    swelling: MilestoneScore
    functional_disability: MilestoneScore
    mood_swings_anxiety: MilestoneScore
    stress_level: MilestoneScore
    anger: MilestoneScore
    fear: MilestoneScore
    heaviness_in_body: MilestoneScore
  } | null
  positive_params: {
    energy_levels: MilestoneScore
    appetite: MilestoneScore
    sleep: MilestoneScore
    freshness_on_waking: MilestoneScore
    state_of_mind: MilestoneScore
    clarity_of_thoughts: MilestoneScore
    memory: MilestoneScore
    handling_emotions: MilestoneScore
    facing_challenges: MilestoneScore
    confidence: MilestoneScore
    acceptance: MilestoneScore
    relationship_quality: MilestoneScore
    connecting_to_higher_self: MilestoneScore
  } | null
  qualitative_feedback: {
    conditions_resolved: string
    improvements_practitioner_noticed: string
    changes_client_noticed: string
    client_learning: string
  } | null
  media_links: Json | null
  testimonial_text: string | null
  testimonial_audio_url: string | null
  testimonial_video_url: string | null
  filled_at: string | null
  created_at: string
}

export interface MediaFile {
  id: string
  client_id: string
  session_id: string | null
  file_type: string
  url: string
  mime_type: string | null
  session_number: number | null
  category: MediaCategory | null
  consent_recorded: boolean
  uploaded_at: string
}

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
        Relationships: []
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, 'id' | 'created_at'>
        Update: Partial<Omit<Session, 'id' | 'created_at'>>
        Relationships: []
      }
      form2_consent: {
        Row: Form2Consent
        Insert: Omit<Form2Consent, 'id' | 'created_at'>
        Update: Partial<Omit<Form2Consent, 'id' | 'created_at'>>
        Relationships: []
      }
      form3_case_history: {
        Row: Form3CaseHistory
        Insert: Omit<Form3CaseHistory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Form3CaseHistory, 'id' | 'created_at'>>
        Relationships: []
      }
      form4_sessions: {
        Row: Form4Session
        Insert: Omit<Form4Session, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Form4Session, 'id' | 'created_at'>>
        Relationships: []
      }
      form5_feedback: {
        Row: Form5Feedback
        Insert: Omit<Form5Feedback, 'id' | 'created_at'>
        Update: Partial<Omit<Form5Feedback, 'id' | 'created_at'>>
        Relationships: []
      }
      media_files: {
        Row: MediaFile
        Insert: Omit<MediaFile, 'id' | 'uploaded_at'>
        Update: Partial<Omit<MediaFile, 'id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
