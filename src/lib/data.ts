import { DEMO_TENANT_ID, supabaseClient } from "@/lib/supabaseClient";
import type {
  AuditLogEntry,
  Case,
  Document,
  Event,
  HandoverTemplate,
  IdleSession,
  IntegrationHealth,
  RoleDefinition,
  Shipment
} from "@/lib/types";

const DEFAULT_FUEL_PRICE = 25.5;
export const DEFAULT_TENANT_ID = DEMO_TENANT_ID;

type DataResult<T> = { data: T | null; error: string | null };

type DbShipment = {
  id: string;
  tenant_id: string;
  reference: string;
  origin: string;
  destination: string;
  status: Shipment["status"];
  planned_pickup_at: string | null;
  planned_delivery_at: string | null;
  created_at: string;
};

type DbEvent = {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  event_type: Event["type"];
  occurred_at: string | null;
  source: Event["source"] | null;
  payload: { summary?: string } | null;
  created_at: string;
};

type DbCase = {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  case_type: Case["type"];
  priority: Case["priority"];
  status: Case["status"];
  sla_due_at: string | null;
  assigned_to_email: string | null;
  closure_reason: string | null;
  shipment_id: string | null;
  vehicle_id: string | null;
  created_at: string;
};

type DbDocument = {
  id: string;
  tenant_id: string;
  filename: string;
  doc_type: Document["type"];
  storage_path: string;
  shipment_id: string | null;
  case_id: string | null;
  created_at: string;
};

type DbVehicle = {
  id: string;
  tenant_id: string;
  vehicle_number: string;
  idle_burn_lph: number | null;
  created_at: string;
};

export type VehicleRecord = DbVehicle;

type DbIdleSession = {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  idle_start_at: string | null;
  idle_end_at: string | null;
  idle_minutes: number | null;
  notes: string | null;
  created_at: string;
};

type DbIntegrationHealth = {
  id: string;
  tenant_id: string;
  source: string;
  status: string;
  detail: string | null;
  created_at: string;
};

type DbRoleDefinition = {
  id: string;
  tenant_id: string;
  role: RoleDefinition["role"];
  description: string;
  created_at: string;
};

type DbHandoverTemplate = {
  id: string;
  tenant_id: string;
  shipment_id: string | null;
  driver: string | null;
  fuel_level: string | null;
  seal_intact: string | null;
  notes: string | null;
  created_at: string;
};

type DbAuditLog = {
  id: string;
  tenant_id: string;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};

function resolveError(error: unknown) {
  if (!error) {
    return null;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error.";
}

function mapShipment(row: DbShipment): Shipment {
  return {
    id: row.id,
    reference: row.reference,
    origin: row.origin,
    destination: row.destination,
    mode: "Road",
    plannedPickup: row.planned_pickup_at ?? "",
    plannedDelivery: row.planned_delivery_at ?? "",
    status: row.status,
    assets: {
      id: row.id,
      vehicleId: "Unassigned",
      driver: "Unassigned"
    }
  };
}

function mapEvent(row: DbEvent): Event {
  return {
    id: row.id,
    shipmentId: row.entity_id,
    timestamp: row.occurred_at ?? row.created_at,
    type: row.event_type,
    source: row.source ?? "Manual",
    summary: row.payload?.summary ?? row.event_type,
    immutableHash: row.id
  };
}

function mapCase(row: DbCase): Case {
  return {
    id: row.id,
    shipmentId: row.shipment_id ?? "",
    type: row.case_type,
    priority: row.priority,
    status: row.status,
    openedAt: row.created_at,
    slaDue: row.sla_due_at ?? row.created_at,
    owner: row.assigned_to_email ?? "Unassigned",
    rootCause: row.description ?? undefined,
    closureReason: row.closure_reason ?? undefined
  };
}

function mapDocument(row: DbDocument): Document {
  return {
    id: row.id,
    shipmentId: row.shipment_id ?? undefined,
    caseId: row.case_id ?? undefined,
    type: row.doc_type,
    uploadedAt: row.created_at,
    uploadedBy: "System",
    referenceHash: row.storage_path,
    name: row.filename
  };
}

function mapIdleSession(row: DbIdleSession, vehicleById: Map<string, DbVehicle>): IdleSession {
  const vehicle = vehicleById.get(row.vehicle_id);
  const fuelBurnRate = vehicle?.idle_burn_lph ?? 0;
  const minutes = row.idle_minutes ?? 0;
  const litresWasted = (minutes / 60) * fuelBurnRate;
  const cost = litresWasted * DEFAULT_FUEL_PRICE;

  return {
    id: row.id,
    vehicleId: vehicle?.vehicle_number ?? row.vehicle_id,
    start: row.idle_start_at ?? row.created_at,
    end: row.idle_end_at ?? row.created_at,
    minutes,
    fuelBurnRate,
    fuelPrice: DEFAULT_FUEL_PRICE,
    litresWasted,
    cost
  };
}

function mapIntegrationHealth(row: DbIntegrationHealth): IntegrationHealth {
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    detail: row.detail ?? ""
  };
}

