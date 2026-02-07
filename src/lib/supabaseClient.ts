import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const demoTenantId = process.env.NEXT_PUBLIC_DEMO_TENANT_ID ?? "";

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  const urlLoaded = supabaseUrl.length > 0;
  const anonKeyLoaded = supabaseAnonKey.length > 0;
  const demoTenantLoaded = demoTenantId.length > 0;
  console.info(
    `[supabase] url loaded: ${urlLoaded ? "yes" : "no"}, anon key loaded: ${
      anonKeyLoaded ? "yes" : "no"
    }, demo tenant loaded: ${demoTenantLoaded ? "yes" : "no"}`
  );
}

function getRequiredSupabaseEnv() {
  if (!supabaseUrl || !supabaseAnonKey || !demoTenantId) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_DEMO_TENANT_ID"
    );
  }

  return { supabaseUrl, supabaseAnonKey, demoTenantId };
}

let cachedClient: ReturnType<typeof createClient> | null = null;

export const DEMO_TENANT_ID = getRequiredSupabaseEnv().demoTenantId;

export const supabaseClient = (() => {
  if (cachedClient) {
    return cachedClient;
  }

  const { supabaseUrl: url, supabaseAnonKey: anonKey } = getRequiredSupabaseEnv();
  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });

  return cachedClient;
})();
