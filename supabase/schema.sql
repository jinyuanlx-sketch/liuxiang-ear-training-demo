-- 流响音乐 · 视唱练耳训练系统
-- Initial Supabase schema for v1: sight_singing + ear_training enabled, theory reserved.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_role as enum ('student', 'teacher', 'admin', 'parent');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.training_module as enum ('sight_singing', 'ear_training', 'theory');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.assignment_type as enum (
    'sight_singing_piece',
    'single_note',
    'interval',
    'chord',
    'rhythm_choice',
    'melody_dictation',
    'theory_quiz'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.submission_status as enum (
    'not_submitted',
    'submitted',
    'auto_scored',
    'teacher_reviewed',
    'needs_redo',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.question_source_type as enum (
    'manual_create',
    'json_import',
    'musicxml_import',
    'ai_generated',
    'teacher_edited'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.question_review_status as enum (
    'draft',
    'pending_review',
    'approved',
    'archived'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.training_resource_platform as enum (
    'douyin',
    'xiaohongshu',
    'bilibili',
    'wechat_channels',
    'internal',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.training_resource_type as enum (
    'explanation',
    'demonstration',
    'correction',
    'warmup',
    'review',
    'related_content'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.training_resource_display_position as enum (
    'before_practice',
    'after_practice',
    'result_page',
    'teacher_feedback',
    'all'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  title text,
  bio text,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name text not null,
  grade text,
  city text,
  target_schools text[] not null default '{}',
  major text,
  minor text,
  exam_direction text,
  current_level text,
  training_stage text,
  current_focus text,
  teacher_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.class_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  unique (class_id, student_id)
);

create table if not exists public.sight_singing_questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level int not null check (level between 1 and 5),
  key_signature text not null,
  mode text not null default 'major',
  time_signature text not null,
  tempo int not null,
  measures_count int not null,
  clef text not null default 'treble',
  range_low text not null,
  range_high text not null,
  score_image_url text,
  pdf_url text,
  musicxml_url text,
  midi_url text,
  target_pitch_json jsonb not null default '[]'::jsonb,
  target_rhythm_json jsonb not null default '[]'::jsonb,
  rubric_json jsonb not null default '{}'::jsonb,
  difficulty_tags text[] not null default '{}',
  training_goal text,
  teacher_style_notes text,
  source_type public.question_source_type not null default 'manual_create',
  review_status public.question_review_status not null default 'draft',
  created_by uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ear_training_questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level int not null check (level between 1 and 5),
  type public.assignment_type not null,
  midi_url text,
  audio_url text,
  stimulus_json jsonb not null default '{}'::jsonb,
  answer_key_json jsonb not null default '{}'::jsonb,
  choices_json jsonb not null default '[]'::jsonb,
  explanation text,
  difficulty_tags text[] not null default '{}',
  source_type public.question_source_type not null default 'manual_create',
  review_status public.question_review_status not null default 'draft',
  created_by uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ear_training_question_type_check check (
    type in ('single_note', 'interval', 'chord', 'rhythm_choice', 'melody_dictation')
  )
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  module public.training_module not null,
  type public.assignment_type not null,
  difficulty int not null default 1 check (difficulty between 1 and 5),
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  class_id uuid references public.classes(id) on delete set null,
  student_id uuid references public.students(id) on delete cascade,
  question_id uuid,
  question_ref_type public.training_module,
  description text,
  target_data jsonb not null default '{}'::jsonb,
  score_config jsonb not null default '{}'::jsonb,
  due_date timestamptz,
  created_at timestamptz not null default now(),
  constraint assignments_target_check check (class_id is not null or student_id is not null)
);

create table if not exists public.assignment_files (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  file_url text not null,
  file_type text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  submission_type text not null,
  file_url text,
  text_answer text,
  selected_answer text,
  auto_score numeric(5,2),
  auto_result_json jsonb,
  status public.submission_status not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  text_feedback text not null,
  audio_feedback_url text,
  rating_json jsonb not null default '{}'::jsonb,
  next_steps text,
  created_at timestamptz not null default now()
);

create table if not exists public.practice_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  module public.training_module not null,
  type public.assignment_type not null,
  total_questions int not null default 0,
  correct_count int not null default 0,
  accuracy numeric(5,2) not null default 0,
  detail_json jsonb not null default '{}'::jsonb,
  practiced_at timestamptz not null default now()
);

create table if not exists public.pitch_analysis_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  target_pitch_json jsonb not null default '[]'::jsonb,
  detected_pitch_json jsonb not null default '[]'::jsonb,
  comparison_json jsonb not null default '{}'::jsonb,
  average_cent_deviation numeric(8,2),
  max_cent_deviation numeric(8,2),
  wrong_note_count int not null default 0,
  pitch_accuracy numeric(5,2),
  stability_score numeric(5,2),
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.progress_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  sight_pitch_level int not null default 1 check (sight_pitch_level between 1 and 5),
  sight_rhythm_level int not null default 1 check (sight_rhythm_level between 1 and 5),
  sight_fluency_level int not null default 1 check (sight_fluency_level between 1 and 5),
  sight_tonality_level int not null default 1 check (sight_tonality_level between 1 and 5),
  ear_single_note_level int not null default 1 check (ear_single_note_level between 1 and 5),
  ear_interval_level int not null default 1 check (ear_interval_level between 1 and 5),
  ear_chord_level int not null default 1 check (ear_chord_level between 1 and 5),
  ear_rhythm_level int not null default 1 check (ear_rhythm_level between 1 and 5),
  ear_melody_level int not null default 1 check (ear_melody_level between 1 and 5),
  theory_level int not null default 1 check (theory_level between 1 and 5),
  teacher_comment text,
  recorded_at timestamptz not null default now()
);

create table if not exists public.module_settings (
  id uuid primary key default gen_random_uuid(),
  module public.training_module not null unique,
  enabled boolean not null default false,
  display_name text not null,
  sort_order int not null default 0
);

create table if not exists public.question_generation_requests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete set null,
  module public.training_module not null default 'sight_singing',
  params_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  candidate_question_json jsonb,
  validation_result_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_validation_results (
  id uuid primary key default gen_random_uuid(),
  module public.training_module not null,
  question_id uuid not null,
  valid boolean not null default false,
  issues_json jsonb not null default '[]'::jsonb,
  checked_at timestamptz not null default now()
);

create table if not exists public.question_review_events (
  id uuid primary key default gen_random_uuid(),
  module public.training_module not null,
  question_id uuid not null,
  teacher_id uuid references public.teachers(id) on delete set null,
  action text not null,
  reason text,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.question_annotations (
  id uuid primary key default gen_random_uuid(),
  module public.training_module not null,
  question_id uuid not null,
  teacher_id uuid references public.teachers(id) on delete set null,
  level_accuracy int check (level_accuracy between 1 and 5),
  exam_like_score int check (exam_like_score between 1 and 5),
  training_value_score int check (training_value_score between 1 and 5),
  level_fit_score int check (level_fit_score between 1 and 5),
  melodic_naturalness int check (melodic_naturalness between 1 and 5),
  tonality_clarity int check (tonality_clarity between 1 and 5),
  rhythm_standardness int check (rhythm_standardness between 1 and 5),
  needs_revision boolean not null default false,
  revision_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.training_dataset_exports (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teachers(id) on delete set null,
  module public.training_module not null default 'sight_singing',
  filters_json jsonb not null default '{}'::jsonb,
  output_url text,
  row_count int not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.training_resource_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  platform public.training_resource_platform not null,
  url text not null,
  resource_type public.training_resource_type not null,
  module public.training_module not null,
  question_id uuid,
  assignment_id uuid references public.assignments(id) on delete cascade,
  display_position public.training_resource_display_position not null default 'all',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_resource_target_check check (
    question_id is not null or assignment_id is not null
  ),
  constraint training_resource_https_check check (url ~* '^https://'),
  constraint training_resource_platform_url_check check (
    platform not in ('douyin', 'xiaohongshu')
    or (
      platform = 'douyin'
      and url ~* '^https://([^/]+\.)?(douyin\.com|iesdouyin\.com|v\.douyin\.com)(/|$)'
    )
    or (
      platform = 'xiaohongshu'
      and url ~* '^https://([^/]+\.)?(xiaohongshu\.com|xhslink\.com)(/|$)'
    )
  )
);

insert into public.module_settings (module, enabled, display_name, sort_order)
values
  ('sight_singing', true, '视唱训练', 1),
  ('ear_training', true, '练耳训练', 2),
  ('theory', false, '乐理训练', 3)
on conflict (module) do update
set enabled = excluded.enabled,
    display_name = excluded.display_name,
    sort_order = excluded.sort_order;

create index if not exists idx_students_user_id on public.students(user_id);
create index if not exists idx_assignments_module on public.assignments(module);
create index if not exists idx_assignments_student_id on public.assignments(student_id);
create index if not exists idx_assignments_question on public.assignments(question_ref_type, question_id);
create index if not exists idx_sight_questions_status on public.sight_singing_questions(review_status);
create index if not exists idx_sight_questions_level_key on public.sight_singing_questions(level, key_signature);
create index if not exists idx_ear_questions_status on public.ear_training_questions(review_status);
create index if not exists idx_ear_questions_type_level on public.ear_training_questions(type, level);
create index if not exists idx_submissions_student_id on public.submissions(student_id);
create index if not exists idx_submissions_assignment_id on public.submissions(assignment_id);
create index if not exists idx_practice_records_student_id on public.practice_records(student_id);
create index if not exists idx_pitch_analysis_submission_id on public.pitch_analysis_results(submission_id);
create index if not exists idx_training_resources_question on public.training_resource_links(module, question_id, is_active, display_position, sort_order);
create index if not exists idx_training_resources_assignment on public.training_resource_links(module, assignment_id, is_active, display_position, sort_order);

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('teacher', 'admin'), false)
$$;

create or replace function public.ensure_assignment_question_is_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.question_id is null then
    return new;
  end if;

  if new.module = 'sight_singing' then
    if not exists (
      select 1
      from public.sight_singing_questions
      where id = new.question_id
        and review_status = 'approved'
    ) then
      raise exception 'Only approved sight singing questions can be assigned.';
    end if;
  elsif new.module = 'ear_training' then
    if not exists (
      select 1
      from public.ear_training_questions
      where id = new.question_id
        and review_status = 'approved'
    ) then
      raise exception 'Only approved ear training questions can be assigned.';
    end if;
  elsif new.module = 'theory' then
    raise exception 'Theory assignments are reserved in v1.';
  end if;

  return new;
end;
$$;

drop trigger if exists assignments_question_approved_guard on public.assignments;
create trigger assignments_question_approved_guard
before insert or update of question_id, module on public.assignments
for each row execute function public.ensure_assignment_question_is_approved();

alter table public.users enable row level security;
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.classes enable row level security;
alter table public.class_students enable row level security;
alter table public.sight_singing_questions enable row level security;
alter table public.ear_training_questions enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_files enable row level security;
alter table public.submissions enable row level security;
alter table public.feedback enable row level security;
alter table public.practice_records enable row level security;
alter table public.pitch_analysis_results enable row level security;
alter table public.progress_records enable row level security;
alter table public.module_settings enable row level security;
alter table public.question_generation_requests enable row level security;
alter table public.question_validation_results enable row level security;
alter table public.question_review_events enable row level security;
alter table public.question_annotations enable row level security;
alter table public.training_dataset_exports enable row level security;
alter table public.training_resource_links enable row level security;

drop policy if exists "users_select_own_or_staff" on public.users;
create policy "users_select_own_or_staff"
on public.users for select
using (id = auth.uid() or public.is_staff());

drop policy if exists "users_staff_manage" on public.users;
create policy "users_staff_manage"
on public.users for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "students_select_self_or_staff" on public.students;
create policy "students_select_self_or_staff"
on public.students for select
using (user_id = auth.uid() or public.is_staff());

drop policy if exists "students_staff_manage" on public.students;
create policy "students_staff_manage"
on public.students for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "teachers_select_all" on public.teachers;
create policy "teachers_select_all"
on public.teachers for select
using (true);

drop policy if exists "teachers_staff_manage" on public.teachers;
create policy "teachers_staff_manage"
on public.teachers for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "classes_staff_manage" on public.classes;
create policy "classes_staff_manage"
on public.classes for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "class_students_staff_manage" on public.class_students;
create policy "class_students_staff_manage"
on public.class_students for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "sight_questions_select_approved_or_staff" on public.sight_singing_questions;
create policy "sight_questions_select_approved_or_staff"
on public.sight_singing_questions for select
using (review_status = 'approved' or public.is_staff());

drop policy if exists "sight_questions_staff_manage" on public.sight_singing_questions;
create policy "sight_questions_staff_manage"
on public.sight_singing_questions for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "ear_questions_select_approved_or_staff" on public.ear_training_questions;
create policy "ear_questions_select_approved_or_staff"
on public.ear_training_questions for select
using (review_status = 'approved' or public.is_staff());

drop policy if exists "ear_questions_staff_manage" on public.ear_training_questions;
create policy "ear_questions_staff_manage"
on public.ear_training_questions for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "assignments_select_self_or_staff" on public.assignments;
create policy "assignments_select_self_or_staff"
on public.assignments for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.students
    where students.id = assignments.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "assignments_staff_manage" on public.assignments;
create policy "assignments_staff_manage"
on public.assignments for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "assignment_files_select_self_or_staff" on public.assignment_files;
create policy "assignment_files_select_self_or_staff"
on public.assignment_files for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.assignments
    join public.students on students.id = assignments.student_id
    where assignments.id = assignment_files.assignment_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "assignment_files_staff_manage" on public.assignment_files;
create policy "assignment_files_staff_manage"
on public.assignment_files for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "submissions_select_self_or_staff" on public.submissions;
create policy "submissions_select_self_or_staff"
on public.submissions for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.students
    where students.id = submissions.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "submissions_student_insert" on public.submissions;
create policy "submissions_student_insert"
on public.submissions for insert
with check (
  exists (
    select 1
    from public.students
    where students.id = submissions.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "submissions_staff_update" on public.submissions;
create policy "submissions_staff_update"
on public.submissions for update
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "feedback_select_self_or_staff" on public.feedback;
create policy "feedback_select_self_or_staff"
on public.feedback for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.submissions
    join public.students on students.id = submissions.student_id
    where submissions.id = feedback.submission_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "feedback_staff_manage" on public.feedback;
create policy "feedback_staff_manage"
on public.feedback for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "practice_records_select_self_or_staff" on public.practice_records;
create policy "practice_records_select_self_or_staff"
on public.practice_records for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.students
    where students.id = practice_records.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "practice_records_student_insert" on public.practice_records;
create policy "practice_records_student_insert"
on public.practice_records for insert
with check (
  exists (
    select 1
    from public.students
    where students.id = practice_records.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "pitch_analysis_select_self_or_staff" on public.pitch_analysis_results;
create policy "pitch_analysis_select_self_or_staff"
on public.pitch_analysis_results for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.students
    where students.id = pitch_analysis_results.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "pitch_analysis_student_insert" on public.pitch_analysis_results;
create policy "pitch_analysis_student_insert"
on public.pitch_analysis_results for insert
with check (
  exists (
    select 1
    from public.students
    where students.id = pitch_analysis_results.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "progress_records_select_self_or_staff" on public.progress_records;
create policy "progress_records_select_self_or_staff"
on public.progress_records for select
using (
  public.is_staff()
  or exists (
    select 1
    from public.students
    where students.id = progress_records.student_id
      and students.user_id = auth.uid()
  )
);

drop policy if exists "progress_records_staff_manage" on public.progress_records;
create policy "progress_records_staff_manage"
on public.progress_records for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "module_settings_readable" on public.module_settings;
create policy "module_settings_readable"
on public.module_settings for select
using (true);

drop policy if exists "module_settings_staff_manage" on public.module_settings;
create policy "module_settings_staff_manage"
on public.module_settings for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "question_generation_staff_manage" on public.question_generation_requests;
create policy "question_generation_staff_manage"
on public.question_generation_requests for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "question_validation_staff_manage" on public.question_validation_results;
create policy "question_validation_staff_manage"
on public.question_validation_results for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "question_review_staff_manage" on public.question_review_events;
create policy "question_review_staff_manage"
on public.question_review_events for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "question_annotations_staff_manage" on public.question_annotations;
create policy "question_annotations_staff_manage"
on public.question_annotations for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "training_exports_staff_manage" on public.training_dataset_exports;
create policy "training_exports_staff_manage"
on public.training_dataset_exports for all
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "training_resources_select_active_or_staff" on public.training_resource_links;
create policy "training_resources_select_active_or_staff"
on public.training_resource_links for select
using (is_active = true or public.is_staff());

drop policy if exists "training_resources_staff_manage" on public.training_resource_links;
create policy "training_resources_staff_manage"
on public.training_resource_links for all
using (public.is_staff())
with check (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submissions',
  'submissions',
  false,
  52428800,
  array['audio/webm', 'audio/mpeg', 'audio/wav', 'image/png', 'image/jpeg', 'application/pdf']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'question-assets',
  'question-assets',
  false,
  52428800,
  array['audio/midi', 'audio/mpeg', 'audio/wav', 'image/png', 'image/jpeg', 'application/pdf', 'application/xml', 'text/xml']
)
on conflict (id) do nothing;

drop policy if exists "submission_files_staff_read" on storage.objects;
create policy "submission_files_staff_read"
on storage.objects for select
using (bucket_id = 'submissions' and public.is_staff());

drop policy if exists "submission_files_owner_read" on storage.objects;
create policy "submission_files_owner_read"
on storage.objects for select
using (
  bucket_id = 'submissions'
  and owner = auth.uid()
);

drop policy if exists "submission_files_owner_insert" on storage.objects;
create policy "submission_files_owner_insert"
on storage.objects for insert
with check (
  bucket_id = 'submissions'
  and owner = auth.uid()
);

drop policy if exists "question_assets_staff_manage" on storage.objects;
create policy "question_assets_staff_manage"
on storage.objects for all
using (bucket_id = 'question-assets' and public.is_staff())
with check (bucket_id = 'question-assets' and public.is_staff());

drop policy if exists "question_assets_approved_read" on storage.objects;
create policy "question_assets_approved_read"
on storage.objects for select
using (bucket_id = 'question-assets' and auth.uid() is not null);
