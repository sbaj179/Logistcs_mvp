"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { Timeline } from "@/components/Timeline";
import {
  addShipmentEvent,
  getShipmentById,
  listCases,
  listDocuments,
  listEventsForShipment
} from "@/lib/data";
import type { Case, Document, Event, Shipment } from "@/lib/types";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

interface ShipmentDetailPageProps {
  params: { id: string };
}

const EVENT_TYPES: Event["type"][] = [
  "PickupPlanned",
  "DeliveryPlanned",
  "PickupActual",
  "DeliveryActual",
  "Arrival",
  "Delay",
  "IdleStart",
  "IdleEnd",
  "DocumentMissing",
  "DocumentUploaded",
  "ExceptionRaised"
];

const EVENT_SOURCES: Event["source"][] = ["Manual", "CSV", "Telematics", "API", "Email"];

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { tenantId, loadingTenant } = useTenant();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    event_type: "PickupActual" as Event["type"],
    occurred_at: "",
    source: "Manual" as Event["source"],
    summary: ""
  });

  const load = async () => {
    if (!tenantId) {
      return;
    }
    setLoading(true);
    const [shipmentResult, casesResult, documentsResult, eventsResult] = await Promise.all([
      getShipmentById(tenantId, params.id),
      listCases(tenantId),
      listDocuments(tenantId),
      listEventsForShipment(tenantId, params.id)
    ]);

    if (shipmentResult.error) {
      setError(shipmentResult.error);
      setShipment(null);
    } else {
      setShipment(shipmentResult.data ?? null);
      setError(null);
    }

    setCases(casesResult.data ?? []);
    setDocuments(documentsResult.data ?? []);
    setEvents(eventsResult.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [params.id, tenantId]);

  const handleAddEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const result = await addShipmentEvent(tenantId, params.id, {
      event_type: eventForm.event_type,
      occurred_at: eventForm.occurred_at ? new Date(eventForm.occurred_at).toISOString() : undefined,
      source: eventForm.source,
      payload: { summary: eventForm.summary }
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setEventForm({ event_type: "PickupActual", occurred_at: "", source: "Manual", summary: "" });
    await load();
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <SectionHeader
          title="Shipment"
          subtitle="Operational timeline and case execution."
          action="Log Manual Event"
        />
        <p>{loadingTenant ? "Loading tenant..." : "Loading shipment..."}</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className={styles.page}>
        <SectionHeader
          title="Shipment"
          subtitle="Operational timeline and case execution."
          action="Log Manual Event"
        />
        <p className={styles.errorText}>{error ?? "Shipment not found."}</p>
      </div>
    );
  }

  const shipmentCases = cases.filter((item) => item.shipmentId === shipment.id);
  const shipmentDocs = documents.filter((doc) => doc.shipmentId === shipment.id);

  return (
    <div className={styles.page}>
      <SectionHeader
        title={`Shipment ${shipment.reference}`}
        subtitle={`Operational timeline and case execution for ${shipment.origin} → ${shipment.destination}.`}
        action="Log Manual Event"
      />
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Shipment Details</div>
          <p>Status: {shipment.status}</p>
          <p>Mode: {shipment.mode}</p>
          <p>
            Planned pickup: {shipment.plannedPickup
              ? new Date(shipment.plannedPickup).toLocaleString()
              : "TBD"}
          </p>
          <p>
            Planned delivery: {shipment.plannedDelivery
              ? new Date(shipment.plannedDelivery).toLocaleString()
              : "TBD"}
          </p>
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
                <p>SLA due: {item.slaDue ? new Date(item.slaDue).toLocaleString() : "TBD"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Add Manual Event</div>
        <form className={styles.formGrid} onSubmit={handleAddEvent}>
          <div className={styles.field}>
            <label>Event Type</label>
            <select
              value={eventForm.event_type}
              onChange={(event) => setEventForm({ ...eventForm, event_type: event.target.value as Event["type"] })}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Occurred At</label>
            <input
              type="datetime-local"
              value={eventForm.occurred_at}
              onChange={(event) => setEventForm({ ...eventForm, occurred_at: event.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Source</label>
            <select
              value={eventForm.source}
              onChange={(event) => setEventForm({ ...eventForm, source: event.target.value as Event["source"] })}
            >
              {EVENT_SOURCES.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Summary</label>
            <textarea
              value={eventForm.summary}
              onChange={(event) => setEventForm({ ...eventForm, summary: event.target.value })}
              placeholder="Add event context"
            />
          </div>
          <div className={styles.inlineActions}>
            <button className={styles.primaryButton} type="submit">Log Manual Event</button>
          </div>
        </form>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Unified Shipment Timeline</div>
        {events.length === 0 ? <p>No events yet.</p> : <Timeline events={events} />}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Documents & Evidence</div>
        <div className={styles.list}>
          {shipmentDocs.length === 0 ? <p>No documents yet.</p> : null}
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
