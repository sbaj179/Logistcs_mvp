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
import {
  auditLog as auditLogFallback,
  cases as casesFallback,
  documents as documentsFallback,
  events as eventsFallback,
  handoverTemplates as handoverTemplatesFallback,
  idleSessions as idleSessionsFallback,
  integrationHealth as integrationHealthFallback,
  roleDefinitions as roleDefinitionsFallback,
  shipments as shipmentsFallback
} from "@/lib/sampleData";
import { supabase } from "@/lib/supabase";

async function fetchTable<T>(table: string, fallback: T[]): Promise<T[]> {
  if (!supabase) {
    return fallback;
  }

  const { data, error } = await supabase.from(table).select("*");

  if (error || !data) {
    console.error(`Supabase error fetching ${table}:`, error);
    return fallback;
  }

  return data as T[];
}

export async function getShipments(): Promise<Shipment[]> {
  return fetchTable<Shipment>("shipments", shipmentsFallback);
}

export async function getCases(): Promise<Case[]> {
  return fetchTable<Case>("cases", casesFallback);
}

export async function getEvents(): Promise<Event[]> {
  return fetchTable<Event>("events", eventsFallback);
}

export async function getDocuments(): Promise<Document[]> {
  return fetchTable<Document>("documents", documentsFallback);
}

export async function getIdleSessions(): Promise<IdleSession[]> {
  return fetchTable<IdleSession>("idle_sessions", idleSessionsFallback);
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return fetchTable<AuditLogEntry>("audit_log", auditLogFallback);
}

export async function getIntegrationHealth(): Promise<IntegrationHealth[]> {
  return fetchTable<IntegrationHealth>("integration_health", integrationHealthFallback);
}

export async function getRoleDefinitions(): Promise<RoleDefinition[]> {
  return fetchTable<RoleDefinition>("role_definitions", roleDefinitionsFallback);
}

export async function getHandoverTemplates(): Promise<HandoverTemplate[]> {
  return fetchTable<HandoverTemplate>("handover_templates", handoverTemplatesFallback);
}
