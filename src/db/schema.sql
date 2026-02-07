-- Demo schema for Logistics Operating System (LOS)
-- NOTE: Policies are permissive for demo purposes only. Lock down before production.

create extension if not exists "pgcrypto";

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists tenant_users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'Owner',
  created_at timestamptz not null default now()
);

create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  reference text not null,
  origin text not null,
  destination text not null,
  status text not null,
  planned_pickup_at timestamptz,
  planned_delivery_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  event_type text not null,
  occurred_at timestamptz,
  source text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  description text,
  case_type text not null,
  priority text not null,
  status text not null,
  sla_due_at timestamptz,
  assigned_to_email text,
  closure_reason text,
  shipment_id uuid,
  vehicle_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists case_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  case_id uuid not null references cases(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  filename text not null,
  doc_type text not null,
  storage_path text not null,
  shipment_id uuid,
  case_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  vehicle_number text not null,
  idle_burn_lph numeric,
  created_at timestamptz not null default now()
);

create table if not exists idle_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  idle_start_at timestamptz,
  idle_end_at timestamptz,
  idle_minutes integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists integration_health (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  source text not null,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists role_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  role text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists handover_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  shipment_id uuid,
  driver text,
  fuel_level text,
  seal_intact text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_shipments_tenant_created on shipments(tenant_id, created_at);
create index if not exists idx_tenant_users_user on tenant_users(user_id);
create index if not exists idx_tenant_users_tenant on tenant_users(tenant_id);
create index if not exists idx_events_tenant_created on events(tenant_id, created_at);
create index if not exists idx_events_entity on events(entity_id);
create index if not exists idx_cases_tenant_created on cases(tenant_id, created_at);
create index if not exists idx_documents_tenant_created on documents(tenant_id, created_at);
create index if not exists idx_idle_sessions_tenant_created on idle_sessions(tenant_id, created_at);
create index if not exists idx_audit_logs_tenant_created on audit_logs(tenant_id, created_at);

alter table tenants enable row level security;
alter table tenant_users enable row level security;
alter table shipments enable row level security;
alter table events enable row level security;
alter table cases enable row level security;
alter table case_notes enable row level security;
alter table documents enable row level security;
alter table vehicles enable row level security;
alter table idle_sessions enable row level security;
alter table audit_logs enable row level security;
alter table integration_health enable row level security;
alter table role_definitions enable row level security;
alter table handover_templates enable row level security;

create policy "demo_all_tenants" on tenants for all using (true) with check (true);
create policy "demo_all_tenant_users" on tenant_users for all using (true) with check (true);
create policy "demo_all_shipments" on shipments for all using (true) with check (true);
create policy "demo_all_events" on events for all using (true) with check (true);
create policy "demo_all_cases" on cases for all using (true) with check (true);
create policy "demo_all_case_notes" on case_notes for all using (true) with check (true);
create policy "demo_all_documents" on documents for all using (true) with check (true);
create policy "demo_all_vehicles" on vehicles for all using (true) with check (true);
create policy "demo_all_idle_sessions" on idle_sessions for all using (true) with check (true);
create policy "demo_all_audit_logs" on audit_logs for all using (true) with check (true);
create policy "demo_all_integration_health" on integration_health for all using (true) with check (true);
create policy "demo_all_role_definitions" on role_definitions for all using (true) with check (true);
create policy "demo_all_handover_templates" on handover_templates for all using (true) with check (true);
