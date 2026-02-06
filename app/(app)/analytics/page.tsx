import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { getCases, getIdleSessions, getShipments } from "@/lib/data";
import {
  computeDeliveryVarianceMinutes,
  computeExceptionRate,
  computeIdleCost,
  computeMedianResolution,
  computeOnTimeDeliveryRate,
  computeOnTimePickupRate,
  formatDuration
} from "@/lib/metrics";
import styles from "@/styles/Page.module.css";

export default async function AnalyticsPage() {
  const [cases, shipments, idleSessions] = await Promise.all([
    getCases(),
    getShipments(),
    getIdleSessions()
  ]);
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

      <div className={`${styles.grid} ${styles.gridThree}`}>
        <StatCard label="Exception Rate" value={exceptionRate.toFixed(1)} helper="Per 100 shipments" />
        <StatCard label="Median Resolution" value={formatDuration(medianResolutionMinutes)} helper="Exceptions closed" />
        <StatCard label="Idle Cost" value={`$${idleCost.toFixed(0)}`} helper="Trailing 30 days" />
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
