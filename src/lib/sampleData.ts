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

export const shipments: Shipment[] = [
  {
    id: "ship_9012",
    reference: "RDL-SEA-9012",
    origin: "Seattle, WA",
    destination: "Boise, ID",
    mode: "Road",
    plannedPickup: "2024-11-04T08:00:00Z",
    plannedDelivery: "2024-11-05T17:00:00Z",
    actualPickup: "2024-11-04T08:24:00Z",
    status: "InTransit",
    assets: {
      id: "asset_11",
      vehicleId: "TRK-204",
      trailerId: "TRL-88",
      driver: "Alex Morgan"
    }
  },
  {
    id: "ship_9013",
    reference: "RDL-PDX-9013",
    origin: "Portland, OR",
    destination: "Reno, NV",
    mode: "Road",
    plannedPickup: "2024-11-04T07:00:00Z",
    plannedDelivery: "2024-11-05T12:00:00Z",
    actualPickup: "2024-11-04T07:10:00Z",
    actualDelivery: "2024-11-05T13:42:00Z",
    status: "Delayed",
    assets: {
      id: "asset_12",
      vehicleId: "TRK-210",
      driver: "Taylor Rowe"
    }
  }
];

export const events: Event[] = [
  {
    id: "evt_201",
    shipmentId: "ship_9012",
    timestamp: "2024-11-04T08:00:00Z",
    type: "PickupPlanned",
    source: "CSV",
    summary: "Planned pickup window opened",
    immutableHash: "hash_evt_201"
  },
  {
    id: "evt_202",
    shipmentId: "ship_9012",
    timestamp: "2024-11-04T08:24:00Z",
    type: "PickupActual",
    source: "Manual",
    summary: "Pickup completed at dock 3",
    immutableHash: "hash_evt_202"
  },
  {
    id: "evt_203",
    shipmentId: "ship_9012",
    timestamp: "2024-11-04T12:22:00Z",
    type: "IdleStart",
    source: "Telematics",
    summary: "Idle started - driver rest stop",
    immutableHash: "hash_evt_203"
  },
  {
    id: "evt_204",
    shipmentId: "ship_9012",
    timestamp: "2024-11-04T13:05:00Z",
    type: "IdleEnd",
    source: "Telematics",
    summary: "Idle ended - driver back on route",
    immutableHash: "hash_evt_204"
  },
  {
    id: "evt_205",
    shipmentId: "ship_9013",
    timestamp: "2024-11-05T12:00:00Z",
    type: "DeliveryPlanned",
    source: "CSV",
    summary: "Planned delivery window closed",
    immutableHash: "hash_evt_205"
  },
  {
    id: "evt_206",
    shipmentId: "ship_9013",
    timestamp: "2024-11-05T13:42:00Z",
    type: "DeliveryActual",
    source: "Manual",
    summary: "Delivered 102 minutes late",
    immutableHash: "hash_evt_206"
  },
  {
    id: "evt_207",
    shipmentId: "ship_9013",
    timestamp: "2024-11-05T13:45:00Z",
    type: "ExceptionRaised",
    source: "API",
    summary: "Late delivery exception created",
    immutableHash: "hash_evt_207"
  }
];

export const cases: Case[] = [
  {
    id: "case_3301",
    shipmentId: "ship_9013",
    type: "LateDelivery",
    priority: "High",
    status: "Investigating",
    openedAt: "2024-11-05T13:42:00Z",
    slaDue: "2024-11-06T16:00:00Z",
    owner: "Riya Singh",
    rootCause: "Detour - highway closure"
  },
  {
    id: "case_3302",
    shipmentId: "ship_9012",
    type: "IdleLoss",
    priority: "Medium",
    status: "Open",
    openedAt: "2024-11-04T13:05:00Z",
    slaDue: "2024-11-05T15:00:00Z",
    owner: "Miguel Santos"
  }
];

export const documents: Document[] = [
  {
    id: "doc_901",
    shipmentId: "ship_9012",
    type: "Checklist",
    uploadedAt: "2024-11-04T08:35:00Z",
    uploadedBy: "Ops Team",
    referenceHash: "hash_doc_901",
    name: "Driver Handover Checklist"
  },
  {
    id: "doc_902",
    shipmentId: "ship_9013",
    caseId: "case_3301",
    type: "POD",
    uploadedAt: "2024-11-05T14:10:00Z",
    uploadedBy: "Carrier Support",
    referenceHash: "hash_doc_902",
    name: "Signed POD"
  }
];

export const idleSessions: IdleSession[] = [
  {
    id: "idle_001",
    vehicleId: "TRK-204",
    start: "2024-11-04T12:22:00Z",
    end: "2024-11-04T13:05:00Z",
    minutes: 43,
    fuelBurnRate: 2.6,
    fuelPrice: 1.38,
    litresWasted: 1.87,
    cost: 2.58
  },
  {
    id: "idle_002",
    vehicleId: "TRK-210",
    start: "2024-11-05T09:10:00Z",
    end: "2024-11-05T09:55:00Z",
    minutes: 45,
    fuelBurnRate: 2.8,
    fuelPrice: 1.42,
    litresWasted: 2.1,
    cost: 2.98
  }
];

export const auditLog: AuditLogEntry[] = [
  {
    id: "audit_1001",
    actor: "Riya Singh",
    action: "Case owner assigned",
    entity: "case_3301",
    timestamp: "2024-11-05T13:46:00Z"
  },
  {
    id: "audit_1002",
    actor: "System",
    action: "Idle loss exception triggered",
    entity: "case_3302",
    timestamp: "2024-11-04T13:06:00Z"
  }
];

export const integrationHealth: IntegrationHealth[] = [
  {
    id: "health_1",
    source: "CSV ingestion",
    status: "Healthy",
    detail: "last sync 14m ago"
  },
  {
    id: "health_2",
    source: "Telematics",
    status: "Degraded",
    detail: "2 of 5 vehicles stale"
  },
  {
    id: "health_3",
    source: "Email docs",
    status: "Healthy",
    detail: "last inbox check 4m ago"
  },
  {
    id: "health_4",
    source: "Manual overrides",
    status: "Attention",
    detail: "3 pending reconciliation"
  }
];

export const roleDefinitions: RoleDefinition[] = [
  {
    id: "role_admin",
    role: "Admin",
    description: "Full tenant configuration and user access."
  },
  {
    id: "role_ops",
    role: "Operations",
    description: "Execution control, cases, and manual ingestion."
  },
  {
    id: "role_compliance",
    role: "Compliance",
    description: "Document vault, audit exports, closure approvals."
  },
  {
    id: "role_readonly",
    role: "ReadOnly",
    description: "Customer view of shipment timeline."
  }
];

export const handoverTemplates: HandoverTemplate[] = [
  {
    id: "handover_1",
    shipmentId: "ship_9012",
    driver: "Alex Morgan",
    fuelLevel: "70%",
    sealIntact: "Yes",
    notes: "Add structured notes"
  }
];
