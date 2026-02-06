import { SectionHeader } from "@/components/SectionHeader";
import styles from "@/styles/Page.module.css";

export default function IngestionPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Event Ingestion"
        subtitle="Manual, CSV, telematics, and email-forwarded documents normalized into immutable events."
        action="Upload CSV"
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Manual Event Entry</div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Shipment ID</label>
              <input placeholder="ship_9012" />
            </div>
            <div className={styles.field}>
              <label>Event Type</label>
              <select>
                <option>PickupActual</option>
                <option>DeliveryActual</option>
                <option>Delay</option>
                <option>IdleStart</option>
                <option>IdleEnd</option>
                <option>DocumentMissing</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Timestamp</label>
              <input type="datetime-local" />
            </div>
            <div className={styles.field}>
              <label>Source</label>
              <select>
                <option>Manual</option>
                <option>CSV</option>
                <option>Telematics</option>
                <option>Email</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Summary</label>
              <textarea placeholder="Add event context" />
            </div>
          </div>
          <div className={styles.inlineActions}>
            <button className={styles.primaryButton}>Log Immutable Event</button>
            <button className={styles.secondaryButton}>Validate Only</button>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Integration Health</div>
          <div className={styles.list}>
            <p>CSV ingestion: Healthy (last sync 14m ago)</p>
            <p>Telematics: Degraded (2 of 5 vehicles stale)</p>
            <p>Email docs: Healthy (last inbox check 4m ago)</p>
            <p>Manual overrides: 3 pending reconciliation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
