import { SectionHeader } from "@/components/SectionHeader";
import styles from "@/styles/Page.module.css";

export default function HandoverPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Structured Handovers"
        subtitle="Digitize handovers with required checklists, documents, and explicit completion states."
        action="Start Handover"
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Driver → Ops Checklist</div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Shipment ID</label>
              <input placeholder="ship_9012" />
            </div>
            <div className={styles.field}>
              <label>Driver</label>
              <input placeholder="Alex Morgan" />
            </div>
            <div className={styles.field}>
              <label>Fuel Level</label>
              <input placeholder="70%" />
            </div>
            <div className={styles.field}>
              <label>Seal Intact</label>
              <select>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Notes</label>
              <textarea placeholder="Add structured notes" />
            </div>
          </div>
          <div className={styles.inlineActions}>
            <button className={styles.primaryButton}>Complete Handover</button>
            <button className={styles.secondaryButton}>Upload Evidence</button>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Ops → Compliance Checklist</div>
          <div className={styles.list}>
            <p>Mandatory POD upload</p>
            <p>Customs permit verification</p>
            <p>Closure reason classification</p>
            <p>Compliance sign-off required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
