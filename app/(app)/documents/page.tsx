"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { createDocument, listDocuments } from "@/lib/data";
import type { Document } from "@/lib/types";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

const DOCUMENT_TYPES: Document["type"][] = ["POD", "Invoice", "Permit", "Photo", "Checklist", "Custom"];

export default function DocumentsPage() {
  const { tenantId, loadingTenant } = useTenant();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    filename: "",
    doc_type: "POD" as Document["type"],
    shipment_id: "",
    case_id: ""
  });

  const load = async () => {
    if (!tenantId) {
      return;
    }
    setLoading(true);
    const result = await listDocuments(tenantId);
    if (result.error) {
      setError(result.error);
    } else {
      setDocuments(result.data ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tenantId]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const timestamp = Date.now();
    const result = await createDocument(tenantId, {
      filename: form.filename,
      doc_type: form.doc_type,
      storage_path: `manual/${timestamp}-${form.filename}`,
      shipment_id: form.shipment_id || undefined,
      case_id: form.case_id || undefined
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setForm({ filename: "", doc_type: "POD", shipment_id: "", case_id: "" });
    await load();
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Document Vault"
        subtitle="Evidence linked to shipments and cases with immutable references."
        action="Upload Document"
      />
      {loadingTenant ? <p>Loading tenant...</p> : null}
      {loading && !loadingTenant ? <p>Loading documents...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <div className={styles.panel}>
        <div className={styles.panelHeader}>Upload Document Metadata</div>
        <form className={styles.formGrid} onSubmit={handleCreate}>
          <div className={styles.field}>
            <label>Filename</label>
            <input
              value={form.filename}
              onChange={(event) => setForm({ ...form, filename: event.target.value })}
              placeholder="signed-pod.pdf"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Document Type</label>
            <select
              value={form.doc_type}
              onChange={(event) => setForm({ ...form, doc_type: event.target.value as Document["type"] })}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Shipment ID (optional)</label>
            <input
              value={form.shipment_id}
              onChange={(event) => setForm({ ...form, shipment_id: event.target.value })}
              placeholder="UUID"
            />
          </div>
          <div className={styles.field}>
            <label>Case ID (optional)</label>
            <input
              value={form.case_id}
              onChange={(event) => setForm({ ...form, case_id: event.target.value })}
              placeholder="UUID"
            />
          </div>
          <div className={styles.inlineActions}>
            <button className={styles.primaryButton} type="submit">Save Metadata</button>
          </div>
        </form>
      </div>

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        {documents.length === 0 && !loading ? <p>No documents yet.</p> : null}
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
