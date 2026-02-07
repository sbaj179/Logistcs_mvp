"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { fetchTenantIdForUser } from "@/lib/tenant";
import styles from "@/styles/TenantProvider.module.css";

interface TenantContextValue {
  tenantId: string | null;
  loadingTenant: boolean;
  refreshTenant: () => Promise<void>;
  signOut: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenant = useCallback(async () => {
    setLoadingTenant(true);
    const supabase = supabaseClient;
    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !data.session?.user) {
      setTenantId(null);
      setError(sessionError?.message ?? "No active session found.");
      setLoadingTenant(false);
      return;
    }

    if (!data.session.user.email_confirmed_at) {
      setTenantId(null);
      setError("Email not verified yet.");
      setLoadingTenant(false);
      return;
    }

    const tenantResult = await fetchTenantIdForUser(supabase, data.session.user.id);
    if (tenantResult.error) {
      setTenantId(null);
      setError(tenantResult.error);
    } else {
      setTenantId(tenantResult.data);
      setError(null);
    }
    setLoadingTenant(false);
  }, []);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const refreshTenant = useCallback(async () => {
    await loadTenant();
  }, [loadTenant]);

  const signOut = useCallback(async () => {
    const supabase = supabaseClient;
    await supabase.auth.signOut();
    window.location.assign("/login");
  }, []);

  const value = useMemo(
    () => ({ tenantId, loadingTenant, refreshTenant, signOut }),
    [tenantId, loadingTenant, refreshTenant, signOut]
  );

  if (loadingTenant) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <h2>Loading workspace...</h2>
          <p>Resolving your tenant context.</p>
        </div>
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <h2>Tenant not ready</h2>
          <p>{error ?? "We could not find a tenant membership yet."}</p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={refreshTenant}>Retry</button>
            <button className={styles.secondary} onClick={signOut}>Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}
