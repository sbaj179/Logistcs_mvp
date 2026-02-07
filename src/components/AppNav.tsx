\"use client\";

import Link from \"next/link\";
import { supabaseClient } from \"@/lib/supabaseClient\";
import styles from \"@/styles/AppNav.module.css\";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Control Center" },
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
  const handleSignOut = async () => {
    const supabase = supabaseClient;
    await supabase.auth.signOut();
    window.location.assign(\"/login\");
  };

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
        <button className={styles.signOut} onClick={handleSignOut}>Sign Out</button>
      </div>
    </aside>
  );
}
