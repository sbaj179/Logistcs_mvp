"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { listAuditLogs, listRoleDefinitions } from "@/lib/data";
import type { AuditLogEntry, RoleDefinition } from "@/lib/types";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

export default function SettingsPage() {
  const { tenantId, loadingTenant } = useTenant();
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenantId) {
        return;
      }
      setLoading(true);
      const [rolesResult, auditResult] = await Promise.all([
        listRoleDefinitions(tenantId),
        listAuditLogs(tenantId)
      ]);
      if (rolesResult.error || auditResult.error) {
        setError(rolesResult.error ?? auditResult.error ?? "Unable to load settings.");
      } else {
        setRoleDefinitions(rolesResult.data ?? []);
        setAuditLog(auditResult.data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    load();
  }, [tenantId]);

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Tenant, RBAC & Audit"
        subtitle="Multi-tenant configuration, role-based access, and immutable audit logging."
        action="Invite User"
      />
      {loadingTenant ? <p>Loading tenant...</p> : null}
      {loading && !loadingTenant ? <p>Loading tenant settings...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Role Definitions</div>
          <div className={styles.list}>
            {roleDefinitions.length === 0 && !loading ? <p>No roles yet.</p> : null}
            {roleDefinitions.map((role) => (
              <p key={role.id}>{role.role}: {role.description}</p>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Audit Log</div>
          <div className={styles.list}>
            {auditLog.length === 0 && !loading ? <p>No audit entries yet.</p> : null}
            {auditLog.map((entry) => (
              <p key={entry.id}>
                {entry.actor} · {entry.action} · {new Date(entry.timestamp).toLocaleString()}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
