import styles from "@/styles/StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {helper ? <p className={styles.helper}>{helper}</p> : null}
    </div>
  );
}
