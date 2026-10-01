-- ============================================================
-- 004 — Form 1 Initial Enquiry + extra client fields
-- Run in Supabase SQL editor after 003_form4_new_fields.sql
-- ============================================================

-- Extra client fields used by Form 1 personal tab
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS referred_by_name  text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marital_status     text
  CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'other'));

-- ============================================================
-- FORM 1 — INITIAL ENQUIRY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.form1_enquiry (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id            uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  -- Presenting concern
  presenting_concern   text,
  concern_duration     text,
  prior_therapies      text,
  current_medications  text,
  known_allergies      text,

  -- NSA background
  nsa_prior_details    text,
  nsa_knowledge        text,

  -- Goals & package
  health_goals         text,
  package_interest     text,

  -- Communication
  preferred_contact    text[],
  whatsapp_consent     boolean DEFAULT false,

  -- Practitioner notes (private)
  practitioner_notes   text,

  enquiry_date         date DEFAULT CURRENT_DATE,
  filled_at            timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  UNIQUE (client_id)
);

ALTER TABLE public.form1_enquiry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "practitioner_all_form1" ON public.form1_enquiry FOR ALL
  USING  (auth.jwt() -> 'app_metadata' ->> 'role' = 'practitioner')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'practitioner');

CREATE TRIGGER trg_form1_updated_at
  BEFORE UPDATE ON public.form1_enquiry
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
