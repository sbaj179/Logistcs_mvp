import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { getShipments } from "@/lib/data";
import styles from "@/styles/Page.module.css";

export default async function ShipmentsPage() {
  const shipments = await getShipments();
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Shipments"
        subtitle="Canonical shipment records with planned vs actual execution and linked assets."
        action="Add Shipment"
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        {shipments.map((shipment) => (
          <Link key={shipment.id} href={`/shipments/${shipment.id}`} className={styles.panel}>
            <div className={styles.panelHeader}>{shipment.reference}</div>
            <p>{shipment.origin} → {shipment.destination}</p>
            <p>Planned pickup: {new Date(shipment.plannedPickup).toLocaleString()}</p>
            <p>Status: <span className={styles.badge}>{shipment.status}</span></p>
            <p>Vehicle: {shipment.assets.vehicleId}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
