"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { addShipmentEvent, listIntegrationHealth } from "@/lib/data";
import type { Event, IntegrationHealth } from "@/lib/types";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

const EVENT_TYPES: Event["type"][] = [
  "PickupActual",
  "DeliveryActual",
  "Delay",
  "IdleStart",
  "IdleEnd",
  "DocumentMissing",
  "DocumentUploaded",
  "ExceptionRaised"
];

const EVENT_SOURCES: Event["source"][] = ["Manual", "CSV", "Telematics", "Email", "API"];

export default function IngestionPage() {
  const { tenantId, loadingTenant } = useTenant();
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    shipmentId: "",
    eventType: "PickupActual" as Event["type"],
    timestamp: "",
    source: "Manual" as Event["source"],
    summary: ""
  });

  const load = async () => {
    if (!tenantId) {
      return;
    }
    setLoading(true);
    const result = await listIntegrationHealth(tenantId);
    if (result.error) {
      setError(result.error);
    } else {
      setIntegrationHealth(result.data ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tenantId]);

  const handleLogEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    if (!form.shipmentId) {
      setError("Shipment ID is required.");
      return;
    }
    const result = await addShipmentEvent(tenantId, form.shipmentId, {
      event_type: form.eventType,
      occurred_at: form.timestamp ? new Date(form.timestamp).toISOString() : undefined,
      source: form.source,
      payload: { summary: form.summary }
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setForm({ shipmentId: "", eventType: "PickupActual", timestamp: "", source: "Manual", summary: "" });
    await load();
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Event Ingestion"
        subtitle="Manual, CSV, telematics, and email-forwarded documents normalized into immutable events."
        action="Upload CSV"
      />
      {loadingTenant ? <p>Loading tenant...</p> : null}
      {loading && !loadingTenant ? <p>Loading ingestion data...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Manual Event Entry</div>
          <form className={styles.formGrid} onSubmit={handleLogEvent}>
            <div className={styles.field}>
              <label>Shipment ID</label>
              <input
                placeholder="Shipment UUID"
                value={form.shipmentId}
                onChange={(event) => setForm({ ...form, shipmentId: event.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Event Type</label>
              <select
                value={form.eventType}
                onChange={(event) => setForm({ ...form, eventType: event.target.value as Event["type"] })}
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Timestamp</label>
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={(event) => setForm({ ...form, timestamp: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Source</label>
              <select
                value={form.source}
                onChange={(event) => setForm({ ...form, source: event.target.value as Event["source"] })}
              >
                {EVENT_SOURCES.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Summary</label>
              <textarea
                placeholder="Add event context"
                value={form.summary}
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
              />
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.primaryButton} type="submit">Log Immutable Event</button>
              <button className={styles.secondaryButton} type="button">Validate Only</button>
            </div>
          </form>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Integration Health</div>
          <div className={styles.list}>
            {integrationHealth.length === 0 && !loading ? <p>No integration health records yet.</p> : null}
            {integrationHealth.map((item) => (
              <p key={item.id}>
                {item.source}: {item.status} ({item.detail})
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
