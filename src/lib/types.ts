export type TenantRole = "Admin" | "Operations" | "Compliance" | "ReadOnly";

export type EventSource = "Manual" | "CSV" | "Telematics" | "API" | "Email";

export type EventType =
  | "PickupPlanned"
  | "DeliveryPlanned"
  | "PickupActual"
  | "DeliveryActual"
  | "Arrival"
  | "Delay"
  | "IdleStart"
  | "IdleEnd"
  | "DocumentMissing"
  | "DocumentUploaded"
  | "ExceptionRaised";

export type CaseStatus = "Open" | "Investigating" | "AwaitingDocs" | "Resolved" | "Closed" | "Reopened";

export type CaseType =
  | "LatePickup"
  | "LateDelivery"
  | "MissingPOD"
  | "IdleLoss"
  | "ComplianceRisk"
  | "ManualException";

export type ShipmentStatus = "Planned" | "InTransit" | "Delayed" | "Delivered" | "Closed";

export type DocumentType = "POD" | "Invoice" | "Permit" | "Photo" | "Checklist" | "Custom";

export interface TransportAsset {
  id: string;
  vehicleId: string;
  trailerId?: string;
  driver?: string;
}

export interface Shipment {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  mode: "Road";
  plannedPickup: string;
  plannedDelivery: string;
  actualPickup?: string;
  actualDelivery?: string;
  status: ShipmentStatus;
  assets: TransportAsset;
}

export interface Event {
  id: string;
  shipmentId?: string;
  assetId?: string;
  timestamp: string;
  type: EventType;
  source: EventSource;
  summary: string;
  immutableHash: string;
}

export interface Case {
  id: string;
  shipmentId: string;
  type: CaseType;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: CaseStatus;
  slaDue: string;
  owner: string;
  rootCause?: string;
  closureReason?: string;
}

export interface Document {
  id: string;
  shipmentId?: string;
  caseId?: string;
  type: DocumentType;
  uploadedAt: string;
  uploadedBy: string;
  referenceHash: string;
  name: string;
}

export interface IdleSession {
  id: string;
  vehicleId: string;
  start: string;
  end: string;
  minutes: number;
  fuelBurnRate: number;
  fuelPrice: number;
  litresWasted: number;
  cost: number;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
}
