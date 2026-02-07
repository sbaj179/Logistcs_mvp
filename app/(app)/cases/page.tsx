"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { DataTable } from "@/components/DataTable";
import {
  addCaseNote,
  closeCase,
  createCase,
  listCases,
  updateCaseStatus
} from "@/lib/data";
import type { Case } from "@/lib/types";
import { useTenant } from "@/components/TenantProvider/TenantProvider";
import styles from "@/styles/Page.module.css";

const CASE_TYPES: Case["type"][] = [
  "LatePickup",
  "LateDelivery",
  "MissingPOD",
  "IdleLoss",
  "ComplianceRisk",
  "ManualException"
];
const CASE_PRIORITIES: Case["priority"][] = ["Low", "Medium", "High", "Critical"];
const CASE_STATUSES: Case["status"][] = [
  "Open",
  "Investigating",
  "AwaitingDocs",
  "Resolved",
  "Closed",
  "Reopened"
];

export default function CasesPage() {
  const { tenantId, loadingTenant } = useTenant();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    title: "",
    case_type: "LateDelivery" as Case["type"],
    priority: "Medium" as Case["priority"],
    status: "Open" as Case["status"],
    shipment_id: "",
    vehicle_id: "",
    sla_due_at: "",
    description: ""
  });
  const [statusForm, setStatusForm] = useState({
    caseId: "",
    status: "Investigating" as Case["status"]
  });
  const [closeForm, setCloseForm] = useState({ caseId: "", closureReason: "" });
  const [noteForm, setNoteForm] = useState({ caseId: "", note: "" });

  const caseRows = useMemo(
    () => cases.map((item) => ({
      id: item.id,
      shipment: item.shipmentId || "-",
      type: item.type,
      status: item.status,
      owner: item.owner,
      sla: item.slaDue ? new Date(item.slaDue).toLocaleString() : "TBD"
    })),
    [cases]
  );

  const load = async () => {
    if (!tenantId) {
      return;
    }
    setLoading(true);
    const result = await listCases(tenantId);
    if (result.error) {
      setError(result.error);
    } else {
      setCases(result.data ?? []);
      setError(null);
      if (!statusForm.caseId && result.data && result.data.length > 0) {
        setStatusForm((current) => ({ ...current, caseId: result.data?.[0]?.id ?? "" }));
        setCloseForm((current) => ({ ...current, caseId: result.data?.[0]?.id ?? "" }));
        setNoteForm((current) => ({ ...current, caseId: result.data?.[0]?.id ?? "" }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [tenantId]);

  const handleCreateCase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const result = await createCase(tenantId, {
      title: createForm.title,
      case_type: createForm.case_type,
      priority: createForm.priority,
      status: createForm.status,
      shipment_id: createForm.shipment_id || undefined,
      vehicle_id: createForm.vehicle_id || undefined,
      sla_due_at: createForm.sla_due_at ? new Date(createForm.sla_due_at).toISOString() : undefined,
      description: createForm.description || undefined
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    setCreateForm({
      title: "",
      case_type: "LateDelivery",
      priority: "Medium",
      status: "Open",
      shipment_id: "",
      vehicle_id: "",
      sla_due_at: "",
      description: ""
    });
    await load();
  };

  const handleStatusUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!statusForm.caseId) {
      setError("Select a case to update.");
      return;
    }
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const result = await updateCaseStatus(tenantId, statusForm.caseId, statusForm.status);
    if (result.error) {
      setError(result.error);
      return;
    }
    await load();
  };

  const handleCloseCase = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!closeForm.caseId) {
      setError("Select a case to close.");
      return;
    }
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const result = await closeCase(tenantId, closeForm.caseId, closeForm.closureReason);
    if (result.error) {
      setError(result.error);
      return;
    }
    setCloseForm({ caseId: closeForm.caseId, closureReason: "" });
    await load();
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!noteForm.caseId) {
      setError("Select a case to add a note.");
      return;
    }
    if (!tenantId) {
      setError("Tenant not ready.");
      return;
    }
    const result = await addCaseNote(tenantId, noteForm.caseId, noteForm.note);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNoteForm({ caseId: noteForm.caseId, note: "" });
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Exception Case Management"
        subtitle="Every exception is structured into a case with ownership, SLA discipline, and closure evidence."
        action="Create Case"
      />
      {loadingTenant ? <p>Loading tenant...</p> : null}
      {loading && !loadingTenant ? <p>Loading cases...</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}

      <DataTable
        caption="Active and recent cases"
        columns={[
          { key: "id", label: "Case ID" },
          { key: "shipment", label: "Shipment" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" },
          { key: "owner", label: "Owner" },
          { key: "sla", label: "SLA Due" }
        ]}
        data={caseRows}
      />

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Create Case</div>
          <form className={styles.formGrid} onSubmit={handleCreateCase}>
            <div className={styles.field}>
              <label>Title</label>
              <input
                value={createForm.title}
                onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })}
                placeholder="Late delivery in Reno"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Type</label>
              <select
                value={createForm.case_type}
                onChange={(event) => setCreateForm({ ...createForm, case_type: event.target.value as Case["type"] })}
              >
                {CASE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Priority</label>
              <select
                value={createForm.priority}
                onChange={(event) => setCreateForm({ ...createForm, priority: event.target.value as Case["priority"] })}
              >
                {CASE_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select
                value={createForm.status}
                onChange={(event) => setCreateForm({ ...createForm, status: event.target.value as Case["status"] })}
              >
                {CASE_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Shipment ID (optional)</label>
              <input
                value={createForm.shipment_id}
                onChange={(event) => setCreateForm({ ...createForm, shipment_id: event.target.value })}
                placeholder="UUID"
              />
            </div>
            <div className={styles.field}>
              <label>Vehicle ID (optional)</label>
              <input
                value={createForm.vehicle_id}
                onChange={(event) => setCreateForm({ ...createForm, vehicle_id: event.target.value })}
                placeholder="UUID"
              />
            </div>
            <div className={styles.field}>
              <label>SLA Due</label>
              <input
                type="datetime-local"
                value={createForm.sla_due_at}
                onChange={(event) => setCreateForm({ ...createForm, sla_due_at: event.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label>Description</label>
              <textarea
                value={createForm.description}
                onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
                placeholder="Root cause and detail"
              />
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.primaryButton} type="submit">Create Case</button>
            </div>
          </form>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>Case Actions</div>
          <form className={styles.formGrid} onSubmit={handleStatusUpdate}>
            <div className={styles.field}>
              <label>Case</label>
              <select
                value={statusForm.caseId}
                onChange={(event) => setStatusForm({ ...statusForm, caseId: event.target.value })}
              >
                {cases.map((item) => (
                  <option key={item.id} value={item.id}>{item.id}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select
                value={statusForm.status}
                onChange={(event) => setStatusForm({ ...statusForm, status: event.target.value as Case["status"] })}
              >
                {CASE_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.primaryButton} type="submit">Update Status</button>
            </div>
          </form>

          <form className={styles.formGrid} onSubmit={handleCloseCase}>
            <div className={styles.field}>
              <label>Close Case</label>
              <select
                value={closeForm.caseId}
                onChange={(event) => setCloseForm({ ...closeForm, caseId: event.target.value })}
              >
                {cases.map((item) => (
                  <option key={item.id} value={item.id}>{item.id}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Closure Reason</label>
              <input
                value={closeForm.closureReason}
                onChange={(event) => setCloseForm({ ...closeForm, closureReason: event.target.value })}
                placeholder="Document received"
              />
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.primaryButton} type="submit">Close Case</button>
            </div>
          </form>

          <form className={styles.formGrid} onSubmit={handleAddNote}>
            <div className={styles.field}>
              <label>Add Note</label>
              <select
                value={noteForm.caseId}
                onChange={(event) => setNoteForm({ ...noteForm, caseId: event.target.value })}
              >
                {cases.map((item) => (
                  <option key={item.id} value={item.id}>{item.id}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>Note</label>
              <textarea
                value={noteForm.note}
                onChange={(event) => setNoteForm({ ...noteForm, note: event.target.value })}
                placeholder="Add investigation detail"
              />
            </div>
            <div className={styles.inlineActions}>
              <button className={styles.secondaryButton} type="submit">Add Note</button>
            </div>
          </form>
        </div>
      </div>

      <div className={`${styles.grid} ${styles.gridTwo}`}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Case Closure Discipline</div>
          <div className={styles.list}>
            <p>Closure reason required before resolution.</p>
            <p>Evidence upload mandatory for POD or compliance cases.</p>
            <p>Cases can be reopened with audit trail.</p>
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>Ownership & SLA</div>
          <div className={styles.list}>
            <p>Owners are assigned by rule or manual assignment.</p>
            <p>SLA timers run continuously until closure.</p>
            <p>Escalation triggered at 80% of SLA window.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
