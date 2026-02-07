import type { SupabaseClient } from "@supabase/supabase-js";

type TenantResult = { data: string | null; error: string | null };

export async function fetchTenantIdForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<TenantResult> {
  const { data, error } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data?.tenant_id) {
    return {
      data: null,
      error: "No tenant membership found. If you just signed up, try logging out/in or wait a moment."
    };
  }

  return { data: data.tenant_id as string, error: null };
}
