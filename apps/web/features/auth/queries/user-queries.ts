import { createClient } from "../../../lib/supabase/factories/server";

export async function getUserQuery() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .maybeSingle();

  if (!data || error) {
    throw new Error(error?.message || `No user was found`);
  }

  return data;
}
