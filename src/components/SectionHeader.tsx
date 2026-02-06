import styles from "@/styles/SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <button className={styles.action}>{action}</button> : null}
    </div>
  );
}
