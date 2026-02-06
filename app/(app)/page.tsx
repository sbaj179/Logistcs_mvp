import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { getCases, getShipments } from "@/lib/data";
import {
  computeActiveCasesCount,
  computeOnTimeDeliveryRate,
  computeOnTimePickupRate
} from "@/lib/metrics";
import styles from "@/styles/Page.module.css";

export default async function ControlCenterPage() {
  const [cases, shipments] = await Promise.all([getCases(), getShipments()]);
  const caseRows = cases.map((item) => ({
    shipment: item.shipmentId,
    type: item.type,
    status: item.status,
    owner: item.owner,
    sla: new Date(item.slaDue).toLocaleString()
  }));
  const onTimePickupRate = computeOnTimePickupRate(shipments, 7);
  const onTimeDeliveryRate = computeOnTimeDeliveryRate(shipments, 7);
  const activeCases = computeActiveCasesCount(cases);

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Operational Control Center"
        subtitle="Run daily execution from a single operational truth across shipments, events, cases, and documents."
        action="Create Manual Exception"
      />

      <div className={`${styles.grid} ${styles.gridThree}`}>
        <StatCard label="On-time Pickup" value={`${onTimePickupRate.toFixed(0)}%`} helper="Rolling 7 days" />
        <StatCard label="On-time Delivery" value={`${onTimeDeliveryRate.toFixed(0)}%`} helper="Rolling 7 days" />
        <StatCard label="Active Exceptions" value={`${activeCases}`} helper="Open or investigating" />
      </div>

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Shipments in Execution</div>
          <div className={styles.list}>
            {shipments.map((shipment) => (
              <div key={shipment.id}>
                <strong>{shipment.reference}</strong>
                <p>{shipment.origin} → {shipment.destination}</p>
                <span className={styles.badge}>{shipment.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Exception Playbooks</div>
          <div className={styles.list}>
            <p>Late pickup rule: Trigger case at +30 minutes.</p>
            <p>Missing POD rule: Trigger case after delivery +2 hours.</p>
            <p>Idle loss rule: Trigger case after 40 minutes idle.</p>
            <p>Manual exceptions require owner, SLA, and closure reason.</p>
          </div>
        </div>
      </div>

      <DataTable
        caption="Active cases requiring action"
        columns={[
          { key: "shipment", label: "Shipment" },
          { key: "type", label: "Case Type" },
          { key: "status", label: "Status" },
          { key: "owner", label: "Owner" },
          { key: "sla", label: "SLA Due" }
        ]}
        data={caseRows}
      />
    </div>
  );
}
