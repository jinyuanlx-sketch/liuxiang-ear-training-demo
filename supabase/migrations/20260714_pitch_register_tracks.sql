alter table public.pitch_analysis_results
  add column if not exists voice_type text not null default 'female',
  add column if not exists written_target_pitch_json jsonb not null default '[]'::jsonb,
  add column if not exists expected_sounding_pitch_json jsonb not null default '[]'::jsonb,
  add column if not exists raw_detected_pitch_json jsonb not null default '[]'::jsonb,
  add column if not exists scoring_adjusted_pitch_json jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pitch_analysis_results_voice_type_check'
  ) then
    alter table public.pitch_analysis_results
      add constraint pitch_analysis_results_voice_type_check
      check (voice_type in ('female', 'male'));
  end if;
end $$;
