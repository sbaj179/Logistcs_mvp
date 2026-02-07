import type { ButtonHTMLAttributes } from "react";
import styles from "@/styles/UI.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const baseClass = variant === "primary" ? styles.primaryButton : styles.secondaryButton;
  return <button className={`${baseClass} ${className}`} {...props} />;
}
