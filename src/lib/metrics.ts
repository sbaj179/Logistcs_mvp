import type { Case, IdleSession, Shipment } from "@/lib/types";

const ACTIVE_CASE_STATUSES: Case["status"][] = ["Open", "Investigating", "AwaitingDocs", "Reopened"];

function parseDate(value?: string) {
  return value ? new Date(value) : null;
}

function withinDays(date: Date, days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days);
  return date >= start && date <= now;
}

function median(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function computeOnTimePickupRate(shipments: Shipment[], days?: number) {
  const eligible = shipments.filter((shipment) => {
    const planned = parseDate(shipment.plannedPickup);
    return planned ? (days ? withinDays(planned, days) : true) : false;
  });

  if (eligible.length === 0) {
    return 0;
  }

  const onTimeCount = eligible.filter((shipment) => {
    const planned = parseDate(shipment.plannedPickup);
    const actual = parseDate(shipment.actualPickup);
    if (!planned || !actual) {
      return false;
    }
    return actual <= planned;
  }).length;

  return (onTimeCount / eligible.length) * 100;
}

export function computeOnTimeDeliveryRate(shipments: Shipment[], days?: number) {
  const eligible = shipments.filter((shipment) => {
    const planned = parseDate(shipment.plannedDelivery);
    return planned ? (days ? withinDays(planned, days) : true) : false;
  });

  if (eligible.length === 0) {
    return 0;
  }

  const onTimeCount = eligible.filter((shipment) => {
    const planned = parseDate(shipment.plannedDelivery);
    const actual = parseDate(shipment.actualDelivery);
    if (!planned || !actual) {
      return false;
    }
    return actual <= planned;
  }).length;

  return (onTimeCount / eligible.length) * 100;
}

export function computeActiveCasesCount(cases: Case[]) {
  return cases.filter((item) => ACTIVE_CASE_STATUSES.includes(item.status)).length;
}

export function computeExceptionRate(cases: Case[], shipments: Shipment[]) {
  if (shipments.length === 0) {
    return 0;
  }

  return (cases.length / shipments.length) * 100;
}

export function computeMedianResolution(cases: Case[]) {
  const resolutionTimes = cases
    .map((item) => {
      const opened = parseDate(item.openedAt);
      const closed = parseDate(item.closedAt);
      return opened && closed ? (closed.getTime() - opened.getTime()) / 60000 : null;
    })
    .filter((value): value is number => value !== null);

  return median(resolutionTimes);
}

export function computeIdleCost(idleSessions: IdleSession[], days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days);

  return idleSessions.reduce((total, session) => {
    const sessionStart = parseDate(session.start);
    if (!sessionStart) {
      return total;
    }
    if (sessionStart >= start && sessionStart <= now) {
      return total + session.cost;
    }
    return total;
  }, 0);
}

export function computeIdleTotals(idleSessions: IdleSession[], days: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days);

  return idleSessions.reduce(
    (acc, session) => {
      const sessionStart = parseDate(session.start);
      if (!sessionStart || sessionStart < start || sessionStart > now) {
        return acc;
      }
      acc.minutes += session.minutes;
      acc.litres += session.litresWasted;
      acc.cost += session.cost;
      return acc;
    },
    { minutes: 0, litres: 0, cost: 0 }
  );
}

export function computeDeliveryVarianceMinutes(shipments: Shipment[]) {
  const variances = shipments
    .map((shipment) => {
      const planned = parseDate(shipment.plannedDelivery);
      const actual = parseDate(shipment.actualDelivery);
      return planned && actual ? (actual.getTime() - planned.getTime()) / 60000 : null;
    })
    .filter((value): value is number => value !== null);

  return median(variances);
}

export function formatDuration(minutes: number) {
  if (minutes === 0) {
    return "0m";
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  return `${hours}h ${remainingMinutes}m`;
}
