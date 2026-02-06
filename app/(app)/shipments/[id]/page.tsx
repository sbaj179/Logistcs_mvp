import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/SectionHeader";
import { Timeline } from "@/components/Timeline";
import { cases, documents, events, shipments } from "@/lib/sampleData";
import styles from "@/styles/Page.module.css";

interface ShipmentDetailPageProps {
  params: { id: string };
}

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const shipment = shipments.find((item) => item.id === params.id);

  if (!shipment) {
    notFound();
  }

  const shipmentEvents = events.filter((event) => event.shipmentId === shipment.id);
  const shipmentCases = cases.filter((item) => item.shipmentId === shipment.id);
  const shipmentDocs = documents.filter((doc) => doc.shipmentId === shipment.id);

  return (
    <div className={styles.page}>
      <SectionHeader
        title={`Shipment ${shipment.reference}`}
        subtitle={`Operational timeline and case execution for ${shipment.origin} → ${shipment.destination}.`}
        action="Log Manual Event"
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Shipment Details</div>
          <p>Status: {shipment.status}</p>
          <p>Mode: {shipment.mode}</p>
          <p>Planned pickup: {new Date(shipment.plannedPickup).toLocaleString()}</p>
          <p>Planned delivery: {new Date(shipment.plannedDelivery).toLocaleString()}</p>
          <p>Actual pickup: {shipment.actualPickup ? new Date(shipment.actualPickup).toLocaleString() : "Pending"}</p>
          <p>Actual delivery: {shipment.actualDelivery ? new Date(shipment.actualDelivery).toLocaleString() : "Pending"}</p>
          <p>Vehicle: {shipment.assets.vehicleId}</p>
          <p>Driver: {shipment.assets.driver ?? "Unassigned"}</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Linked Cases</div>
          <div className={styles.list}>
            {shipmentCases.length === 0 ? <p>No open cases.</p> : null}
            {shipmentCases.map((item) => (
              <div key={item.id}>
                <strong>{item.type}</strong>
                <p>Status: {item.status}</p>
                <p>Owner: {item.owner}</p>
                <p>SLA due: {new Date(item.slaDue).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Unified Shipment Timeline</div>
        <Timeline events={shipmentEvents} />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Documents & Evidence</div>
        <div className={styles.list}>
          {shipmentDocs.map((doc) => (
            <div key={doc.id}>
              <strong>{doc.name}</strong>
              <p>Type: {doc.type}</p>
              <p>Uploaded: {new Date(doc.uploadedAt).toLocaleString()} by {doc.uploadedBy}</p>
              <p>Hash: {doc.referenceHash}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
