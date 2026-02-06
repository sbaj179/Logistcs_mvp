import type { ReactNode } from "react";
import styles from "@/styles/AppShell.module.css";
import { AppNav } from "@/components/AppNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <AppNav />
      <div className={styles.content}>
        <main>{children}</main>
      </div>
    </div>
  );
}