function mapRoleDefinition(row: DbRoleDefinition): RoleDefinition {
  return {
    id: row.id,
    role: row.role,
    description: row.description
  };
}

function mapHandoverTemplate(row: DbHandoverTemplate): HandoverTemplate {
  return {
    id: row.id,
    shipmentId: row.shipment_id ?? "",
    driver: row.driver ?? "",
    fuelLevel: row.fuel_level ?? "",
    sealIntact: row.seal_intact ?? "",
    notes: row.notes ?? ""
  };
}

function mapAuditLog(row: DbAuditLog): AuditLogEntry {
  return {
    id: row.id,
    actor: row.actor_email ?? "System",
    action: row.action,
    entity: row.entity_id ?? "",
    timestamp: row.created_at
  };
}

export async function listShipments(tenantId: string): Promise<DataResult<Shipment[]>> {
  const { data, error } = await supabaseClient
    .from("shipments")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapShipment), error: null };
}

export async function createShipment(
  tenantId: string,
  input: {
    reference: string;
    origin: string;
    destination: string;
    status: Shipment["status"];
    planned_pickup_at?: string;
    planned_delivery_at?: string;
  }
): Promise<DataResult<DbShipment>> {
  const { data, error } = await supabaseClient
    .from("shipments")
    .insert({
      tenant_id: tenantId,
      reference: input.reference,
      origin: input.origin,
      destination: input.destination,
      status: input.status,
      planned_pickup_at: input.planned_pickup_at || null,
      planned_delivery_at: input.planned_delivery_at || null
    })
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function getShipmentById(tenantId: string, id: string): Promise<DataResult<Shipment>> {
  const { data, error } = await supabaseClient
    .from("shipments")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { data: null, error: resolveError(error) ?? "Shipment not found." };
  }

  return { data: mapShipment(data), error: null };
}

export async function listEventsForShipment(tenantId: string, shipmentId: string): Promise<DataResult<Event[]>> {
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("entity_type", "shipment")
    .eq("entity_id", shipmentId)
    .order("occurred_at", { ascending: true });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapEvent), error: null };
}

export async function addShipmentEvent(
  tenantId: string,
  shipmentId: string,
  input: {
    event_type: Event["type"];
    occurred_at?: string;
    payload?: { summary?: string };
    source?: Event["source"];
  }
): Promise<DataResult<DbEvent>> {
  const { data, error } = await supabaseClient
    .from("events")
    .insert({
      tenant_id: tenantId,
      entity_type: "shipment",
      entity_id: shipmentId,
      event_type: input.event_type,
      occurred_at: input.occurred_at ?? new Date().toISOString(),
      source: input.source ?? "Manual",
      payload: input.payload ?? null
    })
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function listCases(tenantId: string): Promise<DataResult<Case[]>> {
  const { data, error } = await supabaseClient
    .from("cases")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapCase), error: null };
}

