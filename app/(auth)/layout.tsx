import type { ReactNode } from "react";
import styles from "@/styles/Auth.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.screen}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}
