import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import styles from "@/styles/Page.module.css";

export default function AnalyticsPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Operational Analytics"
        subtitle="Descriptive visibility into on-time performance, exceptions, and idle costs."
        action="Export Report"
      />

      <div className={`${styles.grid} ${styles.gridThree}`}>
        <StatCard label="Exception Rate" value="8.2" helper="Per 100 shipments" />
        <StatCard label="Median Resolution" value="3h 14m" helper="Exceptions closed" />
        <StatCard label="Idle Cost" value="$1,240" helper="Trailing 30 days" />
      </div>

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Cases by Status</div>
          <div className={styles.list}>
            <p>Open: 6</p>
            <p>Investigating: 4</p>
            <p>Awaiting Docs: 3</p>
            <p>Resolved: 12</p>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>On-time Performance</div>
          <div className={styles.list}>
            <p>Pickup on-time: 92%</p>
            <p>Delivery on-time: 87%</p>
            <p>Variance to plan: +38 minutes median</p>
          </div>
        </div>
      </div>
    </div>
  );
}
