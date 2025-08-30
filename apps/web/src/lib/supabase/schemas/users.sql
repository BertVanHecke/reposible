-- Type definitions
create type access as enum ('user', 'admin');

-- Table definitions
create table "users" (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table "user_access" (
    id uuid primary key default gen_random_uuid(),
    access access not null default 'user'::access,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS
alter table "public"."users" enable row level security;
alter table "public"."user_access" enable row level security;

-- RLS Policies
create policy "Users can view own data" on "public"."users"
  for select
  using (auth.uid() = id);

create policy "Users can update own data" on "public"."users"
  for update
  using (auth.uid() = id);

create policy "Users can view own access" on "public"."user_access"
  for select
  using (auth.uid() = id);

-- Database functions
create or replace function handle_new_user()
 returns trigger
 language plpgsql
 security DEFINER
as $function$begin
  insert into public.users (id, full_name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  insert into public.user_access (id)
  values (new.id);
  return new;
end;$function$
;

-- Database triggers
create trigger new_user_trigger
after insert on auth.users
for each row
execute function public.handle_new_user();