export async function createCase(
  tenantId: string,
  input: {
    title: string;
    case_type: Case["type"];
    priority: Case["priority"];
    status: Case["status"];
    shipment_id?: string;
    vehicle_id?: string;
    sla_due_at?: string;
    description?: string;
  }
): Promise<DataResult<DbCase>> {
  const { data, error } = await supabaseClient
    .from("cases")
    .insert({
      tenant_id: tenantId,
      title: input.title,
      description: input.description ?? null,
      case_type: input.case_type,
      priority: input.priority,
      status: input.status,
      shipment_id: input.shipment_id ?? null,
      vehicle_id: input.vehicle_id ?? null,
      sla_due_at: input.sla_due_at ?? null,
      assigned_to_email: null,
      closure_reason: null
    })
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function updateCaseStatus(
  tenantId: string,
  caseId: string,
  status: Case["status"]
): Promise<DataResult<DbCase>> {
  const { data, error } = await supabaseClient
    .from("cases")
    .update({ status })
    .eq("tenant_id", tenantId)
    .eq("id", caseId)
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function closeCase(
  tenantId: string,
  caseId: string,
  closure_reason: string
): Promise<DataResult<DbCase>> {
  const { data, error } = await supabaseClient
    .from("cases")
    .update({ status: "Closed", closure_reason })
    .eq("tenant_id", tenantId)
    .eq("id", caseId)
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function addCaseNote(
  tenantId: string,
  caseId: string,
  note: string
): Promise<DataResult<{ id: string }>> {
  const { data, error } = await supabaseClient
    .from("case_notes")
    .insert({
      tenant_id: tenantId,
      case_id: caseId,
      note
    })
    .select("id")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function listVehicles(tenantId: string): Promise<DataResult<DbVehicle[]>> {
  const { data, error } = await supabaseClient
    .from("vehicles")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  return { data: data ?? null, error: resolveError(error) };
}

export async function createVehicle(
  tenantId: string,
  input: {
    vehicle_number: string;
    idle_burn_lph: number;
  }
): Promise<DataResult<DbVehicle>> {
  const { data, error } = await supabaseClient
    .from("vehicles")
    .insert({
      tenant_id: tenantId,
      vehicle_number: input.vehicle_number,
      idle_burn_lph: input.idle_burn_lph
    })
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function listIdleSessions(tenantId: string): Promise<DataResult<IdleSession[]>> {
  const client = supabaseClient;
  const [{ data: idleRows, error: idleError }, { data: vehicleRows, error: vehicleError }] = await Promise.all([
    client
      .from("idle_sessions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
    client.from("vehicles").select("*").eq("tenant_id", tenantId)
  ]);

  if (idleError || vehicleError) {
    return { data: null, error: resolveError(idleError ?? vehicleError) };
  }

  const vehicleById = new Map((vehicleRows ?? []).map((vehicle) => [vehicle.id, vehicle]));
  return { data: (idleRows ?? []).map((row) => mapIdleSession(row, vehicleById)), error: null };
}

export async function createIdleSession(
  tenantId: string,
  input: {
    vehicle_id: string;
    idle_start_at: string;
    idle_end_at: string;
    idle_minutes: number;
    notes?: string;
  }
): Promise<DataResult<DbIdleSession>> {
  const { data, error } = await supabaseClient
    .from("idle_sessions")
    .insert({
      tenant_id: tenantId,
      vehicle_id: input.vehicle_id,
      idle_start_at: input.idle_start_at,
      idle_end_at: input.idle_end_at,
      idle_minutes: input.idle_minutes,
      notes: input.notes ?? null
    })
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function listDocuments(tenantId: string): Promise<DataResult<Document[]>> {
  const { data, error } = await supabaseClient
    .from("documents")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapDocument), error: null };
}

export async function createDocument(
  tenantId: string,
  input: {
    filename: string;
    doc_type: Document["type"];
    storage_path: string;
    shipment_id?: string;
    case_id?: string;
  }
): Promise<DataResult<DbDocument>> {
  const { data, error } = await supabaseClient
    .from("documents")
    .insert({
      tenant_id: tenantId,
      filename: input.filename,
      doc_type: input.doc_type,
      storage_path: input.storage_path,
      shipment_id: input.shipment_id ?? null,
      case_id: input.case_id ?? null
    })
    .select("*")
    .single();

  return { data: data ?? null, error: resolveError(error) };
}

export async function listIntegrationHealth(tenantId: string): Promise<DataResult<IntegrationHealth[]>> {
  const { data, error } = await supabaseClient
    .from("integration_health")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapIntegrationHealth), error: null };
}

export async function listRoleDefinitions(tenantId: string): Promise<DataResult<RoleDefinition[]>> {
  const { data, error } = await supabaseClient
    .from("role_definitions")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapRoleDefinition), error: null };
}

export async function listHandoverTemplates(tenantId: string): Promise<DataResult<HandoverTemplate[]>> {
  const { data, error } = await supabaseClient
    .from("handover_templates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapHandoverTemplate), error: null };
}

export async function listAuditLogs(tenantId: string): Promise<DataResult<AuditLogEntry[]>> {
  const { data, error } = await supabaseClient
    .from("audit_logs")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: resolveError(error) };
  }

  return { data: (data ?? []).map(mapAuditLog), error: null };
}

export function getDefaultFuelPrice() {
  return DEFAULT_FUEL_PRICE;
}
