import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import { getIdleSessions } from "@/lib/data";
import { computeIdleTotals } from "@/lib/metrics";
import styles from "@/styles/Page.module.css";

export default async function IdleLossPage() {
  const idleSessions = await getIdleSessions();
  const rows = idleSessions.map((session) => ({
    vehicle: session.vehicleId,
    duration: `${session.minutes} min`,
    litres: session.litresWasted.toFixed(2),
    cost: `$${session.cost.toFixed(2)}`,
    window: `${new Date(session.start).toLocaleTimeString()} - ${new Date(session.end).toLocaleTimeString()}`
  }));
  const todayTotals = computeIdleTotals(idleSessions, 1);
  const weekTotals = computeIdleTotals(idleSessions, 7);

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Fleet Idle Loss"
        subtitle="Idle events captured from telematics and manual entries with fuel loss monetization."
        action="Log Idle Event"
      />

      <div className={`${styles.grid} ${styles.gridThree}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Today</div>
          <p>Idle minutes: {todayTotals.minutes}</p>
          <p>Fuel wasted: {todayTotals.litres.toFixed(2)} L</p>
          <p>Cost impact: ${todayTotals.cost.toFixed(2)}</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Weekly</div>
          <p>Idle minutes: {weekTotals.minutes}</p>
          <p>Fuel wasted: {weekTotals.litres.toFixed(2)} L</p>
          <p>Cost impact: ${weekTotals.cost.toFixed(2)}</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Exception Thresholds</div>
          <p>Trigger case after 40 minutes idle.</p>
          <p>Escalate at 2+ idle events/day.</p>
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
