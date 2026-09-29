-- ============================================================
-- Meru Chikitsa Practice Manager — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- CLIENTS
-- ============================================================
create table public.clients (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users(id) on delete set null,
  case_study_number   text unique not null,

  -- Personal info
  full_name           text not null,
  email               text,
  phone               text,
  date_of_birth       date,
  gender              text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  occupation          text,
  address             text,

  -- Emergency contact
  emergency_name      text,
  emergency_phone     text,
  emergency_relation  text,

  -- Clinical
  nsa_level           text check (nsa_level in ('Level 1', 'Level 2', 'Level 3')),
  contraindications   text,
  total_sessions_planned integer default 24,

  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.clients enable row level security;

-- Practitioner can see all clients; client can see only their own row
create policy "practitioner_all_clients"
  on public.clients for all
  using (auth.jwt() ->> 'role' = 'practitioner')
  with check (auth.jwt() ->> 'role' = 'practitioner');

create policy "client_own_row"
  on public.clients for select
  using (user_id = auth.uid());

-- ============================================================
-- SESSIONS
-- ============================================================
create table public.sessions (
  id             uuid primary key default uuid_generate_v4(),
  client_id      uuid not null references public.clients(id) on delete cascade,
  session_number integer not null,
  session_date   date not null default current_date,
  status         text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (client_id, session_number)
);

alter table public.sessions enable row level security;

create policy "practitioner_all_sessions"
  on public.sessions for all
  using (auth.jwt() ->> 'role' = 'practitioner')
  with check (auth.jwt() ->> 'role' = 'practitioner');

create policy "client_own_sessions"
  on public.sessions for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- ============================================================
-- FORM 2 — CONSENT
-- ============================================================
create table public.form2_consent (
  id                  uuid primary key default uuid_generate_v4(),
  client_id           uuid not null references public.clients(id) on delete cascade,
  clauses_accepted    jsonb,
  research_consent    boolean default false,
  client_signature    text,
  guardian_signature  text,
  signed_at           timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (client_id)
);

alter table public.form2_consent enable row level security;

create policy "practitioner_all_form2"
  on public.form2_consent for all
  using (auth.jwt() ->> 'role' = 'practitioner')
  with check (auth.jwt() ->> 'role' = 'practitioner');

create policy "client_own_form2"
  on public.form2_consent for all
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  )
  with check (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- ============================================================
-- FORM 3 — CASE HISTORY
-- ============================================================
create table public.form3_case_history (
  id                            uuid primary key default uuid_generate_v4(),
  client_id                     uuid not null references public.clients(id) on delete cascade,

  -- Symptoms
  chief_complaint               text,
  complaint_onset               text,
  complaint_areas               text[],

  -- Health history
  accidents                     text,
  surgeries                     text,
  hospitalisations              text,
  major_illnesses               text,
  emotional_trauma              text,
  birth_complications           text,
  family_history                text,
  menstrual_history             text,

  -- Lifestyle
  diet                          text,
  exercise                      text,
  sleep_hours                   text,
  stress_description            text,

  -- Current treatment
  primary_physician             text,
  current_diagnosis             text,
  current_medications           text,
  prior_therapies               text,

  -- Severity (jsonb: { "Pain": { score: 3, remarks: "..." }, ... })
  symptom_severity              jsonb default '{}',

  -- Vision & expectations
  vision_for_health             text,
  desired_changes               text,
  goals                         text,
  life_if_well                  text,

  -- Practitioner signature (Form 3 sign tab)
  practitioner_signature        text,

  filled_at                     timestamptz,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now(),
  unique (client_id)
);

alter table public.form3_case_history enable row level security;

create policy "practitioner_all_form3"
  on public.form3_case_history for all
  using (auth.jwt() ->> 'role' = 'practitioner')
  with check (auth.jwt() ->> 'role' = 'practitioner');

create policy "client_own_form3"
  on public.form3_case_history for all
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  )
  with check (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- ============================================================
-- FORM 4 — SESSION RECORD
-- ============================================================
create table public.form4_sessions (
  id                    uuid primary key default uuid_generate_v4(),
  session_id            uuid not null references public.sessions(id) on delete cascade,
  client_id             uuid not null references public.clients(id) on delete cascade,

  -- Neural tension readings (jsonb array of { test, side, before, during, after })
  neural_tension        jsonb default '[]',

  -- Leg check
  leg_check             text[],

  -- Neck & spine (jsonb: { cervical: { before, after, remarks }, ... })
  neck_spine            jsonb default '{}',

  -- Body diagram dots (jsonb array of { x, y, phase, label })
  body_dots             jsonb default '[]',

  -- General assessment sliders
  energy_before         integer,
  energy_after          integer,
  lightness_before      integer,
  lightness_after       integer,
  state_of_mind_before  integer,
  state_of_mind_after   integer,
  assessment_remarks    text,

  -- NSA / SRI
  nsa_level             text,
  sri_stages            integer[],
  wave_types            text[],

  -- Notes
  client_sharing_before   text,
  practitioner_notes      text,
  client_sharing_after    text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (session_id)
);

alter table public.form4_sessions enable row level security;

create policy "practitioner_all_form4"
  on public.form4_sessions for all
  using (auth.jwt() ->> 'role' = 'practitioner')
  with check (auth.jwt() ->> 'role' = 'practitioner');

-- ============================================================
-- FORM 5 — MILESTONE FEEDBACK
-- ============================================================
create table public.form5_feedback (
  id                    uuid primary key default uuid_generate_v4(),
  client_id             uuid not null references public.clients(id) on delete cascade,
  session_number        integer not null check (session_number in (0, 8, 16, 24)),

  -- Scored parameters (jsonb: { "Pain": { score: 3, remarks: "..." }, ... })
  negative_params       jsonb default '{}',
  positive_params       jsonb default '{}',

  -- Qualitative (session 8/16/24)
  qualitative_feedback  jsonb,

  -- Testimonial (session 24 only)
  testimonial_text      text,

  filled_at             timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (client_id, session_number)
);

alter table public.form5_feedback enable row level security;

create policy "practitioner_all_form5"
  on public.form5_feedback for all
  using (auth.jwt() ->> 'role' = 'practitioner')
  with check (auth.jwt() ->> 'role' = 'practitioner');

create policy "client_own_form5"
  on public.form5_feedback for all
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  )
  with check (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- ============================================================
-- MEDIA FILES
-- ============================================================
create table public.media_files (
  id            uuid primary key default uuid_generate_v4(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  session_id    uuid references public.sessions(id) on delete set null,
  bucket        text not null default 'media',
  path          text not null,
  file_type     text,
  label         text,
  created_at    timestamptz not null default now()
);

alter table public.media_files enable row level security;

create policy "practitioner_all_media"
  on public.media_files for all
  using (auth.jwt() ->> 'role' = 'practitioner')
  with check (auth.jwt() ->> 'role' = 'practitioner');

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute procedure public.set_updated_at();

create trigger trg_sessions_updated_at
  before update on public.sessions
  for each row execute procedure public.set_updated_at();

create trigger trg_form2_updated_at
  before update on public.form2_consent
  for each row execute procedure public.set_updated_at();

create trigger trg_form3_updated_at
  before update on public.form3_case_history
  for each row execute procedure public.set_updated_at();

create trigger trg_form4_updated_at
  before update on public.form4_sessions
  for each row execute procedure public.set_updated_at();

create trigger trg_form5_updated_at
  before update on public.form5_feedback
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- STORAGE BUCKET (run in Supabase dashboard or via CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('media', 'media', false);
-- create policy "practitioner_media_upload"
--   on storage.objects for insert
--   with check (bucket_id = 'media' and auth.jwt() ->> 'role' = 'practitioner');
-- create policy "practitioner_media_read"
--   on storage.objects for select
--   using (bucket_id = 'media' and auth.jwt() ->> 'role' = 'practitioner');
