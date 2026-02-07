"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { listCases, listIdleSessions, listShipments } from "@/lib/data";
import type { Case, IdleSession, Shipment } from "@/lib/types";
import {
  computeDeliveryVarianceMinutes,
  computeExceptionRate,
  computeIdleCost,
  computeMedianResolution,
  computeOnTimeDeliveryRate,
  computeOnTimePickupRate,
  formatDuration
} from "@/lib/metrics";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

export default function AnalyticsPage() {
  const { tenantId, loadingTenant } = useTenant();
  const [cases, setCases] = useState<Case[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [idleSessions, setIdleSessions] = useState<IdleSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!tenantId) {
        return;
      }
      setLoading(true);
      const [casesResult, shipmentsResult, idleResult] = await Promise.all([
        listCases(tenantId),
        listShipments(tenantId),
        listIdleSessions(tenantId)
      ]);

      if (casesResult.error || shipmentsResult.error || idleResult.error) {
        setError(casesResult.error ?? shipmentsResult.error ?? idleResult.error ?? "Unable to load analytics.");
      } else {
        setCases(casesResult.data ?? []);
        setShipments(shipmentsResult.data ?? []);
        setIdleSessions(idleResult.data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    load();
  }, [tenantId]);

  const exceptionRate = computeExceptionRate(cases, shipments);
  const medianResolutionMinutes = computeMedianResolution(cases);
  const idleCost = computeIdleCost(idleSessions, 30);
  const casesByStatus = cases.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
  const pickupRate = computeOnTimePickupRate(shipments);
  const deliveryRate = computeOnTimeDeliveryRate(shipments);
  const varianceMinutes = computeDeliveryVarianceMinutes(shipments);
  const varianceLabel = `${varianceMinutes >= 0 ? "+" : ""}${Math.round(varianceMinutes)} minutes median`;

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Operational Analytics"
        subtitle="Descriptive visibility into on-time performance, exceptions, and idle costs."
        action="Export Report"
      />
      {loadingTenant ? <p>Loading tenant...</p> : null}
      {loading && !loadingTenant ? <p>Loading analytics...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <div className={`${styles.grid} ${styles.gridThree}`}>
        <StatCard label="Exception Rate" value={exceptionRate.toFixed(1)} helper="Per 100 shipments" />
        <StatCard label="Median Resolution" value={formatDuration(medianResolutionMinutes)} helper="Exceptions closed" />
        <StatCard label="Idle Cost" value={`ZAR ${idleCost.toFixed(0)}`} helper="Trailing 30 days" />
      </div>

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Cases by Status</div>
          <div className={styles.list}>
            <p>Open: {casesByStatus.Open ?? 0}</p>
            <p>Investigating: {casesByStatus.Investigating ?? 0}</p>
            <p>Awaiting Docs: {casesByStatus.AwaitingDocs ?? 0}</p>
            <p>Resolved: {casesByStatus.Resolved ?? 0}</p>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>On-time Performance</div>
          <div className={styles.list}>
            <p>Pickup on-time: {pickupRate.toFixed(0)}%</p>
            <p>Delivery on-time: {deliveryRate.toFixed(0)}%</p>
            <p>Variance to plan: {varianceLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
