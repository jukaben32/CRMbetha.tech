-- Esquema inicial del CRM de leads: projects, leads, lead_notes, tasks.
-- RLS: solo usuarios autenticados leen/escriben. El endpoint público de
-- leads inserta desde el servidor con la service_role key, que se salta
-- RLS por diseño de Supabase; anon/público no tiene ningún permiso directo.

create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  color text not null default '#6d8bff',
  allowed_origin text,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  name text not null,
  email text,
  phone text,
  message text,
  stage text not null default 'nuevo'
    check (stage in ('nuevo', 'contactado', 'demo', 'propuesta', 'ganado', 'perdido')),
  source text not null default 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  fbclid text,
  landing_url text,
  consent boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists leads_project_id_idx on leads(project_id);
create index if not exists leads_stage_idx on leads(stage);
create index if not exists leads_created_at_idx on leads(created_at desc);

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx on lead_notes(lead_id);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_lead_id_idx on tasks(lead_id);
create index if not exists tasks_due_at_idx on tasks(due_at) where done = false;

alter table projects enable row level security;
alter table leads enable row level security;
alter table lead_notes enable row level security;
alter table tasks enable row level security;

create policy "authenticated full access" on projects
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on leads
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on lead_notes
  for all to authenticated using (true) with check (true);

create policy "authenticated full access" on tasks
  for all to authenticated using (true) with check (true);

-- Semilla: proyectos que se conectarán en la Fase 8.
-- allowed_origin nulo = sin restricción de CORS todavía (se define
-- antes de conectar el formulario real de esa landing).
insert into projects (slug, name, color, allowed_origin) values
  ('agencia', 'Landing Agencia', '#6d8bff', null),
  ('colegio-manantial', 'Colegio Manantial (landing n8n school)', '#7c5cff', 'https://www.educacionmanantial.com'),
  ('nailatelier', 'NailAtelier', '#ff6db4', 'https://nailatelier.vercel.app')
on conflict (slug) do nothing;
