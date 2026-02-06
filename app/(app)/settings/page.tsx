import { SectionHeader } from "@/components/SectionHeader";
import { getAuditLog, getRoleDefinitions } from "@/lib/data";
import styles from "@/styles/Page.module.css";

export default async function SettingsPage() {
  const [roleDefinitions, auditLog] = await Promise.all([getRoleDefinitions(), getAuditLog()]);
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Tenant, RBAC & Audit"
        subtitle="Multi-tenant configuration, role-based access, and immutable audit logging."
        action="Invite User"
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Role Definitions</div>
          <div className={styles.list}>
            {roleDefinitions.map((role) => (
              <p key={role.id}>{role.role}: {role.description}</p>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Audit Log</div>
          <div className={styles.list}>
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
