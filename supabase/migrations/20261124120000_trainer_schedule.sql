-- Agenda do personal (v1): só o personal vê e edita os próprios horários. O aluno NÃO acessa
-- (nenhuma policy de aluno) — agendamento pelo aluno fica para uma versão futura.
create table public.trainer_schedule (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Opcional: horário pode ser bloqueio pessoal ("almoço", "avaliação externa") sem aluno.
  student_id uuid references public.students (id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  starts_at timestamptz not null,
  duration_minutes smallint not null default 60 check (duration_minutes between 5 and 600),
  location text not null default '',
  notes text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trainer_schedule_trainer_starts_idx on public.trainer_schedule (trainer_id, starts_at);

alter table public.trainer_schedule enable row level security;

-- Personal só enxerga e grava a própria agenda; aluno vinculado precisa ser aluno DELE.
create policy "trainer_schedule_all_own" on public.trainer_schedule
  for all
  using (trainer_id = auth.uid() and public.current_role() = 'trainer')
  with check (
    trainer_id = auth.uid()
    and public.current_role() = 'trainer'
    and (student_id is null or public.is_my_student(student_id))
  );

create or replace function public.trainer_schedule_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trainer_schedule_touch before update on public.trainer_schedule
  for each row execute function public.trainer_schedule_touch();
