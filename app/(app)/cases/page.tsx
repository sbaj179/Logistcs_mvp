import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import { getCases } from "@/lib/data";
import styles from "@/styles/Page.module.css";

export default async function CasesPage() {
  const cases = await getCases();
  const rows = cases.map((item) => ({
    id: item.id,
    shipment: item.shipmentId,
    type: item.type,
    status: item.status,
    owner: item.owner,
    sla: new Date(item.slaDue).toLocaleString()
  }));

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Exception Case Management"
        subtitle="Every exception is structured into a case with ownership, SLA discipline, and closure evidence."
        action="Create Case"
      />

      <DataTable
        caption="Active and recent cases"
        columns={[
          { key: "id", label: "Case ID" },
          { key: "shipment", label: "Shipment" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "owner", label: "Owner" },
          { key: "sla", label: "SLA Due" }
        ]}
        data={rows}
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Case Closure Discipline</div>
          <div className={styles.list}>
            <p>Closure reason required before resolution.</p>
            <p>Evidence upload mandatory for POD or compliance cases.</p>
            <p>Cases can be reopened with audit trail.</p>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Ownership & SLA</div>
          <div className={styles.list}>
            <p>Owners are assigned by rule or manual assignment.</p>
            <p>SLA timers run continuously until closure.</p>
            <p>Escalation triggered at 80% of SLA window.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
