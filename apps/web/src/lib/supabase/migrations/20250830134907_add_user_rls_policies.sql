
  create policy "Users can view own access"
  on "public"."user_access"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Users can update own data"
  on "public"."users"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view own data"
  on "public"."users"
  as permissive
  for select
  to public
using ((auth.uid() = id));



