-- Table definition
create table "pipelines" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  definition_json jsonb not null,
  layout_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table "pipelines" enable row level security;