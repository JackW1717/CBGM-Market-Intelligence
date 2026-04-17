import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBGM Market Intelligence Dashboard",
  description: "Daily market and macro news dashboard."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
