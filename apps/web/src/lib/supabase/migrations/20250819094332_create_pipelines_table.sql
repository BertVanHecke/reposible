
  create table "public"."pipelines" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "definition_json" jsonb not null,
    "layout_json" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


CREATE UNIQUE INDEX pipelines_pkey ON public.pipelines USING btree (id);

alter table "public"."pipelines" add constraint "pipelines_pkey" PRIMARY KEY using index "pipelines_pkey";

grant delete on table "public"."pipelines" to "anon";

grant insert on table "public"."pipelines" to "anon";

grant references on table "public"."pipelines" to "anon";

grant select on table "public"."pipelines" to "anon";

grant trigger on table "public"."pipelines" to "anon";

grant truncate on table "public"."pipelines" to "anon";

grant update on table "public"."pipelines" to "anon";

grant delete on table "public"."pipelines" to "authenticated";

grant insert on table "public"."pipelines" to "authenticated";

grant references on table "public"."pipelines" to "authenticated";

grant select on table "public"."pipelines" to "authenticated";

grant trigger on table "public"."pipelines" to "authenticated";

grant truncate on table "public"."pipelines" to "authenticated";

grant update on table "public"."pipelines" to "authenticated";

grant delete on table "public"."pipelines" to "service_role";

grant insert on table "public"."pipelines" to "service_role";

grant references on table "public"."pipelines" to "service_role";

grant select on table "public"."pipelines" to "service_role";

grant trigger on table "public"."pipelines" to "service_role";

grant truncate on table "public"."pipelines" to "service_role";

grant update on table "public"."pipelines" to "service_role";


