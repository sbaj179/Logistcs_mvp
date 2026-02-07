"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import {
  createIdleSession,
  createVehicle,
  getDefaultFuelPrice,
  listIdleSessions,
  listVehicles,
  type VehicleRecord
} from "@/lib/data";
import type { IdleSession } from "@/lib/types";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

function computeTotals(sessions: IdleSession[], fuelPrice: number, days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days);

  return sessions.reduce(
    (acc, session) => {
      const sessionStart = new Date(session.start);
      if (Number.isNaN(sessionStart.getTime()) || sessionStart < start || sessionStart > now) {
        return acc;
      }
      const litres = (session.minutes / 60) * session.fuelBurnRate;
      acc.minutes += session.minutes;
      acc.litres += litres;
      acc.cost += litres * fuelPrice;
      return acc;
    },
    { minutes: 0, litres: 0, cost: 0 }
  );
}

export default function IdleLossPage() {
  const { tenantId, loadingTenant } = useTenant();
  const [idleSessions, setIdleSessions] = useState<IdleSession[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [fuelPrice, setFuelPrice] = useState(getDefaultFuelPrice());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleForm, setVehicleForm] = useState({ vehicle_number: "", idle_burn_lph: "" });
  const [idleForm, setIdleForm] = useState({
    vehicle_id: "",
    idle_start_at: "",
    idle_end_at: "",
    idle_minutes: "",
    notes: ""
  });

  const load = async () => {
    if (!tenantId) {
      return;
    }
    setLoading(true);
    const [idleResult, vehiclesResult] = await Promise.all([
      listIdleSessions(tenantId),
      listVehicles(tenantId)
    ]);
    if (idleResult.error || vehiclesResult.error) {
      setError(idleResult.error ?? vehiclesResult.error ?? "Unable to load idle sessions.");
    } else {
      setIdleSessions(idleResult.data ?? []);
      setVehicles(vehiclesResult.data ?? []);
      setError(null);
      if (!idleForm.vehicle_id && vehiclesResult.data && vehiclesResult.data.length > 0) {
        setIdleForm((current) => ({ ...current, vehicle_id: vehiclesResult.data?.[0]?.id ?? "" }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tenantId]);

  const rows = useMemo(() => idleSessions.map((session) => {
    const litres = (session.minutes / 60) * session.fuelBurnRate;
    const cost = litres * fuelPrice;
    return {
      vehicle: session.vehicleId,
      window: `${new Date(session.start).toLocaleTimeString()} - ${new Date(session.end).toLocaleTimeString()}`,
      duration: `${session.minutes} min`,
      litres: litres.toFixed(2),
      cost: `ZAR ${cost.toFixed(2)}`
    };
  }), [idleSessions, fuelPrice]);

  const todayTotals = computeTotals(idleSessions, fuelPrice, 1);
  const weekTotals = computeTotals(idleSessions, fuelPrice, 7);

  const vehicleRows = useMemo(
    () => vehicles.map((vehicle) => ({
      number: vehicle.vehicle_number,
      burn: vehicle.idle_burn_lph ? `${vehicle.idle_burn_lph.toFixed(2)} L/h` : "-"
    })),
    [vehicles]
  );

  const handleCreateVehicle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const burnRate = Number(vehicleForm.idle_burn_lph);
    if (Number.isNaN(burnRate)) {
      setError("Idle burn rate must be a number.");
      return;
    }
    const result = await createVehicle(tenantId, {
      vehicle_number: vehicleForm.vehicle_number,
      idle_burn_lph: burnRate
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setVehicleForm({ vehicle_number: "", idle_burn_lph: "" });
    await load();
  };

  const handleCreateIdle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const minutes = Number(idleForm.idle_minutes);
    if (Number.isNaN(minutes)) {
      setError("Idle minutes must be a number.");
      return;
    }
    const result = await createIdleSession(tenantId, {
      vehicle_id: idleForm.vehicle_id,
      idle_start_at: idleForm.idle_start_at ? new Date(idleForm.idle_start_at).toISOString() : new Date().toISOString(),
      idle_end_at: idleForm.idle_end_at ? new Date(idleForm.idle_end_at).toISOString() : new Date().toISOString(),
      idle_minutes: minutes,
      notes: idleForm.notes || undefined
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setIdleForm({ vehicle_id: idleForm.vehicle_id, idle_start_at: "", idle_end_at: "", idle_minutes: "", notes: "" });
    await load();
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Fleet Idle Loss"
        subtitle="Idle events captured from telematics and manual entries with fuel loss monetization."
        action="Log Idle Event"
      />
      {loadingTenant ? <p>Loading tenant...</p> : null}
      {loading && !loadingTenant ? <p>Loading idle loss...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Fuel Price</div>
        <div className={styles.field}>
          <label>Fuel price per litre (ZAR)</label>
          <input
            type="number"
            value={fuelPrice}
            onChange={(event) => setFuelPrice(Number(event.target.value))}
            step="0.01"
          />
        </div>
      </div>

      <div className={`${styles.grid} ${styles.gridThree}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Today</div>
          <p>Idle minutes: {todayTotals.minutes}</p>
          <p>Fuel wasted: {todayTotals.litres.toFixed(2)} L</p>
          <p>Cost impact: ZAR {todayTotals.cost.toFixed(2)}</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Weekly</div>
          <p>Idle minutes: {weekTotals.minutes}</p>
          <p>Fuel wasted: {weekTotals.litres.toFixed(2)} L</p>
          <p>Cost impact: ZAR {weekTotals.cost.toFixed(2)}</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Exception Thresholds</div>
          <p>Trigger case after 40 minutes idle.</p>
          <p>Escalate at 2+ idle events/day.</p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Vehicles</div>
        <DataTable
          columns={[
            { key: "number", label: "Vehicle" },
            { key: "burn", label: "Idle Burn" }
          ]}
          data={vehicleRows}
        />
      </div>

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Add Vehicle</div>
          <form className={styles.formGrid} onSubmit={handleCreateVehicle}>
            <div className={styles.field}>
              <label>Vehicle Number</label>
              <input
                value={vehicleForm.vehicle_number}
                onChange={(event) => setVehicleForm({ ...vehicleForm, vehicle_number: event.target.value })}
                placeholder="TRK-204"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Idle Burn (L/h)</label>
              <input
                type="number"
                step="0.1"
                value={vehicleForm.idle_burn_lph}
                onChange={(event) => setVehicleForm({ ...vehicleForm, idle_burn_lph: event.target.value })}
                required
              />
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.primaryButton} type="submit">Add Vehicle</button>
            </div>
          </form>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Log Idle Session</div>
          <form className={styles.formGrid} onSubmit={handleCreateIdle}>
            <div className={styles.field}>
              <label>Vehicle</label>
              <select
                value={idleForm.vehicle_id}
                onChange={(event) => setIdleForm({ ...idleForm, vehicle_id: event.target.value })}
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicle_number}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Idle Start</label>
              <input
                type="datetime-local"
                value={idleForm.idle_start_at}
                onChange={(event) => setIdleForm({ ...idleForm, idle_start_at: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Idle End</label>
              <input
                type="datetime-local"
                value={idleForm.idle_end_at}
                onChange={(event) => setIdleForm({ ...idleForm, idle_end_at: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Idle Minutes</label>
              <input
                type="number"
                value={idleForm.idle_minutes}
                onChange={(event) => setIdleForm({ ...idleForm, idle_minutes: event.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Notes</label>
              <textarea
                value={idleForm.notes}
                onChange={(event) => setIdleForm({ ...idleForm, notes: event.target.value })}
                placeholder="Driver rest stop"
              />
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.primaryButton} type="submit">Log Idle Session</button>
            </div>
          </form>
        </div>
      </div>

      <DataTable
        caption="Idle sessions"
        columns={[
          { key: "vehicle", label: "Vehicle" },
          { key: "window", label: "Window" },
          { key: "duration", label: "Idle Minutes" },
          { key: "litres", label: "Litres Wasted" },
          { key: "cost", label: "Cost" }
        ]}
        data={rows}
      />
    </div>
  );
}
