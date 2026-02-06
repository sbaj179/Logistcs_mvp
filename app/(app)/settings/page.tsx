import { SectionHeader } from "@/components/SectionHeader";
import styles from "@/styles/Page.module.css";

export default function SettingsPage() {
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
            <p>Admin: Full tenant configuration and user access.</p>
            <p>Operations: Execution control, cases, and manual ingestion.</p>
            <p>Compliance: Document vault, audit exports, closure approvals.</p>
            <p>Read-only: Customer view of shipment timeline.</p>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Audit Log</div>
          <div className={styles.list}>
            <p>Audit logs are immutable and exportable.</p>
            <p>Every change captures actor, timestamp, and entity.</p>
            <p>Manual overrides flagged for review.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
