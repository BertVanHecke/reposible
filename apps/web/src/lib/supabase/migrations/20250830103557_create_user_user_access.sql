create type "public"."access" as enum ('user', 'admin');


  create table "public"."user_access" (
    "id" uuid not null default gen_random_uuid(),
    "access" access not null default 'user'::access,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_access" enable row level security;


  create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "full_name" text not null,
    "email" text not null,
    "avatar_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX user_access_pkey ON public.user_access USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."user_access" add constraint "user_access_pkey" PRIMARY KEY using index "user_access_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$begin
  insert into users (id, full_name, email, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  insert into user_access (id)
  values (new.id);
  return new;
end;$function$
;

grant delete on table "public"."user_access" to "anon";

grant insert on table "public"."user_access" to "anon";

grant references on table "public"."user_access" to "anon";

grant select on table "public"."user_access" to "anon";

grant trigger on table "public"."user_access" to "anon";

grant truncate on table "public"."user_access" to "anon";

grant update on table "public"."user_access" to "anon";

grant delete on table "public"."user_access" to "authenticated";

grant insert on table "public"."user_access" to "authenticated";

grant references on table "public"."user_access" to "authenticated";

grant select on table "public"."user_access" to "authenticated";

grant trigger on table "public"."user_access" to "authenticated";

grant truncate on table "public"."user_access" to "authenticated";

grant update on table "public"."user_access" to "authenticated";

grant delete on table "public"."user_access" to "service_role";

grant insert on table "public"."user_access" to "service_role";

grant references on table "public"."user_access" to "service_role";

grant select on table "public"."user_access" to "service_role";

grant trigger on table "public"."user_access" to "service_role";

grant truncate on table "public"."user_access" to "service_role";

grant update on table "public"."user_access" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

CREATE TRIGGER new_user_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


