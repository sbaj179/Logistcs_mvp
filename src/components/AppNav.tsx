import Link from "next/link";
import styles from "@/styles/AppNav.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Control Center" },
  { href: "/shipments", label: "Shipments" },
  { href: "/cases", label: "Cases" },
  { href: "/documents", label: "Documents" },
  { href: "/idle", label: "Idle Loss" },
  { href: "/analytics", label: "Analytics" },
  { href: "/ingestion", label: "Ingestion" },
  { href: "/handover", label: "Handovers" },
  { href: "/settings", label: "Tenant & RBAC" }
];

export function AppNav() {
  return (
    <aside className={styles.nav}>
      <div className={styles.brand}>
        <span>LOS</span>
        <strong>Operational Core</strong>
      </div>
      <nav className={styles.menu}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={styles.link}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <p>Tenant: Roadline Logistics</p>
        <p>Role: Operations</p>
      </div>
    </aside>
  );
}
