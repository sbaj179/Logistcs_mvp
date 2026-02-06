import "@/styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Logistics Operating System",
  description: "Operational control core for logistics execution"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
