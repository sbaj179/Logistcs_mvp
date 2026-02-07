import type { InputHTMLAttributes } from "react";
import styles from "@/styles/UI.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
