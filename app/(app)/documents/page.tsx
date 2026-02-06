import { SectionHeader } from "@/components/SectionHeader";
import { getDocuments } from "@/lib/data";
import styles from "@/styles/Page.module.css";

export default async function DocumentsPage() {
  const documents = await getDocuments();
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Document Vault"
        subtitle="Evidence linked to shipments and cases with immutable references."
        action="Upload Document"
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        {documents.map((doc) => (
          <div key={doc.id} className={styles.panel}>
            <div className={styles.panelHeader}>{doc.name}</div>
            <p>Type: {doc.type}</p>
            <p>Shipment: {doc.shipmentId ?? "-"}</p>
            <p>Case: {doc.caseId ?? "-"}</p>
            <p>Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
            <p>Uploaded by: {doc.uploadedBy}</p>
            <p>Hash: {doc.referenceHash}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
