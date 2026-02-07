"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { createShipment, listShipments } from "@/lib/data";
import type { Shipment } from "@/lib/types";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

const STATUS_OPTIONS: Shipment["status"][] = ["Planned", "InTransit", "Delayed", "Delivered", "Closed"];

export default function ShipmentsPage() {
  const { tenantId, loadingTenant } = useTenant();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    reference: "",
    origin: "",
    destination: "",
    status: "Planned" as Shipment["status"],
    plannedPickup: "",
    plannedDelivery: ""
  });

  const load = async () => {
    if (!tenantId) {
      return;
    }
    setLoading(true);
    const result = await listShipments(tenantId);
    if (result.error) {
      setError(result.error);
    } else {
      setShipments(result.data ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tenantId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const result = await createShipment(tenantId, {
      reference: form.reference,
      origin: form.origin,
      destination: form.destination,
      status: form.status,
      planned_pickup_at: form.plannedPickup ? new Date(form.plannedPickup).toISOString() : "",
      planned_delivery_at: form.plannedDelivery ? new Date(form.plannedDelivery).toISOString() : ""
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setForm({
      reference: "",
      origin: "",
      destination: "",
      status: "Planned",
      plannedPickup: "",
      plannedDelivery: ""
    });
    await load();
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Shipments"
        subtitle="Canonical shipment records with planned vs actual execution and linked assets."
        action="Add Shipment"
      />
      {loadingTenant ? <p>Loading tenant...</p> : null}
      {loading && !loadingTenant ? <p>Loading shipments...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Create Shipment</div>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Reference</label>
            <input
              value={form.reference}
              onChange={(event) => setForm({ ...form, reference: event.target.value })}
              placeholder="RDL-SEA-9012"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as Shipment["status"] })}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Origin</label>
            <input
              value={form.origin}
              onChange={(event) => setForm({ ...form, origin: event.target.value })}
              placeholder="Seattle, WA"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Destination</label>
            <input
              value={form.destination}
              onChange={(event) => setForm({ ...form, destination: event.target.value })}
              placeholder="Boise, ID"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Planned Pickup</label>
            <input
              type="datetime-local"
              value={form.plannedPickup}
              onChange={(event) => setForm({ ...form, plannedPickup: event.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Planned Delivery</label>
            <input
              type="datetime-local"
              value={form.plannedDelivery}
              onChange={(event) => setForm({ ...form, plannedDelivery: event.target.value })}
            />
          </div>
          <div className={styles.inlineActions}>
            <button className={styles.primaryButton} type="submit">Create Shipment</button>
          </div>
        </form>
      </div>

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        {shipments.length === 0 && !loading ? <p>No shipments yet.</p> : null}
        {shipments.map((shipment) => (
          <Link key={shipment.id} href={`/shipments/${shipment.id}`} className={styles.panel}>
            <div className={styles.panelHeader}>{shipment.reference}</div>
            <p>{shipment.origin} → {shipment.destination}</p>
            <p>
              Planned pickup: {shipment.plannedPickup
                ? new Date(shipment.plannedPickup).toLocaleString()
                : "TBD"}
            </p>
            <p>Status: <span className={styles.badge}>{shipment.status}</span></p>
            <p>Vehicle: {shipment.assets.vehicleId}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
