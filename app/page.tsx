import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/Auth.module.css";

export default function HomePage() {
  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Logistics OS</span>
          <h1>Operational Control Core</h1>
          <p>Track shipments, exceptions, evidence, and fleet idle loss in one place.</p>
        </div>
        <Card>
          <div className={styles.actions}>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
