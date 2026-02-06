import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import { idleSessions } from "@/lib/sampleData";
import styles from "@/styles/Page.module.css";

export default function IdleLossPage() {
  const rows = idleSessions.map((session) => ({
    vehicle: session.vehicleId,
    duration: `${session.minutes} min`,
    litres: session.litresWasted.toFixed(2),
    cost: `$${session.cost.toFixed(2)}`,
    window: `${new Date(session.start).toLocaleTimeString()} - ${new Date(session.end).toLocaleTimeString()}`
  }));

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
          <p>Idle minutes: 88</p>
          <p>Fuel wasted: 3.97 L</p>
          <p>Cost impact: $5.56</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Weekly</div>
          <p>Idle minutes: 426</p>
          <p>Fuel wasted: 19.3 L</p>
          <p>Cost impact: $27.40</p>
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
